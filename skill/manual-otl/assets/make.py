# -*- coding: utf-8 -*-
"""Dung manual OTL bang MOT lenh: noi engine + chay Illustrator + GAN BOOKMARK + render PNG
+ ra loi trinh bay.

    python make.py content.jsx
    python make.py content.jsx content-vi.jsx     # nhieu ban — CHUNG mot phien PowerShell
    python make.py content.jsx --nhanh            # ban nhap: bo luu .ai, chi xuat .pdf
    python make.py content.jsx --khong-anh        # bo qua buoc render PNG
    python make.py content.jsx --dpi 110          # render net hon de soi ky
    python make.py content.jsx --giao --mo        # chep .pdf/.ai tu build\ ra thu muc goc + mo Chrome

Moi lan dung tu lam (them 24/10/2026): gan bookmark, KIEM XUONG DONG (pdf-xuong-dong), xoa anh trang
cu, render PNG + TO SOAT _soat-N.jpg (12 trang/to — mo vai anh la soi duoc ca tai lieu), va tu
THOAT Illustrator roi dung lai mot lan khi gap loi PARM.

Yeu cau: Illustrator dang cai, PyMuPDF (pip install pymupdf).
File content phai tu goi doc.saveAs(...) o cuoi nhu cac ban mau.

── TOC DO: do that ngay 30/09/2026, tai lieu 15 trang ────────────────────────
    Illustrator khoi dong NGUOI      ~32 s   <- chi ton mot lan, dung de no chay
    dong tai lieu con sot lai          ~2 s   (~9 s neu de don nhieu ban)
    ve 15 trang                       ~4 s
    luu .ai                           ~1,2 s  <- --nhanh bo duoc
    luu .pdf                          ~1,0 s
    gan bookmark (bookmark.py)        ~0,3 s  <- BAT BUOC, Illustrator khong tu sinh
    render PNG + ra soat              ~0,5 s
Ba viec script nay lam de nhanh hon:
  1. dong tai lieu NGAY trong lan chay do, khong de don sang lan sau
  2. --nhanh bo buoc luu .ai khi chi can xem bo cuc
  3. nhieu file thi dung CHUNG mot phien PowerShell, khong bat COM lai tung lan
Va dung tat Illustrator giua chung — bat lai mat 32 s.
"""
import io, os, re, subprocess, sys, glob, time

HERE = os.path.dirname(os.path.abspath(__file__))
ENGINE = os.path.join(HERE, "engine.jsx")

IT_CHU = 420          # duoi nguong nay, khong anh -> nghi trang thua
CAO_TOI_THIEU = 430   # khoi chu cuoi ket thuc cao hon -> nua duoi trang trong

# Dong het tai lieu ngay trong lan chay nay, roi tra lai dung chuoi ket qua cu.
# Khong lam viec nay thi lan dung sau phai dong ho, mat ~2 s va de don thanh ~9 s.
DUOI = ("\n;(function(){ try { while (app.documents.length > 0) "
        "app.documents[0].close(SaveOptions.DONOTSAVECHANGES); } catch (e) {} })();\n"
        "msg;\n")

# Hai dang khai bao luu .ai trong cac ban content hien co
BO_AI = [
    re.compile(r'^\s*var ai = new File\(base \+ "[^"]+\.ai"\);\s*$\n'
               r'^\s*doc\.saveAs\(ai, new IllustratorSaveOptions\(\)\);\s*$\n',
               re.MULTILINE),
    re.compile(r'^\s*doc\.saveAs\(new File\(base \+ "[^"]+\.ai"\), '
               r'new IllustratorSaveOptions\(\)\);\s*$\n', re.MULTILINE),
]


def loi(msg):
    print("LOI: " + msg)
    sys.exit(1)


def soat_dau_cach(noi_dung):
    """Thieu dau cach truoc \\u2013 -> dinh chu, tung lot ra tan bia."""
    return [x.strip() for x in
            re.findall(r'.{0,24}(?<=[^\s"])\\u2013.{0,20}', noi_dung)]


