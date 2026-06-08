import time
from typing import TypedDict

try:
    from langgraph.graph import StateGraph, END
    LANGGRAPH_AVAILABLE = True
except Exception:
    StateGraph = None
    END = None
    LANGGRAPH_AVAILABLE = False

from agents.orchestrator import supervisor_router
from retrieval.hybrid_retriever import retrieve_knowledge_with_sources
from retrieval.grader import grade_retrieval
from services.web_search_service import web_fallback_search
from config.settings import GRADER_THRESHOLD
from services.llm_service import call_ai

DEBUG_REPORT = True


def report_log(title, data):
    if DEBUG_REPORT:
        print(f"\n===== {title} =====")
        print(data)


class AIState(TypedDict):
    question: str
    context: str
    user_id: str
    agent: str
    knowledge: str
    sources: list
    retrieval_score: float
    final_answer: str
    is_web_fallback: bool
    force_web_fallback: bool
    


def router_node(state: AIState) -> AIState:
    start = time.perf_counter()
    agent = supervisor_router(state["question"], state.get("context", ""))
    latency = (time.perf_counter() - start) * 1000000

    new_state = {**state, "agent": agent}

    report_log(
        "AFTER SUPERVISOR ROUTER",
        {
            "agent": agent,
            "latency_us": round(latency, 2),
        },
    )

    return new_state


def retrieve_node(state: AIState) -> AIState:
    start = time.perf_counter()
    knowledge, sources = retrieve_knowledge_with_sources(state["question"])
    latency = (time.perf_counter() - start) * 1000000

    new_state = {
        **state,
        "knowledge": knowledge,
        "sources": sources,
    }

    report_log(
        "AFTER HYBRID RETRIEVAL",
        {
            "sources": sources,
            "latency_us": round(latency, 2),
        },
    )

    return new_state


def grade_node(state: AIState) -> AIState:
    start = time.perf_counter()

    question = state["question"].lower()
    knowledge = state["knowledge"].lower()

    score = grade_retrieval(question, knowledge)

    # ===== SMART FALLBACK DETECTION =====

    important_words = [
        w for w in question.split()
        if len(w) > 2
    ]

    matched_words = [
        w for w in important_words
        if w in knowledge
    ]

    keyword_match_ratio = (
        len(matched_words) / max(len(important_words), 1)
    )

    # nếu retrieval không chứa keyword chính
    # => giảm mạnh score
    if keyword_match_ratio < 0.3:
        score *= 0.3

    latency = (time.perf_counter() - start) * 1000000

    new_state = {
        **state,
        "retrieval_score": score,
    }

    report_log(
        "AFTER RETRIEVAL GRADER",
        {
            "retrieval_score": round(score, 3),
            "keyword_match_ratio": round(keyword_match_ratio, 3),
            "matched_words": matched_words,
            "latency_us": round(latency, 2),
        },
    )

    return new_state


def web_fallback_node(state: AIState) -> AIState:

    print("\n===== WEB FALLBACK ACTIVATED =====")

    web_knowledge = web_fallback_search(
        state["question"]
    )

    print("\n===== WEB RESULTS =====")
    print(web_knowledge[:1000])

    return {
        **state,
        "knowledge": web_knowledge,
        "sources": ["web_fallback"],
        "retrieval_score": 1.0,
        "is_web_fallback": True,
        "agent": "web_search_agent"
    }


