// ════════════════════════════════════════════════════════════════════════════
// style-te-override.jsx — đổi bộ manual sang hệ thiết kế công nghiệp chữ mảnh
// (teenage engineering): nền gần trắng, chữ không chân, 0 bo góc, 0 đổ bóng,
// 0 gradient, một dải tối duy nhất làm "tủ kính" cho ảnh sản phẩm.
//
// CÁCH DÙNG: dán nguyên khối này vào ĐẦU file content.jsx, ngay trước phần nội dung.
// make.py nối engine.jsx rồi mới tới content, nên mọi khai báo ở đây ĐÈ LÊN engine —
// không phải sửa engine.jsx, các tài liệu khác giữ nguyên style cũ.
//
// BỐN ĐIỀU ĐÃ TRẢ GIÁ (31/10/2026) — đừng bỏ:
//   1. nenTrang() phải zOrder(SENDTOBACK). addPage() gọi decorate() SAU khi content đã
//      đặt ảnh của trang trước, nền vẽ ra sẽ đè mất nguyên cái hình.
//   2. SMARTBREAK = false. Vòng lặp dời chữ mồ côi của sapDong() không hội tụ với font
//      hẹp: nó chèn xuống dòng mềm 20 lần, xé thân hộp cảnh báo thành mỗi dòng một chữ.
//      Tắt đi rồi sửa câu chữ cho kiem_xuong_dong.py ra SẠCH.
//   3. TABLE phải ghi đè bằng PHÉP GÁN (TABLE = function...). Dùng function declaration
//      thì nó hoisted lên trước hàm gốc và gọi chính nó — đệ quy vô hạn.
//   4. Cỡ chữ ở đây là cho bản IN A4 người 50 tuổi đọc, KHÔNG phải cỡ của bản web.
//      Thân bài 12 pt, hộp cảnh báo 11,5 pt, bảng 11 pt, chữ nội dung đen thuần.
//      Hạ xuống weight 100 / 13 px / #b2b2b2 như bản web thì in ra giấy không đọc nổi.
//
// GIỮ NGUYÊN C_RED / C_ORANGE / C_YELLOW: bốn cấp cảnh báo ISO 3864 là màu duy nhất
// được phép xuất hiện. Mọi thứ khác là năm sắc trung tính.
// ════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// HỆ THIẾT KẾ — teenage engineering
// Năm sắc trung tính; màu DUY NHẤT được phép là 4 cấp cảnh báo ISO 3864.
// ══════════════════════════════════════════════════════════════════════════
// In A4: Light/Semilight ra giấy quá mảnh, chữ bệt và mờ. Nâng một nấc — Regular cho thân
// bài, Semibold cho tiêu đề và chỗ in đậm. Vẫn giữ dáng hẹp, không ornament của hệ TE.
F_REG  = "SegoeUI";
F_BOLD = "SegoeUI-Semibold";
F_ITAL = "SegoeUI-Italic";
F_BI   = "SegoeUI-SemiboldItalic";

var C_MIST   = rgb(246, 248, 247);   // canvas mist
var C_CARBON = rgb(15, 14, 18);      // carbon — dải tối, huy hiệu, tiêu đề bảng
var C_STEEL  = rgb(186, 186, 186);   // hairline — đậm hơn hệ web để nét không biến mất khi in
var C_GRAPH  = rgb(96, 96, 96);      // chữ phụ — #b2b2b2 của hệ TE in A4 ra mờ, không đọc nổi

C_BLUE  = C_CARBON;    // engine dùng C_BLUE cho header/footer/bảng -> chuyển sang carbon
C_BADGE = C_CARBON;
C_TEXT  = rgb(0, 0, 0);
C_GREY  = C_GRAPH;
C_RULE  = C_STEEL;
C_LGREY = C_STEEL;
// C_RED / C_ORANGE / C_YELLOW giữ NGUYÊN — chuẩn màu cảnh báo.

var WORDMARK  = "O  T E S L A   I N D U S T R Y";   // chữ giãn, hiện ở đầu mọi trang
var MODEL     = "XX-00";                            // mã máy, in ở góc phải trang bìa
var NHAN_BIA  = "TÊN THIẾT BỊ  ·  DÒNG TIẾNG ANH";  // nhãn trên dải tối ở chân bìa

