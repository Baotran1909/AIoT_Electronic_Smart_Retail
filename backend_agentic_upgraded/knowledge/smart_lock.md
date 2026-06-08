# Smart Lock RFID

Smart Lock RFID là hệ thống khóa cửa thông minh sử dụng thẻ RFID để xác thực người dùng và điều khiển khóa điện.

## Linh kiện cần có
| Linh kiện | Vai trò |
|---|---|
| ESP32 | Bộ điều khiển chính, gửi dữ liệu IoT |
| RFID RC522 | Đọc thẻ RFID |
| Relay module | Điều khiển khóa điện |
| Solenoid lock | Cơ cấu khóa/mở cửa |
| Buzzer | Cảnh báo đúng/sai |
| LCD/OLED | Hiển thị trạng thái |
| Nguồn 12V | Cấp nguồn cho khóa điện |
| Dây jumper | Kết nối |

## Lưu ý kỹ thuật
- RC522 hoạt động ở mức 3.3V.
- RC522 thường giao tiếp SPI.
- Không cấp 5V trực tiếp cho RC522.
- Khóa điện cần nguồn riêng đủ dòng.
- Relay hoặc MOSFET dùng để điều khiển khóa.
- Cần nối chung GND giữa mạch điều khiển và nguồn khóa nếu cần.

## Gợi ý combo
| Combo | Phù hợp |
|---|---|
| ESP32 + RC522 + Relay | Khóa RFID cơ bản |
| ESP32 + RC522 + Relay + Solenoid Lock | Khóa cửa hoàn chỉnh |
| ESP32 + RC522 + LCD + Buzzer | Hệ thống có hiển thị và cảnh báo |