def noi_file(content, nhanh):
    if not os.path.exists(content):
        loi("khong thay %s" % content)
    thu_muc = os.path.dirname(os.path.abspath(content))
    ten = os.path.basename(content)
    ra = os.path.join(thu_muc, ten if ten.startswith("manual") else "manual-" + ten)
    e = io.open(ENGINE, encoding="utf-8").read()
    c = io.open(content, encoding="utf-8").read()

    dinh = soat_dau_cach(c)
    if dinh:
        print("  ! thieu dau cach truoc \\u2013 tai %d cho:" % len(dinh))
        for x in dinh[:5]:
            print("      ..." + x)
        print("    -> sua trong %s roi chay lai" % ten)

    bo_duoc = False
    if nhanh:
        for pat in BO_AI:
            c, n = pat.subn("", c)
            bo_duoc = bo_duoc or n > 0
        if not bo_duoc and "XUAT(" not in c:
            print("  ! --nhanh: khong nhan ra cho luu .ai, van luu nhu thuong")

    # content dung XUAT(): --nhanh chi can gan LUU_AI = false giua engine va content
    chen = "\nLUU_AI = false;\n" if nhanh else "\n"
    io.open(ra, "w", encoding="utf-8", newline="").write(e + chen + c + DUOI)
    return ra


def tim_pdf(jsx, kq=""):
    m = re.search(r"\| pdf=(.+?\.pdf)", kq or "")          # content dung XUAT()
    if m:
        return m.group(1).strip()
    s = io.open(jsx, encoding="utf-8").read()
    base = re.findall(r'var base = "([^"]+)"', s)
    ten = re.findall(r'new File\(base \+ "([^"]+\.pdf)"\)', s)
    return (base[-1] + ten[-1]) if (base and ten) else None


def thoat_illustrator():
    """Illustrator bao PARM o areaText sau nhieu luot dung lien tiep: thoat han roi dung lai
    thi het (do 24/10/2026, noi dung khong doi). Ton them ~32 s khoi dong nguoi."""
    ps = ("$ai = New-Object -ComObject Illustrator.Application; "
          "while ($ai.Documents.Count -gt 0) { $ai.ActiveDocument.Close(2) }; $ai.Quit()")
    subprocess.run(["powershell", "-NonInteractive", "-Command", ps],
                   capture_output=True, text=True, timeout=120)
    time.sleep(5)


def chay_illustrator(danh_sach_jsx, thu_lai=True):
    """Dung TAT CA file trong MOT phien PowerShell. Tra ve list ket qua theo thu tu."""
    dong = ["$ErrorActionPreference = 'Stop'",
            "$ai = New-Object -ComObject Illustrator.Application",
            "while ($ai.Documents.Count -gt 0) { $ai.ActiveDocument.Close(2) }"]
    for f in danh_sach_jsx:
        dong.append('"<<<KQ>>>" + $ai.DoJavaScriptFile("%s")' % f.replace("/", "\\"))
    ps = "\n".join(dong)
    try:
        r = subprocess.run(["powershell", "-NonInteractive", "-Command", ps],
                           capture_output=True, text=True, timeout=1800)
    except subprocess.TimeoutExpired:
        loi("Illustrator khong tra loi sau 30 phut — mo Illustrator xem co hop "
            "thoai nao dang chan khong")
    out = (r.stdout or "")
    kq = [x.strip() for x in out.split("<<<KQ>>>")[1:]]
    if len(kq) != len(danh_sach_jsx) and thu_lai and "PARM" in out + (r.stderr or ""):
        print("  ! Illustrator bao PARM — thoat Illustrator va dung lai mot lan")
        thoat_illustrator()
        return chay_illustrator(danh_sach_jsx, thu_lai=False)
    if len(kq) != len(danh_sach_jsx):
        loi("Illustrator khong dung du:\n%s\n%s"
            % (out.strip()[:800], (r.stderr or "").strip()[:800]))
    return kq


