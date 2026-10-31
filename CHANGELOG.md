# Lịch sử thay đổi

Đánh số theo [SemVer](https://semver.org/lang/vi/).

## [1.2.0] — 2026-10-31

### Thêm
- `assets/make.py` — **một lệnh** thay cho chuỗi thao tác tay: nối engine + nội dung → chạy
  Illustrator qua COM (một phiên cho nhiều file) → lưu `.ai` + `.pdf` → gắn bookmark → kiểm
  xuống dòng tiếng Việt → render PNG → ghép **tờ soát 12 trang/tờ** → rà trang thưa chữ.
  Cờ `--nhanh`, `--giao --mo`, `--khong-anh`, `--dpi`. Gặp lỗi `PARM` của Illustrator thì tự
  thoát Illustrator và dựng lại một lần.
- `assets/bookmark.py` — gắn bookmark cho PDF do Illustrator xuất (Illustrator không bao giờ
  tự sinh). Lọc chữ Arial Bold 19 pt làm mục 1, 12,5 pt làm mục 2, rồi **đọc lại chính file PDF**
  để soát. Chạy riêng được cho PDF cũ.
- `LICENSE` — MIT.
- `references/content-mau-toi-thieu.jsx` — khung tối thiểu chạy được ngay, có chú thích từng hàm.
- Engine: `IMG2` (hai ảnh cạnh nhau cùng chiều cao), `H3TAG` (nhãn phiên bản máy), `ICONROW`
  (hàng biển ISO 7010), `XUAT()` thay ~15 dòng `saveAs`/`PDFSaveOptions` chép tay, mốc số trang
  `{{c3}}` / `ANCHOR("ten")` điền tự động ở bất kỳ chuỗi nào, `TABLE(..., {grid, minRow, size, lead})`,
  biển ISO 7010 đặt dọc trong `SAFETY()`.
- Engine: **xuống dòng thông minh cho tiếng Việt** (`sapDong()` trong `mkText`) — chữ mồ côi,
  số rời đơn vị, tiền tố rời số, cụm trong ngoặc bị cắt, dấu `–` đầu dòng. Tắt bằng `SMARTBREAK = false`.

### Sửa
- Lưới artboard **mặc định** `OX = -7700, OY = 4500, COLS = 20` → 280 trang; content không phải
  tự ghi đè `X()` / `Y()` nữa (lưới cũ gốc 0,0 gãy ở ~40 trang).
- `H2` dự phòng 200 pt, `H3` 150 pt — hết cảnh mục ngắn bị xé đôi qua hai trang.
- README dựng lại theo ngôn ngữ thiết kế *teenage engineering*: nền sáng, chữ mảnh, không bo góc,
  không đổ bóng, bảng màu rút về năm sắc trung tính và một điểm hổ phách duy nhất. Banner và sơ đồ
  cấu trúc trang vẽ lại cùng hệ.

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
