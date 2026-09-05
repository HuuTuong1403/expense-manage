# Design Spec — Giao diện Web Quản lý Chi tiêu

Tài liệu này là bản dịch từ 4 mockup trong `design/` sang hệ thống có thể code được bằng
Next.js 16 + Tailwind v4 + shadcn/ui.

- Nguồn thiết kế: `design/dashboard.html`, `design/bills.html`, `design/categories.html`, `design/balance.html`
- Mockup dùng hệ token **Material 3** và Tailwind CDN. Bản triển khai lấy **shadcn/ui làm chuẩn component**,
  nhưng **giá trị màu, thang chữ, spacing và bo góc lấy nguyên từ mockup**.
- Mockup chỉ có bảng màu light. Bảng dark trong tài liệu này được **suy ra theo quy tắc M3** từ seed `#00685f`.

---

## 1. Chiến lược: shadcn-first, giá trị M3

shadcn/ui đặt tên token theo vai trò (`background`, `card`, `muted`, `accent`...), còn mockup đặt tên theo
thang bề mặt M3 (`surface-container-low/high/highest`...). Cách hòa giải:

1. **Giữ đúng tên token của shadcn** để mọi component do CLI sinh ra hoạt động không cần sửa.
2. **Bổ sung thang bề mặt M3 như token phụ** (`--surface-lowest` → `--surface-highest`), vì mockup dùng tới
   5 mức bề mặt khác nhau còn shadcn chỉ có `card` và `muted`. Đây là bổ sung bắt buộc, không phải tùy chọn.
3. **Bổ sung token ngữ nghĩa tài chính** (`--income`, `--expense`, `--warning`, `--info`, `--overdue`).
4. Component thuần trình bày trong mockup (KPI card, bảng hóa đơn, donut, thanh công nợ hai chiều) **code tay**
   theo markup mockup; shadcn lo phần có logic (Dialog, Popover, Select, DropdownMenu, Command, Sheet, Drawer,
   Calendar, Checkbox, Tooltip, Sonner).

### Sai lệch có ý thức so với mockup

- Mockup đặt `borderRadius.full = 0.75rem`, nên avatar và badge trong mockup là hình bo 12px chứ không phải
  hình tròn/viên thuốc. Bản triển khai **trả `rounded-full` về 9999px** (avatar tròn, chip là viên thuốc) vì
  đó rõ ràng là ý định thiết kế; các khối lớn vẫn giữ 8px.
- Mockup đặt `borderRadius.DEFAULT = 2px` cho chip mã code rất nhỏ; bản triển khai dùng 4px (`rounded-sm`)
  để khớp thang radius của shadcn. Chênh lệch 2px này không nhìn thấy được.
- Mockup dùng cặp class `font-body-md text-body-md` (family + size). Bản triển khai chỉ cần `text-body-md`
  vì family đã set ở `body`; chữ số dùng thêm `font-mono`.
- Mockup dùng `font-label-numeric-*` với JetBrains Mono. Dự án đang cài Geist Mono → **đổi sang JetBrains Mono**.

---

## 2. Token màu

### 2.1 Light — map vai trò shadcn sang màu mockup

- `--background: #fbf8ff` (mockup `surface`/`background`)
- `--foreground: #1a1b22` (`on-surface`)
- `--card: #ffffff`, `--card-foreground: #1a1b22` (`surface-container-lowest`)
- `--popover: #ffffff`, `--popover-foreground: #1a1b22`
- `--primary: #00685f`, `--primary-foreground: #ffffff`
- `--secondary: #e8e7f1`, `--secondary-foreground: #1a1b22` (nút phụ trong mockup = `surface-container-high`)
- `--muted: #eeedf7`, `--muted-foreground: #6d7a77` (`surface-container` + `outline`)
- `--accent: #e8e7f1`, `--accent-foreground: #1a1b22` (trạng thái hover)
- `--destructive: #dc2626`, `--destructive-foreground: #ffffff` (mockup `danger`)
- `--border: #e3e1ec`, `--input: #f4f2fd`, `--ring: #00685f`
- Sidebar: `--sidebar: #ffffff`, `--sidebar-foreground: #3d4947`, `--sidebar-primary: #00685f`,
  `--sidebar-primary-foreground: #ffffff`, `--sidebar-accent: #e8e7f1`, `--sidebar-accent-foreground: #1a1b22`,
  `--sidebar-border: #e8e7f1`, `--sidebar-ring: #00685f`

Lưu ý về `--input`: mockup không dùng viền cho input mà dùng nền chìm `surface-container-low` + `focus:ring-1 ring-primary`.
Các component input của shadcn cần được sửa lại theo kiểu này (xem mục 6).

### 2.2 Light — token phụ bắt buộc

Thang bề mặt (dùng cho card lồng nhau, header bảng, footer card, chip):

