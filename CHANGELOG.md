# Lịch sử thay đổi

Đánh số theo [SemVer](https://semver.org/lang/vi/).

## [1.1.0] — 2026-09-30

### Thêm
- `mcp/` — cách cài MCP `illustrator` ([illustrator-mcp-server](https://github.com/ie3jp/illustrator-mcp-server)
  của ie3jp, MIT, 66 tool), cấu hình dán sẵn, bảng tool chia theo việc, sơ đồ ranh giới
  *MCP ↔ JSX qua COM*, và **bốn bẫy đã trả giá**: màu chữ đặt qua MCP không ăn · Arial Black
  thiếu glyph tiếng Việt · artboard có Y dương · khoét hình phải dùng Pathfinder Subtract kèm
  ép z-order.
- `skill/illustrator-otl/` — skill lái Illustrator: chọn đường MCP hay JSX, hai kiểu gọi COM,
  bốn luật bất di bất dịch, snippet đặt màu ký tự và khoét hình.

### Sửa
- README: thêm mục MCP, bảng hai skill, cập nhật cây thư mục.

## [1.0.0] — 2026-09-30

Bản đầu tiên công khai.

### Có sẵn
- `engine.jsx` — bộ dàn trang A4 cho Illustrator: bìa, trang nhà sản xuất, mục lục tự đánh
  số trang, tiêu đề 3 cấp, đoạn canh đều, bước đánh số, bảng tự lặp hàng tiêu đề, hộp cảnh
  báo 4 cấp ISO 3864, ảnh có khung đỏ đánh số, sơ đồ trạng thái.
- Lưới artboard chứa tối đa **280 trang** một tài liệu (vượt giới hạn canvas 16384 pt của
  Illustrator).
- `SKILL.md` — chỉ dẫn dùng engine cho trợ lý AI, kèm quy trình 7 bước và các bẫy đã gặp.
- Hai chương mẫu song ngữ VI + EN (tài liệu làm nóng máy, 15 trang, đã giao khách).
- `style-otl.md` — khổ trang, lề, cỡ chữ, bảng màu, phân cấp cảnh báo.
- `quan-ly-phien-ban.md` — quy tắc đánh số phiên bản và giữ hai ngôn ngữ cùng nhịp.