def generate_node(state: AIState) -> AIState:
    knowledge = state.get("knowledge", "")
    print("\n===== GENERATE NODE =====")
    print("AGENT =", state["agent"])

    q = state["question"].lower()
    agent = state.get("agent", "")

    security_keywords = [
        "bỏ qua",
        "admin",
        "doanh thu bí mật",
        "database",
        "jailbreak",
        "system prompt"
    ]

    is_attack = any(k in q for k in security_keywords)
    is_web_fallback = "WEB FALLBACK:" in state["knowledge"]

    # ===== DEFAULT FALLBACK =====
    answer = f"""
Câu hỏi người dùng:
{state['question']}

Tri thức truy xuất:
{state['knowledge'][:2000]}

Hãy trả lời rõ ràng, dễ hiểu và đúng trọng tâm.
"""

    # ===== SECURITY =====
    if is_attack:
        answer = """
Xin lỗi, tôi không có quyền truy cập dữ liệu quản trị nội bộ.
"""

    # ===== COMBO =====
    elif agent == "combo_agent":

        answer = f"""
    Bạn là AI Combo Recommendation Agent chuyên tư vấn bộ linh kiện IoT.

    Người dùng muốn:
    {state['question']}

    Tri thức truy xuất:
    {state['knowledge'][:1800]}

    Yêu cầu:
    - Đề xuất combo linh kiện phù hợp
    - Giải thích vai trò từng linh kiện
    - Nêu lý do lựa chọn
    - Có thể đề xuất linh kiện thay thế nếu hết hàng
    - KHÔNG phân tích tồn kho dạng báo cáo admin
    - KHÔNG tạo bảng inventory
    - Trả lời thân thiện và dễ hiểu
    """

    # ===== INVENTORY =====
    elif agent in ["inventory_agent", "inventory"]:
        answer = f"""
Hệ thống xác định đây là yêu cầu phân tích tồn kho.

Tri thức liên quan:
{state['knowledge'][:1800]}

Hãy:
- Phân tích tồn kho
- Đề xuất nhập hàng
- Nêu sản phẩm cần chú ý
"""

    elif agent == "general_agent":
        final_prompt = f"""
    Bạn là AI Smart Retail Assistant.

    Câu hỏi:
    {state['question']}

    Thông tin truy xuất:
    {knowledge[:1800]}

    Yêu cầu:
    - Trả lời tự nhiên, đúng trọng tâm.
    - Không tự nhận là , Inventory Agent hay Combo Agent.
    - Nếu câu hỏi ngoài phạm vi Smart Retail/IoT thì trả lời như trợ lý chung.
    - Nếu không đủ dữ liệu thì nói rõ chưa đủ thông tin.
    """

    # ===== TECHNICAL =====
    elif agent in [
        "consultant_agent",
        "technical_agent",
        "technical",
        "consultant"
    ]:
        answer = f"""
Hệ thống xác định đây là yêu cầu tư vấn kỹ thuật.

Tri thức liên quan:
{state['knowledge'][:1800]}

Hãy:
- Giải thích kỹ thuật dễ hiểu
- Trả lời đúng trọng tâm
- Không bịa thông tin
"""

    # ===== WEB FALLBACK =====
    elif is_web_fallback:
        answer = f"""
Dữ liệu nội bộ chưa đủ nên đã kích hoạt web fallback.

Thông tin:
{state['knowledge'][:2500]}
"""

    return {
        **state,
        "final_answer": answer
    }


def route_after_grade(state: AIState) -> str:
    no_sources = len(state["sources"]) == 0
    low_score = state["retrieval_score"] < GRADER_THRESHOLD
    force_web = state.get("force_web_fallback", False)

    if no_sources or low_score or force_web:
        return "web_fallback"

    return "generate"


def _run_fallback_graph(initial_state: AIState) -> AIState:
    """Fallback pipeline khi môi trường chưa cài langgraph."""
    state = router_node(initial_state)
    state = retrieve_node(state)
    state = grade_node(state)

    if route_after_grade(state) == "web_fallback":
        state = web_fallback_node(state)

    state = generate_node(state)
    return state


if LANGGRAPH_AVAILABLE:
    graph = StateGraph(AIState)

    graph.add_node("router", router_node)
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("grade", grade_node)
    graph.add_node("web_fallback", web_fallback_node)
    graph.add_node("generate", generate_node)

    graph.set_entry_point("router")

    graph.add_edge("router", "retrieve")
    graph.add_edge("retrieve", "grade")

    graph.add_conditional_edges(
        "grade",
        route_after_grade,
        {
            "web_fallback": "web_fallback",
            "generate": "generate",
        },
    )

    graph.add_edge("web_fallback", "generate")
    graph.add_edge("generate", END)

    app_graph = graph.compile()
else:
    app_graph = None


def run_ai_graph(
    question: str,
    context: str = "",
    user_id: str = "guest",
) -> AIState:
    initial_state: AIState = {
        "question": question,
        "context": context,
        "user_id": user_id,
        "agent": "",
        "knowledge": "",
        "sources": [],
        "retrieval_score": 0.0,
        "final_answer": "",
        "is_web_fallback": False,
        "force_web_fallback": False,
    }

    if app_graph is None:
        return _run_fallback_graph(initial_state)

    return app_graph.invoke(initial_state)