- `--surface-lowest: #ffffff`
- `--surface-low: #f4f2fd`
- `--surface: #eeedf7`
- `--surface-high: #e8e7f1`
- `--surface-highest: #e3e1ec`
- `--on-surface-variant: #3d4947` (chữ cấp 2)
- `--outline: #6d7a77` (chữ cấp 3, nhãn)
- `--outline-variant: #bcc9c6` (đường kẻ mảnh)

Ngữ nghĩa tài chính:

- `--income: #16a34a` — thu nhập, đã thanh toán, số dương "được nhận"
- `--expense: #ea580c` — mức chi tăng so với kỳ trước
- `--warning: #d97706` — chưa thanh toán, ngân sách 80–100%
- `--info: #2563eb` — thông tin trung tính, mảng biểu đồ thứ hai
- `--overdue: #ffdad6`, `--overdue-foreground: #93000a` — nền dòng quá hạn và badge quá hạn
- `--primary-container: #008378`, `--on-primary-container: #f4fffc` — hover của nút primary
- `--secondary-container: #6df5e1`, `--on-secondary-container: #006f64` — tông avatar thành viên #2
- `--tertiary: #924628`, `--tertiary-soft: #ffdbce`, `--on-tertiary-soft: #370e00` — tông avatar #3, mảng biểu đồ #5
- `--toast: #2f3038`, `--toast-foreground: #f1effa` — toast dùng bề mặt đảo

Biểu đồ (đúng thứ tự màu trong donut của mockup):

- `--chart-1: #00685f`, `--chart-2: #2563eb`, `--chart-3: #ea580c`, `--chart-4: #d97706`, `--chart-5: #924628`

### 2.3 Dark — suy ra theo M3 từ seed `#00685f`

Nguyên tắc: **không đảo màu, mà đổi tông**. Primary trong dark là tone 80, chữ trên primary là tone 20,
bề mặt sáng dần theo độ cao thay vì dùng shadow. Một số giá trị đã có sẵn trong config mockup
(`inverse-primary`, `primary-fixed`, `on-primary-fixed-variant`) chính là các tone dark của cùng seed nên
được dùng lại nguyên vẹn.

- `--background: #0f1413`, `--foreground: #dee4e2`
- `--card: #171d1c`, `--popover: #171d1c`, cả hai `-foreground: #dee4e2`
- Thang bề mặt: `--surface-lowest: #0a0f0e`, `--surface-low: #171d1c`, `--surface: #1b2121`,
  `--surface-high: #262c2b`, `--surface-highest: #313736`
- `--primary: #6bd8cb` (mockup `inverse-primary`), `--primary-foreground: #00382f`,
  `--primary-container: #005049` (mockup `on-primary-fixed-variant`), `--on-primary-container: #89f5e7` (mockup `primary-fixed`)
- `--secondary: #262c2b`, `--secondary-foreground: #dee4e2`
- `--muted: #1b2121`, `--muted-foreground: #889390`
- `--accent: #262c2b`, `--accent-foreground: #dee4e2`
- `--destructive: #f87171`, `--destructive-foreground: #450a0a`
- `--border: #2a3130`, `--input: #1b2121`, `--ring: #6bd8cb`
- `--on-surface-variant: #bec9c6`, `--outline: #889390`, `--outline-variant: #3f4948`
- Ngữ nghĩa (giảm chroma, tăng lightness để không bị rực trên nền tối):
  `--income: #4ade80`, `--expense: #fb923c`, `--warning: #fbbf24`, `--info: #60a5fa`
- `--overdue: #93000a`, `--overdue-foreground: #ffdad6` (M3 đảo cặp này trong dark)
- `--secondary-container: #005048`, `--on-secondary-container: #6df5e1`
- `--tertiary: #ffb59a`, `--tertiary-soft: #773215`, `--on-tertiary-soft: #ffdbce`
- `--toast: #dee4e2`, `--toast-foreground: #1a1b22` (đảo ngược so với light)
- Biểu đồ: `#6bd8cb`, `#60a5fa`, `#fb923c`, `#fbbf24`, `#ffb59a`
- Sidebar: `--sidebar: #171d1c`, `--sidebar-foreground: #bec9c6`, `--sidebar-primary: #6bd8cb`,
  `--sidebar-primary-foreground: #00382f`, `--sidebar-accent: #262c2b`, `--sidebar-accent-foreground: #dee4e2`,
  `--sidebar-border: #262c2b`
- Trong dark, `shadow-sm` gần như vô hình → card phân tách bằng thang bề mặt và `border`, không dựa vào shadow.

---

## 3. Chữ, spacing, bo góc, đổ bóng

### 3.1 Thang chữ (khai báo dạng `--text-*` của Tailwind v4 để giữ đúng tên của mockup)

