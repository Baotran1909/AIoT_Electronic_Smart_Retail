# Buzzer

Buzzer là linh kiện phát âm thanh cảnh báo, thường dùng để báo trạng thái, cảnh báo lỗi hoặc xác nhận thao tác trong hệ thống IoT.

## Đặc điểm chính
- Có loại active buzzer và passive buzzer.
- Active buzzer chỉ cần cấp tín hiệu ON/OFF.
- Passive buzzer cần tín hiệu PWM để tạo âm.

## Ứng dụng
- Cảnh báo truy cập sai.
- Báo quét thẻ RFID thành công.
- Cảnh báo gas hoặc khói.
- Báo chuyển động PIR.

## Lưu ý kỹ thuật
- Không nên cấp dòng vượt mức GPIO cho buzzer lớn.
- Có thể dùng transistor nếu cần dòng cao.
- Cần phân biệt active và passive buzzer khi lập trình.

## Thường dùng với
- RC522 RFID.
- PIR sensor.
- MQ-2.
- ESP32.
- Arduino UNO.
