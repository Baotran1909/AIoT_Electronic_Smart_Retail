def explain_locker_flow() -> str:
    return """
Smart Locker workflow:
1. Website sinh mã PIN khi người dùng chọn nhận hàng qua Locker.
2. Firebase lưu current_pin, box_no và status.
3. ESP32 đọc locker_access từ Firebase.
4. Người dùng nhập PIN trên keypad.
5. Nếu PIN hợp lệ, ESP32 điều khiển servo mở đúng ngăn tủ và cập nhật trạng thái lên Firebase.
"""
