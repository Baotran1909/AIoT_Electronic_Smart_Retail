# Weather Station IoT

Weather Station IoT là trạm thời tiết nhỏ dùng để đo nhiệt độ, độ ẩm, ánh sáng hoặc mưa và gửi dữ liệu lên dashboard.

## Linh kiện cần có
| Linh kiện | Vai trò |
|---|---|
| ESP32 | Bộ điều khiển và gửi dữ liệu WiFi |
| DHT22 hoặc DHT11 | Đo nhiệt độ, độ ẩm |
| LDR Sensor | Đo ánh sáng |
| Rain Sensor | Phát hiện mưa |
| OLED/LCD | Hiển thị dữ liệu |
| Firebase/MQTT | Đồng bộ dữ liệu |

## Lưu ý kỹ thuật
- Cần đặt cảm biến tránh nguồn nhiệt trực tiếp.
- Cảm biến mưa cần bảo vệ module điều khiển khỏi nước.
- Nên dùng DHT22 nếu cần độ chính xác cao hơn DHT11.

## Gợi ý combo
| Combo | Phù hợp |
|---|---|
| ESP32 + DHT22 + OLED | Trạm thời tiết cơ bản |
| ESP32 + DHT22 + LDR + Rain Sensor | Trạm thời tiết mở rộng |
