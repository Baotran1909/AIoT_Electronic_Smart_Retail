from router import route_question


def supervisor_router(question: str, context: str = ""):
    q = question.lower()

    inventory_keywords = [
        "tồn kho", "số lượng", "còn hàng", "hết hàng",
        "nhập thêm", "kho", "inventory", "stock"
    ]

    combo_keywords = [
        "combo", "bộ linh kiện", "đề xuất bộ", "gợi ý bộ",
        "smart home", "smart locker", "aiot"
    ]

    technical_keywords = [
        "esp32", "arduino", "rfid", "rc522", "dht11", "dht22",
        "servo", "pca9685", "lcd", "i2c", "mqtt", "firebase",
        "cảm biến", "module", "vi điều khiển"
    ]

    if any(k in q for k in inventory_keywords):
        return "inventory_agent"

    if any(k in q for k in combo_keywords):
        return "combo_agent"

    if any(k in q for k in technical_keywords):
        return "consultant_agent"

    return "general_agent"


def explain_agent(agent: str) -> str:
    descriptions = {
        "consultant_agent": "Tư vấn kỹ thuật linh kiện IoT và hệ thống nhúng.",
        "combo_agent": "Đề xuất combo linh kiện và bán kèm theo nhu cầu dự án.",
        "inventory_agent": "Phân tích tồn kho, đơn hàng và đề xuất nhập hàng cho Admin.",
        "general_agent": "Hội thoại chung, fallback và xử lý truy vấn không an toàn.",
    }
    return descriptions.get(agent, descriptions["general_agent"])