- `headline-xl` 32/40, letter-spacing -0.02em, weight 600 — tiêu đề trang (Danh mục chi tiêu)
- `headline-xl-mobile` 26/32, -0.015em, 600
- `headline-lg` 24/32, -0.015em, 600 — tiêu đề khối lớn (Đối soát công nợ nội bộ)
- `headline-md` 20/28, -0.01em, 600 — tiêu đề modal, wordmark
- `headline-sm` 16/24, 600 — tiêu đề card, nhãn nút
- `body-lg` 16/24, 400
- `body-md` 14/20, 400 — cỡ chữ mặc định của app
- `body-sm` 12/16, 400 — nhãn phụ, mô tả
- `label-numeric-lg` 24/32, -0.02em, 600, **mono** — số KPI
- `label-numeric-md` 16/24, 500, **mono** — số tiền trong bảng và card
- `label-numeric-sm` 13/18, 500, **mono** — số tiền phụ, nhãn kỳ
- `label-code` 11/14, 500, **mono** — mã bill, mã danh mục, badge trạng thái, kbd

Font: `Geist` cho chữ (đã có sẵn qua `next/font/google`), `JetBrains Mono` cho toàn bộ số và mã.
Mọi số tiền bắt buộc `tabular-nums`.

### 3.2 Spacing

`gutter-xs 4px` · `gutter-sm 8px` · `gutter-md 16px` · `gutter-lg 24px` · `gutter-xl 32px` ·
`card-padding 20px` · padding trang: 16px (mobile) / 32px (desktop).

### 3.3 Bo góc

`--radius: 0.5rem` → `rounded-sm` 4px (chip mã), `rounded-md` 6px (input, nút nhỏ trong bảng),
`rounded-lg` 8px (card, nút chính, chip danh mục), `rounded-xl` 12px (modal lớn),
`rounded-full` 9999px (avatar, badge trạng thái, chip bộ lọc).

### 3.4 Đổ bóng

- `shadow-sm` cho mọi card.
- `--shadow-rail: 0 1px 8px rgb(0 0 0 / 0.04)` cho sidebar và header (mockup dùng giá trị arbitrary này).
- `hover:shadow-md` cho card có thể tương tác (card danh mục, card giao dịch đối soát).

### 3.5 Icon

Material Symbols Outlined, cỡ dùng trong mockup: 12 / 14 / 15 / 16 / 18 / 20 / 24 / 26 px.
Bọc trong một component `<Icon name="receipt_long" size={20} />` render `<span className="material-symbols-outlined">`.
Icon nội bộ của shadcn (lucide) giữ nguyên ở những chỗ không xuất hiện trong mockup.

---

## 4. App shell

### 4.1 Sidebar (desktop)

`fixed left-0 top-0 h-full w-64`, nền `card`, `shadow-rail`, `z-50`, chia trên/dưới.

- Hàng logo `h-16 px-4`: logo 32px + wordmark `text-headline-md text-primary font-bold` "Chi Tiêu".
- Nhãn nhóm: `text-body-sm text-outline uppercase tracking-wider font-semibold`, padding trên 8–16px.
- Nhóm và mục (đúng thứ tự mockup):
  - **Tổng quan**: `dashboard` Dashboard · `bar_chart` Báo cáo
  - **Dữ liệu**: `receipt_long` Hóa đơn · `category` Danh mục · `group` Thành viên
  - **Thanh toán**: `balance` Đối soát công nợ · `account_balance_wallet` Ngân sách
- Mục: `flex items-center gap-3 px-2 py-2 rounded-lg`, icon 20px.
  Active: `bg-primary text-primary-foreground font-semibold` + `aria-current="page"`.
  Hover: `bg-surface-high text-foreground`.
- Chân sidebar: card `bg-surface-low rounded-lg m-2 p-2` chứa avatar 36px tròn `bg-primary`,
  tên `text-headline-sm`, `@username` `text-label-code text-outline`, và nút icon `settings` dẫn tới Cài đặt.

### 4.2 Header

`fixed top-0 left-64 right-0 h-16 z-40`, nền `card/90` + `backdrop-blur-xl`, `shadow-rail`, `px-4`.

- Trái: breadcrumb — nhóm cha `text-on-surface-variant` → `chevron_right` 16px → trang hiện tại `font-semibold`.
  (Mockup hardcode "Tổng quan › Dashboard"; bản triển khai suy ra từ route.)
- Phải, `gap-4`:
  1. **Bộ chọn kỳ**: pill `bg-surface rounded-lg p-0.5 shadow-sm` gồm nút `chevron_left`,
     nhãn `text-label-numeric-sm font-semibold` "Tháng 9/2026" + `arrow_drop_down`, nút `chevron_right`.
  2. **Tìm kiếm**: `h-9 pl-9 pr-12 bg-surface-low rounded-lg w-48 lg:w-64`, icon `search` 18px bên trái,
     `<kbd>⌘K</kbd>` `bg-surface-highest text-label-code` bên phải. Ẩn dưới `sm`.
  3. **Đổi theme**: nút icon `light_mode` / `dark_mode` 20px.
  4. **CTA**: `h-9 px-4 rounded-lg bg-primary text-headline-sm font-semibold` + icon `add` 18px, "Thêm hóa đơn".
  5. Avatar 32px tròn.

