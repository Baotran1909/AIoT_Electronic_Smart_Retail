# WebSocket

WebSocket là giao thức cho phép kết nối hai chiều giữa client và server, phù hợp cho các hệ thống cần cập nhật dữ liệu liên tục.

## Ứng dụng
- Dashboard realtime.
- Chat realtime.
- Theo dõi trạng thái đơn hàng.
- Đồng bộ trạng thái thiết bị.

## Lưu ý kỹ thuật
- Cần xử lý reconnect khi mất kết nối.
- Cần kiểm soát số lượng kết nối đồng thời.
- Với dữ liệu quan trọng cần cơ chế xác thực.

## Thường dùng với
- FastAPI.
- ReactJS.
- Smart Retail dashboard.
- Hệ thống queue realtime.
