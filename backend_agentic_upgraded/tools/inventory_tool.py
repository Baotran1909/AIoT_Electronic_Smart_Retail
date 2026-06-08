import json
from typing import Any


def extract_products_from_context(context: str) -> list[dict[str, Any]]:
    """Cố gắng đọc dữ liệu products từ context JSON hoặc text frontend gửi lên."""
    if not context:
        return []
    try:
        data = json.loads(context)
        if isinstance(data, dict):
            if isinstance(data.get("products"), list):
                return data["products"]
            if isinstance(data.get("items"), list):
                return data["items"]
        if isinstance(data, list):
            return data
    except Exception:
        return []
    return []


def check_low_stock(context: str, threshold: int = 5) -> list[dict[str, Any]]:
    products = extract_products_from_context(context)
    low_stock = []
    for p in products:
        try:
            stock = int(p.get("stock", 0))
        except Exception:
            stock = 0
        if stock <= threshold:
            low_stock.append({
                "name": p.get("name", "Không rõ"),
                "stock": stock,
                "category": p.get("category", ""),
                "location": p.get("location", ""),
            })
    return low_stock


def build_inventory_context(context: str) -> str:
    low_stock = check_low_stock(context)
    if not low_stock:
        return "Không phát hiện sản phẩm tồn kho thấp từ context hiện tại hoặc context không phải JSON."
    lines = ["SẢN PHẨM TỒN KHO THẤP:"]
    for item in low_stock[:20]:
        lines.append(f"- {item['name']} | stock={item['stock']} | category={item['category']} | location={item['location']}")
    return "\n".join(lines)