### 4.3 Main

`pt-16 px-4 lg:px-8 bg-background min-h-screen`, nội dung `flex flex-col pb-12` (bills/categories/balance dùng `pb-16`).

### 4.4 Mobile — cần tự thiết kế (mockup không có bản mobile)

Bám đúng ngôn ngữ thị giác đã có:

- Sidebar → `Sheet` trượt từ trái, mở bằng nút `menu` thêm vào đầu header. Bỏ `pl-64`, header `left-0`.
- Header dưới `md`: `[menu] [tiêu đề trang] … [pill kỳ] [nút + icon]`. Ô tìm kiếm thu thành icon mở `Command` dialog.
- Bottom nav `< sm`: Dashboard · Hóa đơn · Đối soát · Danh mục, cộng nút tròn nổi ở giữa để thêm hóa đơn.
  Main thêm `pb-20` để không bị che.
- Lưới KPI `grid-cols-1 sm:grid-cols-2`, các khối 12-cột về 1 cột.
- Bảng hóa đơn → danh sách card (mục 5.2).

---

## 5. Bố cục từng trang

### 5.1 Dashboard (`design/dashboard.html`)

Thứ tự khối, tất cả dùng `gap-6`:

1. **4 KPI card** — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Mỗi card: nhãn `text-body-sm text-outline font-medium`
   + icon chip 1 góc phải; số `text-label-numeric-lg` với đơn vị `₫` cỡ nhỏ `text-outline`; dòng phụ ở dưới.
   - Tổng chi — số màu `foreground`, dòng phụ là badge `bg-expense/10 text-expense` "↑ 12,4%" + "so với T8 (11,1M)"
   - Chưa thanh toán — số màu `warning`, icon chip `bg-warning/10`, dòng phụ có dot `animate-pulse`
   - Số hóa đơn — "27 khoản", dòng phụ "22 đã trả · 5 chưa trả" (income · warning)
   - Dự báo cuối tháng — số màu `primary`, dòng phụ "Dựa theo nhịp tiêu hiện tại"
2. **Chi tiêu theo danh mục (7/12) + Xu hướng (5/12)** — `lg:grid-cols-12`.
   - Donut: SVG 192px, `viewBox 0 0 160 160`, `r=62`, `stroke-width=16`, `stroke-linecap="round"`,
     xoay `-rotate-90`, vòng nền `stroke-surface`, mỗi mảng là một `<circle>` dùng `stroke-dasharray` +
     `stroke-dashoffset`. Giữa donut: "Tổng chi" / số rút gọn "12.450k" / "VND".
   - Legend bên phải (5/12 và 7/12 bên trong): mỗi dòng gồm dot màu + emoji + tên, số tiền + `%`, và một
     progress mảnh `h-1.5` cùng màu.
   - Xu hướng: cột dựng bằng `div` (`max-w-[28px]`, `rounded-t`), 6 tháng gần nhất; cột tháng hiện tại
     `bg-primary` + nhãn `T9*` in đậm màu primary, các cột khác `bg-surface-high` + `hover:bg-primary/40`
     và hiện giá trị khi hover. Có đường trung bình gạch đứt + nhãn "11.4M". Chân khối: chú thích + link "Xem 12 tháng".
3. **Tiến độ ngân sách (6/12) + Chi tiêu theo thành viên (6/12)**
   - Ngân sách: badge "1 mục vượt trần" (warning) ở tiêu đề; mỗi dòng: emoji + tên, "đã chi / hạn mức" + `%`,
     progress `h-2`. Ngưỡng màu: `< 80%` primary, `80–100%` warning, `> 100%` danger.
     Dòng vượt trần bọc thêm `bg-danger/5 rounded-md p-2` và badge "Vượt 150.000 ₫" (`bg-danger text-white`).
   - Thành viên: avatar 36px (mỗi người một tông: primary / secondary-container / surface-highest / surface-high),
     tên + "14 hóa đơn đã tạo"; bên phải số tiền `text-label-numeric-md`, progress mini `w-16 h-1` + `%`.
4. **Hóa đơn gần nhất (7/12) + Sắp đến hạn / Quá hạn (5/12)**
   - Bảng gọn 5 cột: Mã (`#BILL-27` mono) · Nội dung · Danh mục (emoji + tên) · Số tiền (phải) · Trạng thái (badge).
     Dòng chưa trả nhuộm `bg-warning/5` và số tiền màu warning. Link "Xem tất cả (27)".
   - Panel việc gấp: badge "2 việc gấp" (`bg-overdue text-overdue-foreground`); mỗi item là khối
     `bg-surface-low rounded-md p-3`: icon chip (`warning` danger cho quá hạn, `notifications_active` warning cho sắp tới),
     tên, "Hạn: 08/09 · Quá hạn 2 ngày", số tiền phải; hàng dưới: "Người phụ trách: …" +
     nút "Thanh toán ngay" (primary) hoặc "Nhắc nhở" (nút phụ, gửi Telegram).
     Chân panel: dòng gợi ý có icon `tips_and_updates` — "Hóa đơn tự động đối soát lúc 23:00 hàng ngày."