// Chữ Segoe UI Light hẹp hơn Arial: vòng lặp "dời chữ mồ côi" của sapDong() không hội tụ,
// nó chèn xuống dòng mềm 20 lần liên tiếp và xé thân hộp cảnh báo thành mỗi dòng một chữ
// (thấy ở lần dựng đầu 31/10/2026). Tắt, rồi soát lại bằng kiem_xuong_dong.py.
SMARTBREAK = false;

// Canvas mist phủ kín trang. addPage() gọi decorate() SAU khi content đã đặt ảnh của trang
// trước, nên nền vẽ ra nằm ĐÈ lên ảnh đó (mất nguyên hình cấu tạo, lần dựng 31/10/2026).
// Luôn đẩy nền xuống đáy z-order.
function nenTrang() {
    var r = doc.pathItems.rectangle(Y(0), X(0), W, H);
    r.filled = true; r.fillColor = C_MIST; r.stroked = false;
    r.zOrder(ZOrderMethod.SENDTOBACK);
    return r;
}
function keNgang(yy, mau, day, x0, w0) {    // hairline
    var l = doc.pathItems.rectangle(Y(yy), X(x0 === undefined ? ML : x0), w0 === undefined ? CW : w0, day || 0.5);
    l.filled = true; l.fillColor = mau; l.stroked = false;
    return l;
}
function chuGian(x, yy, w, str, size, mau, just, track) {
    var t = mkText(x, yy, w, str, F_REG, size, size * 1.5, mau, just);
    try { t.textRange.characterAttributes.tracking = track === undefined ? 180 : track; } catch (e) {}
    return t;
}

// ── nền mỗi trang: hairline trên + dưới, wordmark, số trang ────────────────
function decorate() {
    nenTrang();
    chuGian(ML, 52, 250, WORDMARK, 8, C_CARBON, Justification.LEFT, 120);
    if (chapterHeader !== "") {
        chuGian(ML + 250, 52, CW - 250, chapterHeader.toUpperCase(), 8, C_PHU, Justification.RIGHT, 120);
    }
    keNgang(68, C_CARBON, 0.8);

    keNgang(782, C_STEEL, 0.6);
    chuGian(ML, 794, CW - 70, FOOTLINE, 8, C_PHU, Justification.LEFT, 100);
    var sp = mkText(ML, 792, CW, PGPREFIX + (page + 1), F_BOLD, 9.5, 13, C_CARBON, Justification.RIGHT);
    try { sp.textRange.characterAttributes.tracking = 80; } catch (e) {}
}

// ── BÌA: sản phẩm là vật duy nhất "đậm" trên trang ─────────────────────────
function COVER(kicker, title, subtitle, machine, footline) {
    newDocBare();
    nenTrang();

    chuGian(ML, 60, 280, WORDMARK, 8, C_CARBON, Justification.LEFT, 150);
    chuGian(ML + 280, 60, CW - 280, MODEL, 8, C_CARBON, Justification.RIGHT, 150);
    keNgang(78, C_CARBON, 0.6);

    mkText(ML, 128, 400, title, F_REG, 15, 20, C_CARBON, Justification.LEFT);
    mkText(ML, 152, 400, subtitle, F_BOLD, 34, 38, C_CARBON, Justification.LEFT);
    chuGian(ML, 208, 420, kicker.toUpperCase(), 8.5, C_GRAPH, Justification.LEFT, 160);

    var mf = new File(IMGDIR + coverImage);
    if (mf.exists) {
        var p2 = doc.placedItems.add(); p2.file = mf;
        var b2 = p2.geometricBounds, w2 = b2[2] - b2[0], h2 = b2[1] - b2[3];
        var s2 = 476 / h2; if (w2 * s2 > 320) s2 = 320 / w2;
        p2.width = w2 * s2; p2.height = h2 * s2;
        p2.position = [X((W - w2 * s2) / 2), Y(738 - h2 * s2)];   // đứng trên dải carbon
    }

    var band = doc.pathItems.rectangle(Y(742), X(0), W, H - 742);
    band.filled = true; band.fillColor = C_CARBON; band.stroked = false;
    chuGian(ML, 776, 320, NHAN_BIA, 8.5, C_MIST, Justification.LEFT, 160);
    chuGian(ML, 801, 300, machine, 8, rgb(170, 170, 170), Justification.LEFT, 120);
    chuGian(ML + 300, 801, CW - 300, footline, 8, rgb(170, 170, 170), Justification.RIGHT, 120);
}

