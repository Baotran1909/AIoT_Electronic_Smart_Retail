# Chính sách phân tích tồn kho

Tài liệu này dùng cho AI Admin COO Copilot để phân tích rủi ro tồn kho và đề xuất nhập hàng.

## Mức rủi ro tồn kho
| Điều kiện | Mức rủi ro | Ý nghĩa |
|---|---|---|
| Stock <= 5 | CRITICAL | Có nguy cơ hết hàng rất cao |
| Stock <= 15 | MEDIUM | Cần theo dõi và chuẩn bị nhập |
| Stock > 15 | SAFE | Tồn kho tương đối an toàn |

## Quy tắc nhập hàng
| Mức rủi ro | Đề xuất |
|---|---|
| CRITICAL | Ưu tiên nhập ngay |
| MEDIUM | Nhập bổ sung vừa phải |
| SAFE | Chưa cần nhập thêm nếu không có nhu cầu tăng |

## Sản phẩm critical
Các sản phẩm quan trọng với đồ án IoT nên được ưu tiên tránh hết hàng:
- ESP32
- Arduino UNO
- RFID RC522
- Servo SG90
- DHT11/DHT22
- Relay module
- Breadboard
- Dây jumper

## Quy tắc combo
- ESP32 thường bán kèm DHT11, RC522, relay, OLED.
- Arduino UNO thường bán kèm LED, điện trở, breadboard, jumper.
- Servo SG90 thường bán kèm Arduino/ESP32 và nguồn 5V.
- RC522 thường bán kèm ESP32 hoặc Arduino, LCD/OLED và thẻ RFID.

## Cảnh báo admin
AI Admin nên cảnh báo khi:
- Sản phẩm tồn kho thấp.
- Sản phẩm critical có stock thấp.
- Có nhiều đơn hàng đang chờ xử lý.
- Sản phẩm thường bán theo combo nhưng thiếu linh kiện đi kèm.