def gan_bookmark(pdf):
    """BAT BUOC: tai lieu giao khach phai co bookmark. Illustrator khong tu sinh."""
    try:
        import bookmark
    except ImportError:
        sys.path.insert(0, HERE)
        try:
            import bookmark
        except ImportError:
            print("  ! KHONG gan duoc bookmark: thieu bookmark.py canh engine")
            return
    try:
        n = bookmark.dat_bookmark(pdf)
    except Exception as e:                      # loi la bao, khong nuot
        print("  ! KHONG gan duoc bookmark: %s" % e)
        return
    if n == 0:
        print("  ! KHONG tim thay tieu de nao de lam bookmark — xem lai tai lieu co "
              "dung H1()/H2() khong")
    else:
        print("  bookmark=%d (soat lai tren file: %d)" % (n, bookmark.kiem(pdf)))


def ra_soat(pdf, ve_anh, dpi):
    try:
        import fitz
    except ImportError:
        print("  (bo qua ra soat: chua co pymupdf)")
        return
    d = fitz.open(pdf)
    thu_muc = os.path.dirname(pdf)
    if ve_anh:   # anh trang cu sot lai (tai lieu bot trang) lam soi nham trang khong con ton tai
        for f in glob.glob(os.path.join(thu_muc, "p_*.png")) + glob.glob(os.path.join(thu_muc, "_soat-*.jpg")):
            os.remove(f)
    canh_bao = []
    for i in range(d.page_count):
        p = d[i]
        t = p.get_text().strip()
        anh = len(p.get_images())
        khoi = [b for b in p.get_text("blocks") if b[4].strip()]
        day = max((b[3] for b in khoi), default=0)
        if i > 0 and anh == 0 and len(t) < IT_CHU:
            canh_bao.append("tr%02d chi %d ky tu, khong anh" % (i + 1, len(t)))
        elif i > 0 and anh == 0 and day < CAO_TOI_THIEU:
            canh_bao.append("tr%02d trong nua duoi" % (i + 1))
        if ve_anh:
            p.get_pixmap(dpi=dpi).save(os.path.join(thu_muc, "p_%02d.png" % (i + 1)))
    if canh_bao:
        print("  ! xem lai: " + "; ".join(canh_bao))
        print("    (trang muc luc thua chu la binh thuong)")
    else:
        print("  khong co trang thua chu")
    if ve_anh:
        print("  da render %d anh vao %s" % (d.page_count, thu_muc))
        to_soat(thu_muc, d.page_count)