// ── tiêu đề: canh TRÁI, chữ mảnh, kẹp giữa hai hairline ────────────────────
function H1(str) {
    need(90);
    tocList.push([str, page]);
    var so = str.match(/^\s*(\d+)\s/);
    if (so) ANCHORS["c" + so[1]] = page;
    keNgang(y - 6, C_CARBON, 0.6);
    var tf = mkText(ML, y + 10, CW, str, F_BOLD, 24, 28, C_CARBON, Justification.LEFT);
    y += textH(tf, 28) + 26;
}
function H2(num, str) {
    need(200);
    var d = 18;
    var sq = doc.pathItems.rectangle(Y(y - 2), X(ML), d, d);     // ô VUÔNG, không bo góc
    sq.filled = true; sq.stroked = false; sq.fillColor = C_CARBON;
    badgeNum("" + num, ML + d / 2, y - 2 + d / 2, 9.5);
    var tf = mkText(ML + 28, y, CW - 28, str, F_BOLD, 14, 19, C_CARBON, Justification.LEFT);
    y += Math.max(textH(tf, 19), d) + 14;
}

// ── ảnh có khung chú thích: khung vuông góc, huy hiệu vuông carbon ─────────
function IMGC(fname, maxW, caption, marks, legend) {
    var f = new File(IMGDIR + fname);
    if (!f.exists) { missing.push(fname); IMG(fname, maxW, caption); return; }
    var pi = doc.placedItems.add(); pi.file = f;
    var b = pi.geometricBounds, w0 = b[2] - b[0], h0 = b[1] - b[3];
    var s = maxW / w0; if (h0 * s > IMGC_MAXH) s = IMGC_MAXH / h0;
    var w = w0 * s, h = h0 * s;
    var legH = 0, capH = 8;
    for (var g = 0; legend && g < legend.length; g++) {
        var tg = mkText(0, -3000, CW - 24, legend[g], F_REG, 9.5, 14, C_TEXT, Justification.LEFT);
        legH += textH(tg, 14) + 2; tg.remove();
    }
    if (legend && legend.length) legH += 10;
    if (caption) {
        var tc = mkText(0, -3000, CW, caption, F_REG, 10, 15, C_PHU, Justification.LEFT);
        capH = textH(tc, 15) + 8; tc.remove();
    }
    if (y + h + 6 + capH + legH > BOT) addPage();
    pi.width = w; pi.height = h;
    var x0 = ML + (CW - w) / 2;
    pi.position = [X(x0), Y(y)];
    for (var i = 0; marks && i < marks.length; i++) {
        var m = marks[i];
        var rx = x0 + m[0] * w, ry = y + m[1] * h, rw = m[2] * w, rh = m[3] * h;
        var r = doc.pathItems.rectangle(Y(ry), X(rx), rw, rh);
        r.filled = false; r.stroked = true; r.strokeColor = C_CARBON; r.strokeWidth = 0.6;
        var d = 14;
        var sq = doc.pathItems.rectangle(Y(ry - d / 2), X(rx - d / 2), d, d);
        sq.filled = true; sq.fillColor = C_CARBON; sq.stroked = false;
        badgeNum(m[4], rx, ry, 8);
    }
    y += h + 8;
    if (caption) { var ct = flow(ML, CW, caption, F_REG, 10, 15, C_PHU, Justification.LEFT, 10); }
    for (var k = 0; legend && k < legend.length; k++)
        flow(ML + 24, CW - 24, legend[k], F_REG, 9.5, 14, C_TEXT, Justification.LEFT, 2);
    if (legend && legend.length) y += 10;
}

// chú thích ảnh của IMG() cũng kéo về giọng TE: chữ nhỏ, canh trái, graphite
function IMG(fname, maxW, caption) {
    var f = new File(IMGDIR + fname);
    if (!f.exists) { missing.push(fname); return; }
    var pi = doc.placedItems.add(); pi.file = f;
    var b = pi.geometricBounds, w0 = b[2] - b[0], h0 = b[1] - b[3];
    var s = maxW / w0; if (h0 * s > IMGC_MAXH) s = IMGC_MAXH / h0;
    var w = w0 * s, h = h0 * s;
    var capH = 0;
    if (caption) {
        var tc = mkText(0, -3000, CW, caption, F_REG, 10, 15, C_PHU, Justification.LEFT);
        capH = textH(tc, 15) + 10; tc.remove();
    }
    if (y + h + 8 + capH > BOT) addPage();
    pi.width = w; pi.height = h;
    pi.position = [X(ML + (CW - w) / 2), Y(y)];
    y += h + 8;
    if (caption) flow(ML, CW, caption, F_REG, 10, 15, C_PHU, Justification.LEFT, 12);
}