### 5.2 Hóa đơn (`design/bills.html`)

1. **4 KPI theo bộ lọc** — `md:grid-cols-4`: Tổng chi theo bộ lọc (+ "/ 27 bills" + dot + nhãn kỳ) ·
   Đã thanh toán (income + `%`) · Chờ thanh toán (warning + số bill) · Quá hạn cần xử lý (danger + số bill + tên hóa đơn).
2. **Toolbar** (card): ô tìm kiếm `min-w-[220px] max-w-xs` có nút xóa; 4 nút filter dạng
   `bg-surface-low h-9 rounded-lg` với cấu trúc `Nhãn: <giá trị đậm màu> ▾` (Danh mục / Thành viên / Trạng thái / Khoảng tiền);
   bên phải: "Xuất Excel ▾", "Nhập dữ liệu", và "Thêm hóa đơn" (primary, `active:scale-95`).
   Hàng dưới: "Đang áp dụng:" + các chip bộ lọc dạng viên thuốc có nút `close`
   (chip trạng thái nhuộm theo màu ngữ nghĩa) + link "Xóa tất cả bộ lọc".
3. **Thanh hành động khi chọn nhiều** — chỉ hiện khi có dòng được chọn:
   `bg-primary text-primary-foreground rounded-lg px-4 py-2`, icon `check_box`, "Đã chọn **3** hóa đơn",
   vạch chia, nút "Đánh dấu đã trả" (`bg-primary-foreground/10`) và "Xóa hóa đơn" (`bg-destructive/80`);
   bên phải "Tổng bộ lọc hiện tại: 12.450.000 ₫".
4. **Bảng**: `thead` nền `surface-low`, chữ `text-label-code uppercase tracking-wider text-outline`.
   Cột: checkbox (w-10) · Mã bill · Ngày (`02/09`) · Danh mục · Mô tả chi tiết (min-w-200) · Người trả ·
   Số tiền (phải) · Trạng thái (giữa) · nút thao tác (w-12). Thân bảng `divide-y divide-surface-high/40`.
   - Mã bill: `text-label-code`, nút `content_copy` chỉ hiện khi hover dòng (`group-hover:opacity-100`).
   - Danh mục: chip `bg-surface rounded-md px-2 py-0.5` gồm emoji + tên.
   - Người trả: avatar 24px + tên ngắn.
   - Số tiền: `text-label-numeric-md tabular-nums font-semibold`, căn phải.
   - Trạng thái: `Đã trả` (`bg-income/10 text-income`) · `Chưa trả` (`bg-warning/10 text-warning`) ·
     `Quá hạn 3 ngày` (`bg-overdue text-overdue-foreground` + icon `alarm` 12px), tất cả `rounded-full`.
   - Dòng quá hạn: nền `bg-overdue/20`, thêm dải dọc `absolute left-0 w-1 bg-destructive`, và dưới mô tả có
     dòng "Hạn thanh toán: 03/09/2026" màu destructive.
   - Dòng đang chọn: `bg-surface-high/20`.
5. **Chân bảng**: nền `surface-low`, trái "Hiển thị **1–8** của **27** hóa đơn • Trang 1 / 4",
   phải phân trang có số trang `h-8 w-8 rounded-md` (trang hiện tại `bg-primary`), nút Trước/Sau (disabled có `cursor-not-allowed`).
6. **Mobile**: mỗi hóa đơn thành card — hàng 1 chip danh mục + số tiền; hàng 2 mô tả; hàng 3
   ngày · người trả · badge trạng thái · nút `more_horiz`. Dòng quá hạn giữ dải màu bên trái.
   Toolbar filter gom vào `Sheet` có badge đếm số filter đang bật.

### 5.3 Danh mục (`design/categories.html`)

1. **Nền trang trí**: 2 khối blur `blur-3xl -z-10` (`bg-primary-fixed/30` góc trên trái, `bg-secondary-container/20` phải).
   Giữ ở mức rất nhẹ, tắt khi `prefers-reduced-motion` không liên quan nhưng cần kiểm tra tương phản chữ.
2. **Page header**: badge "CẤU HÌNH HỆ THỐNG" (`bg-primary/10 text-primary text-label-code uppercase`) +
   "• Đồng bộ Telegram Bot @…", `h1` `text-headline-xl font-bold`, mô tả `text-body-md text-on-surface-variant`.
   Bên phải: nút "Nhập khẩu" (`bg-surface-high`) + "Thêm danh mục mới" (primary).
3. **4 KPI**: Tổng ngân sách tháng · Đã chi tiêu (badge `%` + "Còn lại …") · Số danh mục ("8 hoạt động") ·
   Cảnh báo vượt (nhãn và số màu danger). Mỗi card: icon chip 32px `rounded-md` góc phải,
   một dải màu `h-0.5` sát đáy card thể hiện trạng thái, `hover:shadow-md` và icon `scale-105`.
