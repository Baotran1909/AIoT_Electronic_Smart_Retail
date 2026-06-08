# OLED SSD1306

OLED SSD1306 là màn hình nhỏ dùng giao tiếp I2C hoặc SPI, thường dùng trong các dự án IoT cần hiển thị thông tin gọn nhẹ.

## Đặc điểm chính
- Hiển thị rõ, tiêu thụ ít điện.
- Thường có độ phân giải 128x64.
- Dùng I2C giúp tiết kiệm chân.

## Ứng dụng
- Hiển thị dữ liệu cảm biến.
- Thiết bị đeo mini.
- Trạm thời tiết IoT.
- Hiển thị trạng thái khóa cửa.

## Lưu ý kỹ thuật
- Cần kiểm tra địa chỉ I2C.
- Một số thư viện cần đúng kích thước màn hình.
- Nên tránh hiển thị tĩnh quá lâu nếu lo ngại lưu ảnh.

## Thường dùng với
- ESP32.
- ESP8266.
- Raspberry Pi Pico.
- DHT22.
- LDR.
