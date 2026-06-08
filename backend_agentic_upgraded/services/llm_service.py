import json
import requests
from config.settings import OPENROUTER_API_KEY, OPENROUTER_API_URL, MODEL_NAME
from dotenv import load_dotenv
load_dotenv()


def call_ai(prompt: str, temperature: float = 0.6, max_tokens: int = 2000) -> dict:
    if not OPENROUTER_API_KEY:
        return {
            "answer": "🚨 Thiếu OPENROUTER_API_KEY. Hãy tạo file .env hoặc set biến môi trường trước khi chạy backend."
        }

    try:
        response = requests.post(
            OPENROUTER_API_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL_NAME,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
            timeout=30,
        )
        result = response.json()
        print("API KEY:", OPENROUTER_API_KEY[:20])
        if "choices" not in result:
            return {"answer": f"🚨 OpenRouter Error\n\n{result}"}
        return {"answer": result["choices"][0]["message"]["content"]}
    except Exception as e:
        return {"answer": f"🚨 AI Backend lỗi\n\n{str(e)}"}


def stream_ai(prompt: str, temperature: float = 0.6):
    if not OPENROUTER_API_KEY:
        yield "🚨 Thiếu OPENROUTER_API_KEY."
        return

    response = requests.post(
        OPENROUTER_API_URL,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL_NAME,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "stream": True,
        },
        stream=True,
        timeout=60,
    )

    for line in response.iter_lines():
        if not line:
            continue
        decoded = line.decode("utf-8")
        if not decoded.startswith("data: "):
            continue
        data_str = decoded[6:]
        if data_str == "[DONE]":
            break
        try:
            data_json = json.loads(data_str)
            delta = data_json["choices"][0].get("delta", {})
            content = delta.get("content", "")
            if content:
                yield content
        except Exception:
            continue