4. **Toolbar**: ô lọc `h-8 w-72 rounded-md` ("Lọc theo tên, tag bot, mã code…"), nút "Bộ lọc" (`filter_list`);
   bên phải segmented "Tất cả (8) / Cảnh báo (1) / An toàn (7)" (`bg-surface-low p-0.5 rounded-md`,
   mục active `bg-card shadow-sm text-primary font-semibold`) và "Sắp xếp: Tỷ lệ dùng ▾".
5. **Lưới card**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5`. Mỗi card:
   - Đầu: icon tile 40px `rounded-lg bg-surface text-xl` chứa emoji; tên `text-headline-sm truncate`;
     hàng meta = chip mã code (`bg-surface-high text-label-code`) + dot + nhãn ngữ cảnh
     ("Gia đình" / "Cần kiểm soát" danger / "Ổn định" income); nút `more_horiz`.
   - Giữa: "Tháng này" + số tiền `text-label-numeric-md`; progress `h-1.5`; hàng "Ngân sách: 5.000.000 ₫" + `%`.
   - Chân full-bleed: `-mx-[card-padding] bg-surface-low/60 rounded-b-lg`, trái icon `receipt` + "12 hóa đơn",
     phải badge ngữ cảnh ("Thường xuyên nhất" primary / "Vượt 150.000 ₫" danger / "Còn 800k" income /
     "Trung bình 72k/lần" / chip phụ trách có avatar mini).
   - Card vượt ngân sách: `ring-1 ring-destructive/30`, tag góc trên phải "VƯỢT NGÂN SÁCH"
     (`bg-destructive text-white rounded-bl-md`), icon tile `bg-overdue/30`, số tiền danger, chân `bg-overdue/20`.
6. **Banner tích hợp bot**: icon tile 48px `smart_toy`, tiêu đề "Cú pháp phân loại tự động qua Telegram",
   mô tả có `<code>` chip (`50k cafe Starbuck`), 2 nút phụ.
7. **Modal thêm/sửa danh mục** (`max-w-lg`): header `bg-surface-low` có icon tile + tiêu đề + nút close.
   Form: hàng 1 `grid-cols-4` (icon picker 1 cột + Tên danh mục 3 cột) · hàng 2 `grid-cols-2`
   (Mã code bot có prefix `/`, Định mức tháng) · Từ khóa nhận diện tự động + helper text ·
   hàng 4 `grid-cols-2` (Phụ trách mặc định, Nhóm chi tiêu) · footer "Hủy bỏ" + "Lưu danh mục".
   Trường bắt buộc đánh dấu `*` màu destructive. Input dùng nền chìm `bg-surface-low`, không viền.

### 5.4 Đối soát công nợ (`design/balance.html`)

1. **Panel ngữ cảnh**: card `p-5 lg:p-8` có blob `bg-primary/5 blur-3xl` góc trên phải.
   Badge "KỲ QUYẾT TOÁN MỞ" có dot `animate-pulse` + "· Tháng 9/2026"; `h1` `text-headline-lg`; mô tả.
   Bên phải: segmented 2 tab "Chia đều (Mặc định)" / "Chia theo trọng số"
   (`bg-surface p-1 rounded-lg shadow-inner`, tab active `bg-card text-primary shadow-sm`).
   Dưới: 3 metric tile `bg-surface-low rounded-lg p-4` (icon tile 48px + nhãn uppercase + số `label-numeric-lg` + dòng phụ):
   Tổng chi tháng · Thành viên tham gia ("04 người", "100% đã xác nhận") · Bình quân mỗi người (số màu primary).
   Tile `hover:-translate-y-0.5`.
2. **Biểu đồ công nợ hai chiều**: tiêu đề + chip "Trục 0 cân bằng" + legend 2 màu
   (danger "Bên nợ (Chi < Bình quân)", income "Bên nhận (Chi > Bình quân)").
   Hàng trục `grid-cols-12`: 5 cột "CẦN ĐÓNG THÊM (−)" căn phải màu danger · 2 cột chip "Mốc 0 ₫" ·
   5 cột "ĐƯỢC NHẬN VỀ (+)" căn trái màu income. Vạch 0: `absolute left-1/2 w-0.5 bg-surface-highest`.
   Mỗi thành viên là một khối `bg-surface-low/60 rounded-lg p-3.5`:
   - Hàng trên: avatar 32px + tên `text-headline-sm` + "Đã chi 6.800.000 ₫" (`text-label-code text-outline`);
     bên phải "+2.300.000 ₫ (Được nhận lại)" income hoặc "−1.962.500 ₫ (Còn nợ)" danger.
   - Hàng dưới `grid-cols-12 h-6`: thanh `h-5` nằm nửa phải (`rounded-r-lg bg-income`, `pl-2`) hoặc
     nửa trái (`rounded-l-lg bg-destructive`, `justify-end pr-2`), độ dài theo `%`, chữ số in trong thanh.
3. **Gợi ý chuyển khoản**: tiêu đề `text-headline-lg` + icon `auto_mode`, mô tả "rút gọn từ 6 phiên về 3 giao dịch",
   badge "Tối ưu 50% thao tác" (income). Lưới `lg:grid-cols-3`, mỗi giao dịch một card:
   - Dải gradient `h-1` trên đỉnh (`from-primary via-primary-container to-secondary`).
   - Badge "Giao dịch #01" + trạng thái "Chờ chuyển" (warning, dot `animate-ping`).
   - Khối hai bên `bg-surface-low rounded-lg p-3`: avatar 40px + tên + "Người trả" | `arrow_forward` + nhãn "VietQR" |
     tên + "Người nhận" + avatar 40px.
   - "Số tiền cần chuyển" + số `text-label-numeric-lg text-primary`.
   - Khối nội dung chuyển khoản `bg-surface rounded-md`: chuỗi `select-all` dạng
     "Doi soat thang 9 - Quyen tra Danh" + nút `content_copy`.
   - 2 nút full-width: "Xem mã QR VietQR" (primary, `qr_code_2`) và "Ghi nhận đã chuyển khoản" (`bg-surface`).
     Sau khi ghi nhận: nút đổi thành "Đã xác nhận xong" (`bg-income/10 text-income` + `verified`, disabled),
     badge đổi thành "Hoàn tất" màu income, và hiện toast.
4. **Chân trang**: card 7/12 "Cơ chế tối ưu hóa bù trừ công nợ" (icon `psychology`, 3 gạch đầu dòng
   `check_circle` income, chip mã phiên `#SETTLE-2026-09-VERIFIED` + "Đã kiểm tra cân đối thu chi") và
   card 5/12 "Xuất dữ liệu & Thông báo" (nút "Xuất biên bản đối soát (PDF/Excel)" và
   "Gửi thông báo vào nhóm Telegram" kèm badge "Gia Đình (4)"; chân: lần đối soát gần nhất + người lập).
