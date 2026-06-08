# Inventory Strategy

Tài liệu này dùng cho Inventory Agent trong hệ thống Smart Retail để phân tích tồn kho và đề xuất nhập hàng.

## Nguyên tắc phân tích tồn kho
- Sản phẩm có stock thấp cần được ưu tiên theo dõi.
- Sản phẩm bán chạy nhưng tồn kho thấp có nguy cơ hết hàng.
- Sản phẩm tồn kho cao nhưng bán chậm cần được gợi ý combo hoặc khuyến mãi.

## Mức độ rủi ro
| Điều kiện | Mức độ |
|---|---|
| stock = 0 | Hết hàng |
| stock thấp | Rủi ro cao |
| stock trung bình | Theo dõi |
| stock cao nhưng bán chậm | Cần combo/khuyến mãi |

## Gợi ý hành động
- Nhập thêm sản phẩm bán chạy và tồn thấp.
- Tạo combo cho sản phẩm tồn kho cao.
- Cảnh báo admin khi sản phẩm gần hết.
- Theo dõi xu hướng tiêu thụ theo thời gian.
