# RFID RC522

RFID RC522 là module đọc thẻ RFID, thường dùng trong hệ thống điểm danh, khóa cửa, kiểm soát ra vào và thanh toán nội bộ.

## Ứng dụng
- Hệ thống điểm danh RFID.
- Khóa cửa thông minh.
- Quản lý ra vào.
- Đọc thẻ sinh viên/thẻ nhân viên.
- Kết hợp với ESP32 để gửi dữ liệu lên Firebase.

## Thường dùng với
| Linh kiện | Vai trò |
|---|---|
| ESP32 | Xử lý và gửi dữ liệu WiFi |
| Arduino UNO | Xử lý cơ bản |
| Relay module | Điều khiển khóa cửa |
| LCD/OLED | Hiển thị trạng thái |
| Buzzer | Cảnh báo |
| Thẻ RFID | Dữ liệu nhận dạng |

## Lưu ý kỹ thuật
- RC522 thường giao tiếp SPI.
- Điện áp hoạt động thường là 3.3V.
- Khi dùng với Arduino UNO 5V cần chú ý mức logic.
- Khi dùng với ESP32 cần nối đúng chân SPI.
- Không nên cấp sai điện áp vì có thể làm hỏng module.

## Gợi ý combo
| Combo | Phù hợp |
|---|---|
| ESP32 + RC522 + LCD | Hệ thống điểm danh IoT |
| Arduino UNO + RC522 + Buzzer | Khóa cửa RFID cơ bản |
| ESP32 + RC522 + Relay | Khóa cửa thông minh |