// trang nhà sản xuất: nâng 10,5 -> 11,5 pt cho cùng ngưỡng dễ đọc
COMPANY = function (name, tagline, rows, noticeTitle, noticeBody) {
    y += 26;
    var t1 = mkText(ML, y, CW, name, F_BOLD, 18, 24, C_CARBON, Justification.LEFT);
    y += textH(t1, 24) + 6;
    var t2 = mkText(ML, y, CW, tagline, F_REG, 11.5, 17, C_PHU, Justification.LEFT);
    y += textH(t2, 17) + 20;
    keNgang(y, C_CARBON, 0.8);
    y += 20;
    for (var i = 0; i < rows.length; i++) {
        var lab = mkText(ML, y, 100, rows[i][0], F_BOLD, 11.5, 17, C_CARBON, Justification.LEFT);
        var val = mkText(ML + 104, y, CW - 104, rows[i][1], F_REG, 11.5, 17, C_TEXT, Justification.LEFT);
        y += Math.max(textH(lab, 17), textH(val, 17)) + 15;
    }
    y += 14;
    if (noticeTitle) SAFETY("luuy", noticeTitle, noticeBody);
};

// ── mục lục: tiêu đề canh TRÁI, đường dẫn là hairline steel ───────────────
function TOCDRAW(title, prefix) {
    if (tocPage < 0) return;
    var savePage = page, saveY = y;
    page = tocPage; y = TOP;
    keNgang(y - 6, C_CARBON, 0.6);
    var h = mkText(ML, y + 10, CW, title, F_BOLD, 24, 28, C_CARBON, Justification.LEFT);
    y += textH(h, 28) + 36;
    for (var i = 0; i < tocList.length; i++) {
        var name = tocList[i][0], pg = tocList[i][1];
        var pt = doc.textFrames.add();
        pt.contents = name;
        pt.textRange.characterAttributes.textFont = app.textFonts.getByName(F_REG);
        pt.textRange.characterAttributes.size = 12;
        pt.textRange.characterAttributes.fillColor = C_CARBON;
        pt.position = [X(ML), Y(y)];
        var wb = pt.geometricBounds, wname = wb[2] - wb[0];
        mkText(ML + CW - 62, y, 62, prefix + (pg + 1), F_BOLD, 11.5, 16, C_CARBON, Justification.RIGHT);
        var x1 = ML + wname + 10, x2 = ML + CW - 66;
        if (x2 > x1) {
            var ln2 = doc.pathItems.rectangle(Y(y + 9), X(x1), x2 - x1, 0.5);
            ln2.filled = true; ln2.fillColor = C_STEEL; ln2.stroked = false;
        }
        y += 28;
    }
    page = savePage; y = saveY;
}

// ── hai ảnh một hàng: CÙNG BỀ NGANG nửa cột, mép trái/phải thẳng như lưới catalogue ──
// Bản engine ép cùng chiều cao nên ảnh ngang và ảnh dọc ra hai bề ngang khác nhau,
// lưới gãy. Ở đây ép cùng bề ngang, chú thích canh trái dưới mỗi ô.
function IMG2(fa, fb, hMax, capA, capB) {
    var half = (CW - 22) / 2, names = [fa, fb], caps = [capA, capB], items = [], rowH = 0;
    for (var i = 0; i < 2; i++) {
        var f = new File(IMGDIR + names[i]);
        if (!f.exists) { missing.push(names[i]); items.push(null); continue; }
        var pi = doc.placedItems.add(); pi.file = f;
        var b = pi.geometricBounds, w0 = b[2] - b[0], h0 = b[1] - b[3];
        var s = half / w0; if (h0 * s > hMax) s = hMax / h0;
        pi.width = w0 * s; pi.height = h0 * s;
        items.push(pi);
        if (h0 * s > rowH) rowH = h0 * s;
    }
    var capH = 0;
    for (var k = 0; k < 2; k++) {
        var t = mkText(0, -3000, half, caps[k], F_REG, 10, 15, C_PHU, Justification.LEFT);
        capH = Math.max(capH, textH(t, 15)); t.remove();
    }
    need(rowH + capH + 22);
    for (var j = 0; j < 2; j++) {
        var x0 = ML + j * (half + 22);
        if (items[j]) {
            var bb = items[j].geometricBounds, w = bb[2] - bb[0];
            items[j].position = [X(x0 + (half - w) / 2), Y(y)];
        }
        keNgang(y + rowH + 7, C_STEEL, 0.5, x0, half);
        mkText(x0, y + rowH + 13, half, caps[j], F_REG, 10, 15, C_PHU, Justification.LEFT);
    }
    y += rowH + 13 + capH + 16;
}

