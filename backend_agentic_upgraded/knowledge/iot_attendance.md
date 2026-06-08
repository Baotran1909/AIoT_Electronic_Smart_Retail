# IoT Attendance RFID

Hệ thống điểm danh IoT sử dụng thẻ RFID để nhận diện người dùng và gửi dữ liệu lên server hoặc Google Sheets/Firebase.

## Linh kiện cần có
| Linh kiện | Vai trò |
|---|---|
| ESP32 | Gửi dữ liệu qua WiFi |
| RFID RC522 | Đọc thẻ RFID |
| LCD/OLED | Hiển thị thông tin người dùng |
| Buzzer | Báo quét thẻ |
| RTC | Ghi thời gian điểm danh |
| Firebase/Google Sheets | Lưu dữ liệu |

## Lưu ý kỹ thuật
- RC522 sử dụng giao tiếp SPI.
- RC522 hoạt động 3.3V.
- Cần kiểm tra trùng mã thẻ.
- Nếu cần thời gian chính xác nên dùng RTC hoặc đồng bộ NTP.

## Gợi ý combo
| Combo | Phù hợp |
|---|---|
| ESP32 + RC522 + LCD | Điểm danh IoT cơ bản |
| ESP32 + RC522 + RTC + Buzzer | Điểm danh có thời gian và cảnh báo |
