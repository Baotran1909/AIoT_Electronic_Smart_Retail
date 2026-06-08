# Relay Module

Relay là module dùng để điều khiển tải công suất lớn bằng tín hiệu điều khiển nhỏ từ vi điều khiển.

## Đặc điểm chính
- Có thể điều khiển tải AC hoặc DC.
- Thường dùng module relay 1 kênh, 2 kênh hoặc nhiều kênh.
- Ngõ điều khiển có thể active LOW hoặc active HIGH tùy module.

## Ứng dụng
- Bật/tắt đèn, quạt.
- Điều khiển khóa cửa điện.
- Điều khiển bơm nước.
- Smart home.

## Lưu ý kỹ thuật
- Không cấp tải lớn trực tiếp từ GPIO.
- Khi điều khiển điện AC cần đảm bảo an toàn cách điện.
- Nên dùng nguồn riêng nếu relay tiêu thụ dòng lớn.
- Cần nối chung GND với vi điều khiển khi dùng nguồn riêng.

## Thường dùng với
- ESP32.
- Arduino UNO.
- PIR sensor.
- DHT11/DHT22.
- Solenoid lock.
