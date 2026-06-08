import os
import re
import unicodedata
from pathlib import Path
from typing import List, Tuple, Dict, Any

try:
    from rank_bm25 import BM25Okapi
except Exception:
    BM25Okapi = None

try:
    from pyvi.ViTokenizer import tokenize
except Exception:
    def tokenize(text: str) -> str:
        return text
try:
    from qdrant_client import QdrantClient
except Exception:
    QdrantClient = None
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.preprocessing import normalize

from config.settings import KNOWLEDGE_DIR, QDRANT_URL, QDRANT_COLLECTION, VECTOR_SIZE, TOP_K

client = QdrantClient(url=QDRANT_URL) if QdrantClient is not None else None
vectorizer = HashingVectorizer(n_features=VECTOR_SIZE, alternate_sign=False, norm=None)


def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFC", text or "")
    text = text.lower().strip()
    text = re.sub(r"\s+", " ", text)
    return text


def embed_text(text: str) -> list[float]:
    vec = vectorizer.transform([text])
    vec = normalize(vec)
    return vec.toarray()[0].tolist()


def _load_documents() -> tuple[list[str], list[str]]:
    documents: list[str] = []
    sources: list[str] = []
    knowledge_dir = Path(KNOWLEDGE_DIR)
    if not knowledge_dir.exists():
        return documents, sources

    for file_path in sorted(knowledge_dir.glob("*.md")):
        try:
            text = file_path.read_text(encoding="utf-8")
        except Exception:
            continue
        documents.append(text)
        sources.append(file_path.name)
    return documents, sources


DOCUMENTS, SOURCES = _load_documents()
TOKENIZED_DOCS = [tokenize(doc).split() for doc in DOCUMENTS] if DOCUMENTS else [[]]
BM25 = BM25Okapi(TOKENIZED_DOCS) if (DOCUMENTS and BM25Okapi is not None) else None


PRIORITY_RULES: dict[str, list[str]] = {
    "rfid_rc522.md": ["rc522", "rfid", "thẻ từ", "mfrc522"],
    "esp32.md": ["esp32", "wifi", "bluetooth", "devkit"],
    "esp32_s3.md": ["esp32-s3", "esp32 s3", "s3"],
    "esp8266.md": ["esp8266", "nodemcu"],
    "arduino_uno.md": ["arduino", "uno"],
    "stm32.md": ["stm32", "bluepill", "stm32f103"],
    "servo_sg90.md": ["servo", "sg90"],
    "relay.md": ["relay", "rơ le", "role"],
    "dht11.md": ["dht11"],
    "dht22.md": ["dht22"],
    "lcd_i2c.md": ["lcd", "i2c", "lcd i2c", "20x4", "16x2"],
    "oled_ssd1306.md": ["oled", "ssd1306"],
    "ultrasonic_hcsr04.md": ["hc-sr04", "hcsr04", "siêu âm", "ultrasonic"],
    "pir_sensor.md": ["pir", "chuyển động"],
    "gas_mq2.md": ["mq2", "gas", "khí gas"],
    "ldr_sensor.md": ["ldr", "ánh sáng"],
    "soil_moisture.md": ["độ ẩm đất", "soil", "moisture"],
    "smart_home.md": ["smart home", "nhà thông minh"],
    "smart_lock.md": ["smart lock", "khóa cửa", "locker", "khóa thông minh"],
    "smart_garden.md": ["smart garden", "tưới cây", "vườn thông minh"],
    "robot_car.md": ["robot", "xe robot", "car"],
    "combo_strategy.md": ["combo", "kit", "bộ linh kiện", "mua kèm"],
    "upsell_strategy.md": ["upsell", "bán kèm", "mua thêm"],
    "inventory_strategy.md": ["tồn kho", "nhập hàng", "quản lý kho"],
    "stock_analysis.md": ["phân tích kho", "stock", "bán chạy", "bán chậm"],
    "firebase.md": ["firebase", "realtime database"],
    "mqtt.md": ["mqtt"],
    "websocket.md": ["websocket"],
}


