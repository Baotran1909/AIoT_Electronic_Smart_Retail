# DC Motor

Động cơ DC dùng để tạo chuyển động quay trong robot, xe điều khiển và các mô hình cơ khí.

## Đặc điểm chính
- Cần dòng lớn hơn khả năng GPIO.
- Cần driver động cơ để điều khiển tốc độ và chiều quay.
- Có thể điều khiển tốc độ bằng PWM.

## Ứng dụng
- Robot car.
- Băng tải mini.
- Quạt mini.
- Cơ cấu quay đơn giản.

## Lưu ý kỹ thuật
- Không cấp động cơ trực tiếp từ vi điều khiển.
- Cần dùng driver như L298N hoặc TB6612.
- Nên tách nguồn động cơ và nguồn vi điều khiển nếu dòng lớn.
- Phải nối chung GND giữa các khối nguồn.

## Thường dùng với
- L298N.
- Arduino UNO.
- ESP32.
- Robot car.
- Pin hoặc nguồn ngoài.