5. **Modal VietQR** (`max-w-sm`): tiêu đề + phụ đề "Quét trực tiếp qua mọi App Ngân hàng";
   QR 192px trong khung `bg-card p-3 rounded-md` đặt trên nền `bg-surface-low`; dưới QR: thông tin bank
   (`text-label-code text-primary`), "Người nhận: …", số tiền `text-label-numeric-md text-primary font-bold`;
   khối nội dung chuyển `select-all`; 2 nút "Đóng" / "Tải ảnh QR".
6. **Toast**: `fixed bottom-6 right-6`, `bg-toast text-toast-foreground rounded-lg px-4 py-3`, icon trạng thái 20px.
   Triển khai bằng `sonner` với theme tùy biến đúng cặp màu này.

### 5.5 Trang chưa có mockup — thiết kế suy ra

Cần dựng theo đúng ngôn ngữ đã thiết lập, và nên được bạn xem lại trước khi code:

- **Thành viên** — page header như trang Danh mục; 3 KPI (số thành viên, tổng chi kỳ, người chi nhiều nhất);
  bảng theo khuôn bảng hóa đơn với cột avatar + tên, `@username`, `telegramId` (mono), vai trò,
  trọng số chia tiền, thông tin ngân hàng cho VietQR, tổng chi kỳ, hoạt động cuối, trạng thái.
  Thành viên đã tắt: opacity 60% + badge "Đã tắt".
- **Ngân sách** — danh sách danh mục kèm ô nhập hạn mức tháng, tổng hạn mức so với tổng thu nhập dự kiến,
  và khối tiến độ giống mục 3 của Dashboard nhưng đầy đủ danh mục.
- **Báo cáo** — chọn 2 kỳ để so sánh, bảng chênh lệch theo danh mục (số tiền và `%`),
  bar đôi, và nút xuất Excel nhiều sheet.
- **Cài đặt** — tabs: Ngân sách · Hóa đơn định kỳ · Thông báo Telegram · Giao diện (theme, định dạng số).

---

## 6. Component: cái gì lấy từ shadcn, cái gì code tay

### Lấy từ shadcn CLI rồi restyle theo mockup

`dialog` · `sheet` · `drawer` · `popover` · `dropdown-menu` · `select` · `command` · `calendar` ·
`checkbox` · `switch` · `tooltip` · `alert-dialog` · `sonner` · `tabs` · `skeleton` · `separator` · `scroll-area`.

Sửa bắt buộc sau khi generate:

- `input`, `select`, `textarea`: đổi từ `border border-input` sang nền chìm `bg-surface-low border-0`
  + `focus-visible:ring-1 ring-primary`, chiều cao `h-9`, chữ `text-body-md`.
