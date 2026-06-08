import re
import unicodedata


def normalize_text(text: str) -> str:
    return text.lower().strip()


def has_any(text: str, keywords: list) -> bool:
    return any(k in text for k in keywords)


def route_question(question: str) -> str:
    q = normalize_text(question)

    inventory_keywords = [
        "tồn kho", "còn hàng", "còn bao nhiêu",
        "hết hàng", "sắp hết", "nhập thêm",
        "cần nhập", "phân tích kho",
        "doanh thu", "đơn hàng"
    ]

    combo_keywords = [
        "combo", "bộ linh kiện", "set linh kiện",
        "kit", "trọn bộ", "gợi ý bộ",
        "đề xuất bộ", "danh sách linh kiện"
    ]

    consultant_keywords = [
        "là gì", "dùng để làm gì", "hoạt động",
        "nguyên lý", "kết nối", "đấu nối",
        "so sánh", "khác nhau", "hỗ trợ",
        "tương thích", "lỗi", "sửa lỗi",

        "esp32", "esp8266", "arduino", "stm32",
        "raspberry", "rc522", "rfid",
        "dht11", "dht22", "servo", "sg90",
        "relay", "lcd", "oled",
        "mqtt", "wifi", "bluetooth",
        "i2c", "spi", "uart", "pwm",
        "cảm biến", "module", "vi điều khiển"
    ]

    if has_any(q, inventory_keywords):
        return "inventory_agent"

    if has_any(q, combo_keywords):
        return "combo_agent"

    if has_any(q, consultant_keywords):
        return "consultant_agent"

    return "general_agent"
# Alias mới để mô tả đúng kiến trúc Supervisor-based Multi-Agent RAG
def supervisor_router(question: str, context: str = "") -> str:
    combined = f"{context}\n{question}" if context else question
    return route_question(combined)