def to_soat(thu_muc, so_trang, moi_to=12, cot=6, rong=330):
    """Ghep anh trang thanh to soat _soat-1.jpg, _soat-2.jpg… (12 trang/to): soi bo cuc bang mat
    chi can mo vai anh thay vi tung trang."""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        return
    try:
        ft = ImageFont.truetype("arialbd.ttf", 22)
    except Exception:
        ft = None
    to = []
    for s in range(0, so_trang, moi_to):
        anh = []
        for i in range(s, min(s + moi_to, so_trang)):
            im = Image.open(os.path.join(thu_muc, "p_%02d.png" % (i + 1))).convert("RGB")
            im = im.resize((rong, int(im.height * rong / im.width)))
            ImageDraw.Draw(im).text((5, 4), str(i + 1), fill=(220, 0, 0), font=ft)
            anh.append(im)
        h = anh[0].height
        hang = (len(anh) + cot - 1) // cot
        tam = Image.new("RGB", (cot * (rong + 6), hang * (h + 6)), (90, 90, 90))
        for k, im in enumerate(anh):
            tam.paste(im, ((k % cot) * (rong + 6), (k // cot) * (h + 6)))
        ten = os.path.join(thu_muc, "_soat-%d.jpg" % (len(to) + 1))
        tam.save(ten, quality=85)
        to.append(ten)
    print("  to soat bo cuc: " + ", ".join(os.path.basename(t) for t in to))


def kiem_xuong_dong(pdf):
    """Luat pdf-xuong-dong: PDF giao khach phai ra SACH. Chay luon o day, khoi nho chay rieng."""
    duong = os.path.expanduser("~/.claude/skills/pdf-xuong-dong/scripts/kiem_xuong_dong.py")
    if not os.path.exists(duong):
        print("  (khong thay kiem_xuong_dong.py, bo qua kiem xuong dong)")
        return
    import importlib.util
    sp = importlib.util.spec_from_file_location("kiem_xuong_dong", duong)
    m = importlib.util.module_from_spec(sp)
    sp.loader.exec_module(m)
    loi_ = m.kiem(pdf)
    if not loi_:
        print("  xuong dong: SACH")
        return
    print("  ! xuong dong: %d loi — sua roi dung lai:" % len(loi_))
    for so, kieu, doan in loi_[:10]:
        print("      tr.%-3d %-12s %s" % (so, kieu, doan))


def giao(pdf, mo):
    """--giao: chep .pdf + .ai tu build\\ ra thu muc goc tai lieu. --mo: mo PDF bang Chrome
    (quy tac chu may: luon Chrome, khong Edge)."""
    dich = pdf
    thu_muc = os.path.dirname(pdf)
    if os.path.basename(thu_muc).lower() == "build":
        goc = os.path.dirname(thu_muc)
        import shutil
        for duoi in (".pdf", ".ai"):
            f = pdf[:-4] + duoi
            if os.path.exists(f):
                shutil.copy2(f, goc)
        dich = os.path.join(goc, os.path.basename(pdf))
        print("  da chep .pdf/.ai ra " + goc)
    if mo:
        chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        url = "file:///" + dich.replace("\\", "/")
        if os.path.exists(chrome):
            subprocess.Popen([chrome, "--new-window", url])
            print("  da mo bang Chrome: " + dich)
        else:
            print("  ! khong thay Chrome tai " + chrome)


def giao_chi_mo(pdf):
    """--mo khong kem --giao: mo ban trong build\\."""
    chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if os.path.exists(chrome):
        subprocess.Popen([chrome, "--new-window", "file:///" + pdf.replace("\\", "/")])
        print("  da mo bang Chrome: " + pdf)


def main():
    args = list(sys.argv[1:])
    nhanh = "--nhanh" in args
    ve_anh = "--khong-anh" not in args
    co_giao = "--giao" in args
    co_mo = "--mo" in args
    args = [a for a in args if a not in ("--nhanh", "--khong-anh", "--giao", "--mo")]
    dpi = 80
    if "--dpi" in args:
        k = args.index("--dpi")
        dpi = int(args[k + 1])
        del args[k:k + 2]
    if not args:
        loi("thieu ten file content. Vi du: python make.py content.jsx")

    files = []
    for a in args:
        files.extend(sorted(glob.glob(a)) or [a])

    t0 = time.time()
    jsxs = []
    for c in files:
        print("== %s" % os.path.basename(c))
        jsxs.append(noi_file(c, nhanh))

    ket = chay_illustrator(jsxs)

    for c, jsx, kq in zip(files, jsxs, ket):
        print("-- %s" % os.path.basename(c))
        print("  " + re.sub(r"\s*\| pdf=.*$", "", kq))
        pdf = tim_pdf(jsx, kq)
        if pdf and os.path.exists(pdf):
            gan_bookmark(pdf)          # truoc khi ra soat: PDF cuoi cung phai co bookmark
            kiem_xuong_dong(pdf)
            ra_soat(pdf, ve_anh, dpi)
            if co_giao:
                giao(pdf, co_mo)
            elif co_mo:
                giao_chi_mo(pdf)
        else:
            print("  (khong doc duoc duong dan PDF tu content, bo qua ra soat)")

    print("== xong %d tai lieu trong %.1f s%s"
          % (len(files), time.time() - t0, " (che do --nhanh)" if nhanh else ""))
    if ve_anh:
        print("   NHAC: may chi bat duoc trang THUA CHU. Chong chu, tran khung, "
              "logo cham tieu de thi phai soi anh bang mat.")


if __name__ == "__main__":
    main()
