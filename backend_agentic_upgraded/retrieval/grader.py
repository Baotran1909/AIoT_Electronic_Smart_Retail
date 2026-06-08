import re
import unicodedata

VI_STOPWORDS = {
    "là", "và", "của", "cho", "có", "không", "mình", "tôi", "bạn", "với", "thì",
    "này", "đó", "gì", "như", "nào", "được", "dùng", "cần", "về", "trong", "khi"
}


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFC", text or "").lower()
    text = re.sub(r"[^0-9a-zA-ZÀ-ỹ\s\-\.]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def grade_retrieval(question: str, knowledge: str) -> float:
    q_words = [w for w in normalize(question).split() if w not in VI_STOPWORDS and len(w) > 1]
    if not q_words:
        return 0.0
    knowledge_text = normalize(knowledge)
    matched = sum(1 for w in q_words if w in knowledge_text)
    return matched / max(len(q_words), 1)
