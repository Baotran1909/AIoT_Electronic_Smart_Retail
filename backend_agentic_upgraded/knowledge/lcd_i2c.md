# LCD I2C

LCD I2C là màn hình ký tự thường dùng để hiển thị thông tin trạng thái trong các hệ thống nhúng và IoT.

## Đặc điểm chính
- Giao tiếp I2C giúp giảm số chân kết nối.
- Thường có loại 16x2 hoặc 20x4.
- Phù hợp hiển thị dữ liệu cảm biến hoặc trạng thái hệ thống.

## Ứng dụng
- Hiển thị nhiệt độ, độ ẩm.
- Hiển thị trạng thái RFID.
- Hiển thị trạng thái khóa cửa.
- Hệ thống điểm danh.

## Lưu ý kỹ thuật
- Cần kiểm tra địa chỉ I2C, thường là 0x27 hoặc 0x3F.
- Một số module dùng nguồn 5V.
- Khi dùng với ESP32 cần chú ý mức logic nếu module không tương thích 3.3V.

## Thường dùng với
- Arduino UNO.
- ESP32.
- DHT11/DHT22.
- RC522.
- RTC.