// ── bảng kiểu TE: hàng tiêu đề carbon, các hàng ngăn bằng hairline, KHÔNG tô nền xen kẽ ──
// Cỡ 10/15 pt cho dễ đọc khi in A4. Hàng tiêu đề nới thêm 9 pt: để sát quá thì
// kiem_xuong_dong.py đọc ô tiêu đề và ô hàng đầu thành một đoạn rồi báo mồ côi giả.
TABLE = function (cols, rows, widths, opts) {
    opts = opts || {};
    var pad = 8, size = opts.size || 11, lead = opts.lead || 16.5, minRow = opts.minRow || 32;

    function caoHang(cells, font, them) {
        var mx = 0;
        for (var i = 0; i < cells.length; i++) {
            var t = mkText(0, -3000, widths[i] - 2 * pad, cells[i], font, size, lead, C_TEXT, Justification.LEFT);
            var h = textH(t, lead); t.remove();
            if (h > mx) mx = h;
        }
        return Math.max(mx + 2 * pad + (them || 0), font === F_REG ? minRow : 0);
    }
    function veTieuDe(hH) {
        var bg = doc.pathItems.rectangle(Y(y), X(ML), CW, hH);
        bg.filled = true; bg.fillColor = C_CARBON; bg.stroked = false;
        var x0 = ML;
        for (var c = 0; c < cols.length; c++) {
            mkText(x0 + pad, y + pad - 1, widths[c] - 2 * pad, cols[c], F_BOLD, size, lead, C_MIST, Justification.LEFT);
            x0 += widths[c];
        }
        y += hH;
    }

    var hH = caoHang(cols, F_BOLD, 9);
    need(hH + 46);
    veTieuDe(hH);
    for (var r = 0; r < rows.length; r++) {
        var rh = caoHang(rows[r], F_REG);
        if (y + rh > BOT) { addPage(); veTieuDe(hH); }
        var xx = ML;
        for (var c2 = 0; c2 < rows[r].length; c2++) {
            mkText(xx + pad, y + pad - 1, widths[c2] - 2 * pad, rows[r][c2], F_REG, size, lead, C_TEXT, Justification.LEFT);
            xx += widths[c2];
        }
        keNgang(y + rh, C_STEEL, 0.5);
        y += rh;
    }
    y += 18;
};

// ══════════════════════════════════════════════════════════════════════════
// CỠ CHỮ CHO NGƯỜI ĐỌC 50+ (in A4, không đeo kính lúp)
// Khuyến nghị in dễ đọc (RNIB clear print): thân bài tối thiểu 12 pt, tránh chữ xám
// nhạt và chữ nghiêng cho đoạn dài. Engine mặc định 11 pt (và 10 pt trong hộp cảnh báo,
// 9,5 pt trong bảng) — dưới ngưỡng đó, nên nâng hết một nấc.
// ══════════════════════════════════════════════════════════════════════════
var C_PHU = rgb(58, 58, 58);     // chữ phụ: đậm hơn #606060 cho dễ đọc khi in

