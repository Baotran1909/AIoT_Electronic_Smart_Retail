# Robot Car

Robot car là dự án phổ biến cho sinh viên học điều khiển động cơ, cảm biến và lập trình nhúng.

## Linh kiện cần có
| Linh kiện | Công dụng |
|---|---|
| Arduino UNO hoặc ESP32 | Bộ điều khiển chính |
| Cảm biến siêu âm HC-SR04 | Phát hiện vật cản |
| Driver động cơ L298N | Điều khiển động cơ DC |
| Động cơ DC | Tạo chuyển động |
| Khung xe robot | Lắp ráp cơ khí |
| Pin hoặc nguồn ngoài | Cấp nguồn |
| Dây jumper | Kết nối mạch |

## Nên chọn Arduino hay ESP32?
| Lựa chọn | Phù hợp |
|---|---|
| Arduino UNO | Người mới, robot cơ bản |
| ESP32 | Robot IoT, điều khiển qua WiFi/Bluetooth |

## Lưu ý kỹ thuật
- Không cấp động cơ trực tiếp từ chân vi điều khiển.
- Cần dùng driver động cơ.
- Nguồn động cơ nên tách riêng với nguồn vi điều khiển nếu dòng lớn.
- Cần nối chung GND giữa các khối nguồn.

## Gợi ý combo
| Combo | Mục đích |
|---|---|
| Arduino + HC-SR04 + L298N | Robot tránh vật cản cơ bản |
| ESP32 + L298N + Motor | Robot điều khiển WiFi |
| Servo SG90 + HC-SR04 | Quét vật cản bằng cảm biến xoay |
