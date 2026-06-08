# Smart Garden

Smart Garden là hệ thống tưới cây tự động dựa trên cảm biến độ ẩm đất và điều khiển bơm nước qua relay.

## Linh kiện cần có
| Linh kiện | Vai trò |
|---|---|
| ESP32 | Bộ điều khiển IoT |
| Soil moisture sensor | Đo độ ẩm đất |
| Relay module | Điều khiển bơm nước |
| Bơm nước mini | Tưới cây |
| DHT11/DHT22 | Đo nhiệt độ, độ ẩm không khí |
| OLED/LCD | Hiển thị trạng thái |
| Nguồn ngoài | Cấp nguồn cho bơm |

## Lưu ý kỹ thuật
- Không cấp bơm trực tiếp từ GPIO.
- Cần relay hoặc MOSFET điều khiển bơm.
- Cảm biến độ ẩm đất loại điện cực dễ bị ăn mòn.
- Nên hiệu chỉnh ngưỡng tưới theo từng loại đất.

## Gợi ý combo
| Combo | Phù hợp |
|---|---|
| ESP32 + Soil Sensor + Relay + Pump | Tưới cây tự động |
| ESP32 + DHT22 + Soil Sensor + OLED | Giám sát nhà kính |
