# Combo Strategy

Tài liệu này dùng cho Combo Recommendation Agent để đề xuất bộ linh kiện phù hợp theo nhu cầu dự án.

## Nguyên tắc đề xuất combo
- Combo phải phù hợp với mục tiêu dự án.
- Ưu tiên linh kiện có trong kho.
- Không đề xuất sản phẩm không có dữ liệu.
- Nếu sản phẩm chính hết hàng, gợi ý sản phẩm thay thế nếu có.

## Combo phổ biến
| Dự án | Combo đề xuất |
|---|---|
| Smart Home | ESP32 + Relay + DHT11 + LDR |
| Smart Lock RFID | ESP32 + RC522 + Relay + Solenoid Lock |
| Robot Car | Arduino/ESP32 + HC-SR04 + L298N + Motor |
| Smart Garden | ESP32 + Soil Sensor + Relay + Pump |
| Weather Station | ESP32 + DHT22 + OLED |

## Gợi ý mua thêm
- Breadboard và dây jumper cho người mới.
- Nguồn ngoài cho động cơ, relay hoặc khóa điện.
- Buzzer hoặc màn hình để tăng khả năng hiển thị/cảnh báo.