- `button`: thêm biến thể `primary` (`bg-primary hover:bg-primary-container text-headline-sm font-semibold h-9 px-4 rounded-lg`)
  và `subtle` (`bg-surface-low hover:bg-surface`), thêm `active:scale-95` cho CTA.
- `badge`: thêm biến thể `income` / `warning` / `overdue` / `code`, mặc định `rounded-full text-label-code font-bold`.
- `dropdown-menu`, `select`: nền `popover`, item hover `bg-accent`, radius `rounded-md`.
- `sonner`: cấu hình `bg-toast text-toast-foreground`, đặt góc dưới phải (desktop) / trên (mobile).

### Code tay theo mockup

- `layout/`: `app-sidebar`, `app-header`, `breadcrumb-from-route`, `period-picker`, `theme-toggle`,
  `mobile-bottom-nav`, `command-palette`
- `ui-m3/`: `Icon` (Material Symbols), `Money` (định dạng + mono + tabular + rút gọn), `StatCard`,
  `SectionCard` (card có tiêu đề + mô tả + slot phải), `StatusBadge`, `CategoryChip`, `MemberAvatar`,
  `ProgressBar` (tự đổi màu theo ngưỡng), `EmptyState`, `PageHeader`, `Segmented`, `FilterButton`, `FilterChips`
- `charts/`: `CategoryDonut` (SVG `stroke-dasharray`), `MonthlyBars` (div + đường trung bình gạch đứt),
  `DivergingBalanceBars`, `MiniProgress`
- `bills/`: `BillsTable`, `BillCardList` (mobile), `BillsToolbar`, `BulkActionBar`, `BillsPagination`, `BillFormDialog`
- `categories/`: `CategoryCard`, `CategoryFormDialog`, `BotSyntaxBanner`
- `balance/`: `SettlementCard`, `VietQrDialog`, `SettlementMethodTabs`, `AlgorithmNoteCard`, `ExportShareCard`
- `excel/`: `ImportDialog` (3 bước: chọn file → xem trước và lỗi từng dòng → xác nhận), `ExportMenu`

---

## 7. Trạng thái, chuyển động, tiếp cận

- **Đang tải**: `Skeleton` giữ đúng khung thật (4 khối KPI, 8 dòng bảng, khối donut vuông), đặt trong `loading.tsx` từng route.
- **Rỗng**: icon Material Symbols mờ + một câu + một nút hành động. Ví dụ bảng hóa đơn rỗng:
  "Không có hóa đơn nào khớp bộ lọc" + "Xóa bộ lọc" + "Thêm hóa đơn".
- **Lỗi**: `error.tsx` tiếng Việt + nút "Thử lại"; chi tiết lỗi chỉ hiện ở dev.
- **Đang ghi**: nút có spinner và disabled; toggle "đã trả" dùng optimistic update; xóa luôn qua `AlertDialog`
  và toast có "Hoàn tác".
- **Chuyển động** (đúng mockup): `transition-colors` 150ms cho hover; `active:scale-95` cho CTA;
  `hover:-translate-y-0.5` cho metric tile; `animate-pulse` cho dot "kỳ mở"/"chưa thanh toán";
  `animate-ping` cho dot "chờ chuyển"; progress `transition-all duration-500`; modal `fade-in zoom-in-95` 200ms.
  Tắt theo `prefers-reduced-motion`. Không animate khi đổi theme (`disableTransitionOnChange`).
- **Tiếp cận**: nút chỉ có icon cần `aria-label`; mục sidebar active dùng `aria-current="page"`;
  checkbox chọn dòng có nhãn ẩn "Chọn hóa đơn bill27"; không dùng màu làm tín hiệu duy nhất
  (badge luôn có chữ); kiểm tra tương phản AA cho `text-outline` trên `surface-low` ở cả hai theme —
  đây là cặp rủi ro nhất trong mockup.

---

## 8. Quy ước hiển thị dữ liệu

- Tiền: `12.450.000 ₫` (`vi-VN`, không thập phân), ký hiệu `₫` cỡ nhỏ màu `outline` khi đứng sau số KPI.
  Rút gọn: `12.450k` (giữa donut), `12.45M` / `11.4M` (trục biểu đồ), `800k` (badge "Còn 800k").
- Ngày: `02/09` trong bảng của kỳ hiện tại, `03/09/2026` khi nói về hạn thanh toán.
- Kỳ: "Tháng 9/2026" ở bộ chọn kỳ, `09/2026` ở nhãn phụ.
- Mã hóa đơn: `bill27` trong bảng (đúng dữ liệu bot), `#BILL-27` ở bảng gọn của Dashboard — **chọn một kiểu duy nhất**;
  đề xuất dùng `bill27` khớp với bot để copy sang Telegram là chạy được ngay.
- Phần trăm: 1 chữ số thập phân (`36.1%`, `12,4%`) — **thống nhất dùng dấu phẩy** theo `vi-VN`.
- Danh mục luôn có emoji trước tên. Thành viên luôn có avatar chữ cái với tông màu cố định theo người.