function P(str) {
    flow(ML, CW, str, F_REG, 12, 19, C_TEXT, Justification.FULLJUSTIFYLASTLINELEFT, 9);
}
function PI(str) {               // bỏ chữ nghiêng xám: nghiêng + nhạt + nhỏ là tệ nhất khi in
    flow(ML, CW, str, F_REG, 11, 17, C_PHU, Justification.LEFT, 10);
}
function BUL(arr) {
    for (var i = 0; i < arr.length; i++)
        flow(ML + 22, CW - 22, "• " + arr[i], F_REG, 12, 19, C_TEXT, Justification.LEFT, 5);
    y += 7;
}
function H3(str) {
    need(150);
    flow(ML, CW, str, F_BOLD, 12.5, 18, C_CARBON, Justification.LEFT, 8);
}
function STEP(n, str) {
    need(34);
    var num = mkText(ML, y, 26, n + ".", F_BOLD, 12, 19, C_CARBON, Justification.LEFT);
    var tf = mkText(ML + 26, y, CW - 26, str, F_REG, 12, 19, C_TEXT, Justification.LEFT);
    var h = textH(tf, 19);
    if (y + h > BOT) {
        addPage();
        num.position = [X(ML), Y(y)];
        tf.position = [X(ML + 26), Y(y)];
    }
    y += h + 8;
}

// Hộp cảnh báo là chỗ BẮT BUỘC phải đọc được: thân 11,5 pt, tiêu đề 12 pt, thanh màu dày hơn.
var SAFETY_SIZE = 11.5, SAFETY_LEAD = 17;
SAFETY = function (kind, title, body, icons) {
    var col = C_BLUE, txtOnBar = C_WHITE;
    if (kind === "nguyhiem") col = C_RED;
    else if (kind === "canhbao") col = C_ORANGE;
    else if (kind === "thantrong") { col = C_YELLOW; txtOnBar = C_BLACK; }
    icons = icons || [];
    var tx = icons.length ? ML + 14 + ICON_W + 14 : ML + 14;
    var tw = ML + CW - 14 - tx;
    var iconsH = icons.length ? icons.length * (ICON_W * 0.88 + 6) : 0;
    var dauY = 32;

    function doThan() {
        return mkText(tx, y + dauY, tw, body, F_REG, SAFETY_SIZE, SAFETY_LEAD, C_TEXT, Justification.LEFT);
    }
    var than = doThan();
    var bh = Math.max(textH(than, SAFETY_LEAD), iconsH);
    var boxH = dauY + bh + 12;
    if (y + boxH > BOT) {
        than.remove(); addPage(); than = doThan();
        bh = Math.max(textH(than, SAFETY_LEAD), iconsH); boxH = dauY + bh + 12;
    }

    var bg = doc.pathItems.rectangle(Y(y), X(ML), CW, boxH);
    bg.filled = true; bg.fillColor = rgb(252, 252, 252);
    bg.stroked = true; bg.strokeColor = col; bg.strokeWidth = 1.2;
    var bar = doc.pathItems.rectangle(Y(y), X(ML), CW, 25);
    bar.filled = true; bar.fillColor = col; bar.stroked = false;

    var tt = doc.textFrames.add();
    tt.contents = title;
    tt.textRange.characterAttributes.textFont = app.textFonts.getByName(F_BOLD);
    tt.textRange.characterAttributes.size = 12;
    tt.textRange.characterAttributes.fillColor = txtOnBar;
    tt.position = [X(ML + (kind === "luuy" ? 12 : 34)), Y(y + 5.5)];
    tt.zOrder(ZOrderMethod.BRINGTOFRONT);

    for (var k = 0; k < icons.length; k++) {
        var fi = new File(IMGDIR + icons[k]);
        if (!fi.exists) { missing.push(icons[k]); continue; }
        var pk = doc.placedItems.add(); pk.file = fi;
        var bk = pk.geometricBounds, wk = bk[2] - bk[0], hk = bk[1] - bk[3], sk = ICON_W / wk;
        pk.width = wk * sk; pk.height = hk * sk;
        pk.position = [X(ML + 14), Y(y + dauY + k * (ICON_W * 0.88 + 6))];
    }
    than.position = [X(tx), Y(y + dauY)];
    than.zOrder(ZOrderMethod.BRINGTOFRONT);
    y += boxH + 14;
};

// nhãn nhỏ kiểu nhãn kệ trưng bày: chữ gián cách trên một hairline
function NHAN(str) {
    need(26);
    keNgang(y - 4, C_STEEL, 0.6);
    chuGian(ML, y + 4, CW, str.toUpperCase(), 8.5, C_CARBON, Justification.LEFT, 160);
    y += 20;
}
