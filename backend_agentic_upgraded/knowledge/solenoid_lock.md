# Solenoid Lock

Solenoid lock là khóa điện từ dùng trong các hệ thống khóa cửa thông minh, kiểm soát ra vào và tủ locker.

## Đặc điểm chính
- Hoạt động bằng cuộn điện từ.
- Thường cần nguồn 12V hoặc nguồn riêng tùy loại.
- Không điều khiển trực tiếp từ GPIO.

## Ứng dụng
- Khóa cửa RFID.
- Smart locker.
- Kiểm soát ra vào.
- Tủ nhận hàng tự động.

## Lưu ý kỹ thuật
- Cần relay hoặc MOSFET để điều khiển.
- Nên dùng diode chống ngược nếu điều khiển cuộn cảm.
- Cần nguồn đủ dòng cho khóa.
- Phải nối chung GND nếu điều khiển bằng vi điều khiển.

## Thường dùng với
- ESP32.
- RC522.
- Relay module.
- Nguồn 12V.
- Buzzer.
