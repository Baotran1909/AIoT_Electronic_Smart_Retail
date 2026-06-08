# Upsell Strategy

Tài liệu này hỗ trợ AI đề xuất sản phẩm mua kèm nhằm tăng giá trị đơn hàng trong shop linh kiện IoT.

## Nguyên tắc upsell
- Gợi ý sản phẩm mua kèm phải có liên quan kỹ thuật.
- Không gợi ý quá nhiều sản phẩm gây rối.
- Ưu tiên sản phẩm giúp dự án hoạt động ổn định hơn.

## Ví dụ upsell
| Sản phẩm chính | Nên gợi ý thêm | Lý do |
|---|---|---|
| ESP32 | Breadboard, dây jumper | Dễ lắp mạch thử |
| RC522 | Thẻ RFID, buzzer | Hoàn thiện hệ thống RFID |
| Relay | Nguồn ngoài, diode | Điều khiển tải an toàn |
| Servo SG90 | Nguồn 5V riêng | Tránh sụt áp |
| HC-SR04 | Servo SG90 | Quét vật cản trong robot |

## Lưu ý
- Nếu dữ liệu kho không có sản phẩm, không được tự bịa.
- Cần giải thích ngắn gọn lý do đề xuất.
