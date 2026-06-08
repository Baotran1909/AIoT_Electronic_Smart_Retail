# Servo SG90

Servo SG90 là động cơ servo nhỏ thường dùng để điều khiển góc quay trong robot, cảm biến quét và các cơ cấu cơ khí nhẹ.

## Đặc điểm chính
- Điều khiển bằng tín hiệu PWM.
- Góc quay thường khoảng 0 đến 180 độ.
- Cần nguồn ổn định, không nên cấp dòng lớn từ GPIO.

## Ứng dụng
- Robot car quét vật cản.
- Cửa tự động mini.
- Cơ cấu gạt hoặc xoay cảm biến.
- Mô hình cơ khí nhỏ.

## Lưu ý kỹ thuật
- Nên cấp nguồn 5V riêng nếu servo hoạt động tải nặng.
- Phải nối chung GND giữa nguồn servo và vi điều khiển.
- Không cấp servo trực tiếp từ chân GPIO.

## Thường dùng với
- Arduino UNO.
- ESP32.
- HC-SR04.
- Robot car.
- Pico.
