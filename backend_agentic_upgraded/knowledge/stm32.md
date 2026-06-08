# STM32

STM32 là dòng vi điều khiển ARM Cortex-M, phù hợp cho các ứng dụng nhúng yêu cầu hiệu năng cao, nhiều ngoại vi và khả năng xử lý thời gian thực tốt.

## Đặc điểm chính
- Hiệu năng cao hơn các board Arduino cơ bản.
- Có nhiều dòng khác nhau như STM32F103, STM32F4.
- Hỗ trợ GPIO, ADC, PWM, I2C, SPI, UART.
- Logic thường là 3.3V.

## Ứng dụng
- Điều khiển công nghiệp nhỏ.
- Hệ thống cảm biến thời gian thực.
- Giao tiếp module ngoại vi.
- Dự án nhúng nâng cao.

## Lưu ý kỹ thuật
- Cần cấu hình clock và ngoại vi chính xác.
- Không cấp 5V vào chân không tolerant 5V.
- Debug thường dùng ST-Link.

## Thường dùng với
- LCD I2C.
- DHT11/DHT22.
- RC522.
- Relay.
- Cảm biến analog.
