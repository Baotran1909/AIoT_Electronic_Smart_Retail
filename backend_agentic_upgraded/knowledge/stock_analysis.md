# Stock Analysis Policy

Tài liệu này quy định cách Inventory Agent phân tích tồn kho và đưa ra nhận định quản trị.

## Quy tắc đánh giá
- Stock bằng 0: hết hàng, cần nhập ngay nếu sản phẩm quan trọng.
- Stock thấp: có nguy cơ thiếu hàng.
- Stock cao: cần theo dõi tốc độ bán.
- Sản phẩm liên quan combo có thể được đề xuất bán kèm.

## Phân tích sản phẩm
Inventory Agent nên xem xét:
- Số lượng tồn kho.
- Tần suất bán.
- Vai trò của sản phẩm trong các combo.
- Mức độ phổ biến trong dự án IoT.

## Đề xuất hành động
- Nhập thêm hàng.
- Tạo combo.
- Cảnh báo admin.
- Theo dõi xu hướng bán.
- Ưu tiên sản phẩm thiết yếu như ESP32, relay, sensor phổ biến.