def priority_retrieve(question: str) -> list[dict[str, Any]]:
    q = normalize_text(question)
    results = []
    for source, keywords in PRIORITY_RULES.items():
        if any(k in q for k in keywords):
            path = Path(KNOWLEDGE_DIR) / source
            if path.exists():
                results.append({
                    "text": path.read_text(encoding="utf-8"),
                    "source": source,
                    "score": 1.0,
                    "method": "priority",
                })
    return results


def bm25_retrieve(question: str, top_k: int = TOP_K) -> list[dict[str, Any]]:
    if not DOCUMENTS:
        return []
    tokenized_query = tokenize(question).split()

    if BM25 is not None:
        scores = BM25.get_scores(tokenized_query)
    else:
        # Fallback nhẹ khi môi trường chưa cài rank_bm25: chấm điểm theo số từ khóa trùng.
        q_terms = set(tokenized_query)
        scores = []
        for doc in DOCUMENTS:
            d_terms = set(tokenize(doc.lower()).split())
            scores.append(len(q_terms & d_terms) / max(len(q_terms), 1))

    top_idx = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]
    max_score = max(scores) if len(scores) else 1.0
    return [
        {
            "text": DOCUMENTS[i],
            "source": SOURCES[i],
            "score": float(scores[i] / max(max_score, 1e-9)),
            "method": "bm25" if BM25 is not None else "keyword_fallback",
        }
        for i in top_idx
        if scores[i] > 0
    ]


def qdrant_retrieve(question: str, top_k: int = TOP_K) -> list[dict[str, Any]]:
    if client is None:
        return []
    try:
        query_vector = embed_text(question)
        points = client.query_points(
            collection_name=QDRANT_COLLECTION,
            query=query_vector,
            limit=top_k,
        ).points
    except Exception:
        return []

    results = []
    for p in points:
        payload = p.payload or {}
        results.append({
            "text": payload.get("text", ""),
            "source": payload.get("source", "qdrant"),
            "score": float(getattr(p, "score", 0.0) or 0.0),
            "method": "qdrant",
        })
    return [r for r in results if r["text"]]


def simple_rerank(question: str, results: list[dict[str, Any]], top_k: int = TOP_K) -> list[dict[str, Any]]:
    q_terms = set(normalize_text(question).split())
    reranked = []
    for r in results:
        text_terms = set(normalize_text(r.get("text", "")).split())
        overlap = len(q_terms & text_terms) / max(len(q_terms), 1)
        method_bonus = {"priority": 0.2, "bm25": 0.1, "qdrant": 0.1}.get(r.get("method"), 0)
        r = dict(r)
        r["final_score"] = float(r.get("score", 0.0)) + overlap + method_bonus
        reranked.append(r)
    return sorted(reranked, key=lambda x: x["final_score"], reverse=True)[:top_k]


def hybrid_retrieve(question: str, top_k: int = TOP_K) -> list[dict[str, Any]]:
    merged = []
    merged.extend(priority_retrieve(question))
    merged.extend(bm25_retrieve(question, top_k=top_k))
    merged.extend(qdrant_retrieve(question, top_k=top_k))

    seen = set()
    unique = []
    for item in merged:
        key = (item.get("source"), item.get("text", "")[:120])
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)
    return simple_rerank(question, unique, top_k=top_k)


def retrieve_knowledge_with_sources(question: str, top_k: int = TOP_K) -> Tuple[str, List[str]]:
    results = hybrid_retrieve(question, top_k=top_k)
    knowledge = "\n\n".join(r["text"] for r in results)
    sources = []
    for r in results:
        if r["source"] not in sources:
            sources.append(r["source"])
    return knowledge, sources


def retrieve_knowledge(question: str, top_k: int = TOP_K) -> str:
    knowledge, _ = retrieve_knowledge_with_sources(question, top_k=top_k)
    return knowledge
