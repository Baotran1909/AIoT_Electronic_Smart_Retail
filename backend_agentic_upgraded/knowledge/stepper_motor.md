# Stepper Motor

Động cơ bước dùng để điều khiển vị trí quay chính xác hơn động cơ DC thông thường, thường dùng trong máy CNC mini, robot và cơ cấu định vị.

## Đặc điểm chính
- Điều khiển theo từng bước.
- Cần driver động cơ bước.
- Có thể giữ vị trí khi cấp dòng.

## Ứng dụng
- Máy CNC mini.
- Robot cơ khí.
- Cơ cấu quay chính xác.
- Máy in 3D mini.

## Lưu ý kỹ thuật
- Không điều khiển trực tiếp từ GPIO.
- Cần driver như A4988, ULN2003 tùy loại động cơ.
- Cần nguồn phù hợp dòng tải.

## Thường dùng với
- Arduino UNO.
- STM32.
- Driver A4988.
- ULN2003.
