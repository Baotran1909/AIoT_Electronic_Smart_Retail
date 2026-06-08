# Smart Home Mini

Smart Home Mini là hệ thống nhà thông minh nhỏ, thường dùng ESP32 để điều khiển thiết bị qua WiFi.

## Linh kiện cần có
| Linh kiện | Công dụng |
|---|---|
| ESP32 | Bộ điều khiển IoT chính |
| Relay module | Bật/tắt thiết bị |
| DHT11/DHT22 | Đo nhiệt độ, độ ẩm |
| Cảm biến ánh sáng | Tự động bật/tắt đèn |
| OLED/LCD | Hiển thị trạng thái |
| Buzzer | Cảnh báo |
| Breadboard | Cắm thử mạch |
| Dây jumper | Kết nối |

## Vì sao nên dùng ESP32?
- Có WiFi/Bluetooth tích hợp.
- Phù hợp Firebase, Blynk, MQTT, web server.
- Có nhiều GPIO.
- Giá hợp lý cho đồ án IoT.

## Lưu ý kỹ thuật
- Relay điều khiển tải AC cần chú ý an toàn điện.
- ESP32 dùng logic 3.3V.
- Nên dùng nguồn ổn định.
- Khi điều khiển thiết bị công suất cao cần cách ly an toàn.

## Gợi ý combo
| Combo | Phù hợp |
|---|---|
| ESP32 + Relay + DHT11 | Smart home cơ bản |
| ESP32 + OLED + DHT11 | Trạm giám sát nhiệt độ |
| ESP32 + Relay + cảm biến ánh sáng | Điều khiển đèn tự động |
