# ESP32

ESP32 là vi điều khiển tích hợp WiFi và Bluetooth, thường dùng trong các dự án IoT, smart home, robot điều khiển không dây và hệ thống giám sát dữ liệu.

## Đặc điểm chính
- Có WiFi/Bluetooth tích hợp.
- Hoạt động mức logic 3.3V.
- Có nhiều GPIO, hỗ trợ ADC, PWM, I2C, SPI, UART.
- Phù hợp Firebase, MQTT, Web Server, Blynk và các ứng dụng IoT.

## Ứng dụng
- Smart home.
- Khóa cửa RFID.
- Trạm giám sát nhiệt độ, độ ẩm.
- Robot điều khiển WiFi.
- Hệ thống điểm danh IoT.

## Lưu ý kỹ thuật
- Không cấp 5V trực tiếp vào chân GPIO.
- Nên dùng nguồn ổn định 5V qua chân VIN hoặc cổng USB.
- Khi giao tiếp với module 5V cần chú ý mức logic.
- Nên nối chung GND giữa ESP32 và các module ngoại vi.

## Thường dùng với
- RC522 RFID.
- Relay module.
- DHT11/DHT22.
- OLED/LCD I2C.
- Servo SG90.
- Cảm biến PIR, LDR, HC-SR04.
