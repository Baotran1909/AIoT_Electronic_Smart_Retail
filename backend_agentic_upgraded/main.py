from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from config.settings import ALLOWED_ORIGINS
from services.llm_service import call_ai, stream_ai
from workflows.ai_graph import run_ai_graph
from memory import save_user_memory, get_user_memory
from logger import save_ai_log
from agents.consultant_agent import consultant_prompt
from agents.combo_agent import combo_prompt
from agents.inventory_agent import inventory_prompt
from agents.general_agent import general_prompt
from tools.inventory_tool import build_inventory_context

app = FastAPI(title="AIoT Smart Retail AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskRequest(BaseModel):
    question: str
    context: str = ""
    user_id: str = "guest"
    history: list = []


@app.get("/")
def home():
    return {"status": "AI Backend Running", "architecture": "Supervisor-based Multi-Agent Hybrid RAG"}


@app.get("/health")
def health():
    return {"ok": True}


def _history_to_text(history: list) -> str:
    return "\n".join([
        f"{m.get('role')}: {m.get('content') or m.get('text') or ''}"
        for m in history[-6:]
    ])


def _update_memory(question: str, user_id: str):
    q = question.lower()
    if "mới học" in q or "người mới" in q or "beginner" in q:
        save_user_memory(user_id, "level", "beginner")
    if "nâng cao" in q or "advanced" in q:
        save_user_memory(user_id, "level", "advanced")
    if "arduino" in q:
        save_user_memory(user_id, "interest", "arduino")
    if "esp32" in q:
        save_user_memory(user_id, "interest", "esp32")


def build_prompt(data: AskRequest, force_agent: str | None = None):
    _update_memory(data.question, data.user_id)
    memory = get_user_memory(data.user_id)

    graph_result = run_ai_graph(data.question, data.context, data.user_id)
    knowledge = graph_result["knowledge"]
    sources = graph_result["sources"]
    agent = force_agent or graph_result["agent"]

    source_text = ", ".join(sources) if sources else "Không rõ nguồn"
    history_text = _history_to_text(data.history)
    inventory_context = build_inventory_context(data.context)

    knowledge += f"\n\nNGUỒN TRI THỨC NỘI BỘ: {source_text}"
    knowledge += f"\n\nLỊCH SỬ HỘI THOẠI:\n{history_text}"
    knowledge += f"\n\nPHÂN TÍCH NHANH DỮ LIỆU KHO TỪ CONTEXT:\n{inventory_context}"

    if agent == "combo_agent":
        prompt = combo_prompt(data.question, knowledge, data.context)
    elif agent == "inventory_agent":
        prompt = inventory_prompt(data.question, knowledge, data.context)
    elif agent == "general_agent":
        prompt = general_prompt(data.question, knowledge, data.context)
    else:
        prompt = consultant_prompt(data.question, knowledge, data.context, memory)

    return prompt, graph_result, agent, sources


@app.post("/user-ai")
async def user_ai(data: AskRequest):
    prompt, graph_result, agent, sources = build_prompt(data)
    result = call_ai(prompt)
    save_ai_log({
        "type": "user-ai",
        "question": data.question,
        "agent": agent,
        "sources": sources,
        "retrieval_score": graph_result.get("retrieval_score", 0),
        "answer": result.get("answer", ""),
    })
    return {
        **result,
        "agent": agent,
        "sources": sources,
        "retrieval_score": graph_result.get("retrieval_score", 0),
    }


@app.post("/admin-ai")
async def admin_ai(data: AskRequest):
    prompt, graph_result, agent, sources = build_prompt(data, force_agent="inventory_agent")
    result = call_ai(prompt)
    save_ai_log({
        "type": "admin-ai",
        "question": data.question,
        "agent": "inventory_agent",
        "sources": sources,
        "retrieval_score": graph_result.get("retrieval_score", 0),
        "answer": result.get("answer", ""),
    })
    return {
        **result,
        "agent": "inventory_agent",
        "sources": sources,
        "retrieval_score": graph_result.get("retrieval_score", 0),
    }


@app.post("/ask-ai")
async def ask_ai(data: AskRequest):
    return await admin_ai(data)


@app.post("/user-ai-stream")
async def user_ai_stream(data: AskRequest):
    prompt, _, _, _ = build_prompt(data)
    return StreamingResponse(stream_ai(prompt), media_type="text/plain")
