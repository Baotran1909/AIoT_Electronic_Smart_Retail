# ESP32-S3

ESP32-S3 là dòng vi điều khiển nâng cao của Espressif, phù hợp cho các ứng dụng IoT cần nhiều GPIO, xử lý tín hiệu tốt hơn và hỗ trợ các tác vụ AI nhẹ ở biên.

## Đặc điểm chính
- Tích hợp WiFi và Bluetooth LE.
- Hỗ trợ nhiều GPIO hơn các board ESP32 phổ thông.
- Phù hợp cho giao diện người dùng, xử lý cảm biến, camera hoặc các ứng dụng IoT nâng cao.
- Logic hoạt động 3.3V.

## Ứng dụng
- Smart home nâng cao.
- Thiết bị IoT có giao diện hiển thị.
- Hệ thống giám sát cảm biến.
- Robot IoT.

## Lưu ý kỹ thuật
- Cần kiểm tra sơ đồ chân của từng board ESP32-S3 cụ thể.
- Không cấp 5V trực tiếp vào GPIO.
- Nên dùng nguồn ổn định nếu kết nối nhiều cảm biến hoặc màn hình.

## Thường dùng với
- OLED SSD1306.
- LCD I2C.
- DHT22.
- Cảm biến ánh sáng.
- Relay module.
