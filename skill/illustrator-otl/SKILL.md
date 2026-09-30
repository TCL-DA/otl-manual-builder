---
name: illustrator-otl
description: Lái Adobe Illustrator bằng câu lệnh — đọc/sửa tài liệu đang mở qua MCP `illustrator`, và chạy script JSX qua COM cho những việc MCP làm không tới (đặt màu chữ, gradient, khoét hình, dàn nhiều trang). Dùng khi người dùng nói "mở Illustrator", "sửa file .ai", "đổi màu chữ trong ai", "xuất PNG/PDF từ Illustrator", "vẽ banner/bìa", "khoét logo", "chạy jsx", "illustrator báo lỗi", hoặc đưa file .ai/.jsx. Việc dàn trang tài liệu hướng dẫn nhiều trang thì dùng skill `manual-otl`.
---

Hai đường vào Illustrator, chọn đúng đường thì nhanh, chọn sai thì sửa cả buổi mà chữ vẫn đen.

## Chọn đường

| Việc | Dùng |
|---|---|
| Đọc tài liệu đang mở, liệt kê layer / khung chữ / màu | **MCP** `illustrator` |
| Soát lỗi trước khi in, trích design token, kiểm tương phản | **MCP** |
| Xuất PNG / PDF / SVG, quản lý artboard, đặt ảnh | **MCP** |
| Đặt **màu chữ**, tracking, gradient có opacity stop | **JSX qua COM** |
| Khoét hình, Pathfinder, z-order | **JSX qua COM** |
| Dàn nhiều trang, đo chiều cao chữ để tự sang trang | **JSX qua COM** → xem skill `manual-otl` |

Cài MCP và bảng 66 tool: [`mcp/README.md`](../../mcp/README.md).

## Chạy JSX

Illustrator **đang mở sẵn** — bám vào phiên đang chạy, không mở phiên mới:

```powershell
$ai = [Runtime.InteropServices.Marshal]::GetActiveObject("Illustrator.Application")
$ai.DoJavaScriptFile("C:\OTL\build\viec.jsx", $null, 2)
```

Illustrator **có thể chưa chạy** — để COM tự mở:

```powershell
$ai = New-Object -ComObject Illustrator.Application
while ($ai.Documents.Count -gt 0) { $ai.ActiveDocument.Close(2) }   # dọn doc lỗi của lần trước
$ai.DoJavaScriptFile("C:\OTL\build\viec.jsx")
```

## Luật bất di bất dịch

1. **Xuất PNG và nhìn bằng mắt trước khi nói xong.** Log không bao giờ báo chữ đen, chữ chồng,
   hay vật thể lệch ra ngoài artboard. Việc nào cũng kết thúc bằng một lần soi ảnh.
2. **Đọc `artboards[0].artboardRect` trước khi tính toạ độ.** Artboard có **Y dương**:
   `[0, H, W, 0]`. Trong JSX đổi từ toạ độ web sang: `Y = H - yWeb`.
3. **Không lưu đè trước khi xem lại kết quả.** Đã có lần bộ lọc "xoá vật thể ngoài artboard"
   quét sạch logo rồi lưu đè vì giả định sai dấu trục Y.
4. **Không sửa file `.jsx` tiếng Việt bằng `sed` hay `perl -i`** — hỏng encoding UTF-8 và nuốt
   escape `\uXXXX`. Ghi lại nguyên file bằng Python đọc/ghi UTF-8.

## Bốn bẫy đã trả giá

### 1 · Màu chữ đặt qua MCP không ăn

`create_text_frame(fill=…)` và `modify_object(fill=…)` chỉ tô *khung* text; từng ký tự vẫn đen.
`get_text_frame_detail` cho thấy `rgb 0,0,0`. Fill trên group cũng vô tác dụng. Cách đúng:

```javascript
var c = new RGBColor(); c.red = 226; c.green = 108; c.blue = 10;
tf.textRange.characterAttributes.fillColor = c;
```

### 2 · Arial Black không có glyph tiếng Việt

Gặp chữ `Ừ` là Illustrator âm thầm thay Myriad Pro cho đúng một ký tự, cả từ lệch nét.
Tiêu đề tiếng Việt dùng **Segoe UI** (`SegoeUIBlack` / `SegoeUI-Bold` / `SegoeUI` /
`SegoeUI-Italic`) hoặc Arial thường. Máy này **không có Montserrat**.

### 3 · Khoét hình phải dùng Pathfinder Subtract

`executeMenuCommand("compoundPath")` ăn theo chiều vẽ nên không đáng tin — nền vẽ bằng
`ellipse()` thì thủng, cùng hình vẽ bằng `roundedRectangle()` thì đặc. Ép `evenodd` hay
`polarity = NEGATIVE` đều vô tác dụng.

```javascript
sel([ground, cut]);
app.executeMenuCommand("group");
ground.zOrder(ZOrderMethod.SENDTOBACK);   // BẮT BUỘC — thiếu là ra union
app.executeMenuCommand("Live Pathfinder Subtract");
app.executeMenuCommand("expandStyle");
```

`expandStyle` trả về GroupItem lồng nhau nên `result.pathItems.length` ra `0` — không phải là
dấu hiệu thất bại, phải xuất PNG ra nhìn.

Gộp nhiều mảnh thì `Live Pathfinder Add` + `expandStyle` chạy tốt, không cần ép z-order.

### 4 · Khung chữ rỗng ném lỗi 1302

`textFrame.paragraphs[0]` ném **1302** khi khung chưa có chữ. Luôn bọc `try/catch` quanh
`textRange.paragraphAttributes`. Ngoài ra `position` của text frame là **góc trái-trên**,
không phải baseline — tính theo baseline là chữ tụt nửa dòng khỏi thanh màu.

## Mẹo lặt vặt

- Gradient trùng `g.name` ném *the name is in use* → thêm hậu tố ngẫu nhiên.
- `replace_color` có `scope` theo layer thì trả `0` (lỗi của gói MCP); bỏ `scope`, chạy toàn
  tài liệu thì đúng.
- `replace_color` và `find_objects` **không đệ quy** vào group và compound path khi có `scope`.
- Chữ canh đều dùng `FULLJUSTIFYLASTLINELEFT`, không phải `FULLJUSTIFY`.
