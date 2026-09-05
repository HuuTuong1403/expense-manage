export const VN_TIME_ZONE = "Asia/Ho_Chi_Minh";

const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const dayMonthYearFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: VN_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dayMonthFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: VN_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
});

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: VN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/* -------------------------------------------------------------------------- */
/* Ngày tháng                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Tách ngày/tháng/năm theo giờ Việt Nam.
 *
 * Luôn đọc theo múi giờ VN nên hiển thị đúng dù bot ghi `date` bằng giờ local
 * của máy chạy bot (VN) hay bằng giờ UTC.
 */
export function vnParts(date: Date | string | number) {
  const d = date instanceof Date ? date : new Date(date);
  const [year, month, day] = partsFormatter.format(d).split("-").map(Number);
  return { day, month, year };
}

/**
 * Tạo Date từ ngày trên lịch. Dùng UTC midnight để khi đọc lại theo giờ VN vẫn
 * ra đúng ngày đó.
 */
export function vnDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

export function vnNow() {
  return vnParts(new Date());
}

/** `05/09/2026` */
export function formatDate(date: Date | string | number) {
  const d = date instanceof Date ? date : new Date(date);
  return dayMonthYearFormatter.format(d);
}

/** `05/09` — dùng trong bảng khi đã biết rõ kỳ đang xem. */
export function formatDayMonth(date: Date | string | number) {
  const d = date instanceof Date ? date : new Date(date);
  return dayMonthFormatter.format(d);
}

/** Giá trị cho `<input type="date">`, luôn theo lịch VN. */
export function toDateInputValue(date: Date | string | number) {
  const { day, month, year } = vnParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** `Tháng 9/2026` */
export function formatPeriod(month: number | null, year: number | null) {
  if (!month || !year) return "Tất cả thời gian";
  return `${MONTH_NAMES[month - 1]}/${year}`;
}

const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isYmd(value: string | null | undefined): value is string {
  return Boolean(value && YMD_RE.test(value));
}

/** Tách `YYYY-MM-DD` thành số — ngày trên lịch, không phụ thuộc TZ máy. */
export function parseYmd(ymd: string) {
  const [, year, month, day] = YMD_RE.exec(ymd) ?? [];
  return { year: Number(year), month: Number(month), day: Number(day) };
}

/** Date local để đưa vào Calendar / react-day-picker. */
export function ymdToLocalDate(ymd: string) {
  const { year, month, day } = parseYmd(ymd);
  return new Date(year, month - 1, day);
}

export function shiftYmd(ymd: string, days: number) {
  const { year, month, day } = parseYmd(ymd);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function pad2(value: number) {
  return String(value).padStart(2, "0");
}

/** Số ngày của một tháng dương lịch. */
export function daysInMonth(month: number, year: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function monthDateRange(month: number, year: number) {
  return {
    from: `${year}-${pad2(month)}-01`,
    to: `${year}-${pad2(month)}-${pad2(daysInMonth(month, year))}`,
  };
}

export function daysBetweenYmd(from: string, to: string) {
  const start = parseYmd(from);
  const end = parseYmd(to);
  return Math.round(
    (Date.UTC(end.year, end.month - 1, end.day) -
      Date.UTC(start.year, start.month - 1, start.day)) /
      86_400_000,
  );
}

/** Đầu / cuối ngày theo lịch Việt Nam, dùng trong `$match` Mongo. */
export function vnDayStart(ymd: string) {
  return new Date(`${ymd}T00:00:00+07:00`);
}

export function vnDayEnd(ymd: string) {
  return new Date(`${ymd}T23:59:59.999+07:00`);
}

/** `05/09/2026` từ chuỗi `YYYY-MM-DD`. */
export function formatYmd(ymd: string) {
  return formatDate(`${ymd}T00:00:00+07:00`);
}

/** Nhãn kỳ: tháng, khoảng ngày, hoặc tất cả thời gian. */
export function formatPeriodLabel(period: {
  month?: number | null;
  year?: number | null;
  all?: boolean;
  from?: string | null;
  to?: string | null;
}) {
  if (period.from || period.to) {
    const from = period.from ? formatYmd(period.from) : "…";
    const to = period.to ? formatYmd(period.to) : "…";
    return from === to ? from : `${from} – ${to}`;
  }
  return formatPeriod(period.month ?? null, period.year ?? null);
}

/** `T9` — nhãn ngắn cho trục biểu đồ. */
export function formatMonthShort(month: number) {
  return `T${month}`;
}

/**
 * Số ngày lệch so với hôm nay theo lịch VN. Dương nghĩa là đã quá hạn.
 */
export function daysPastDue(dueDate: Date | string | number) {
  const due = vnParts(dueDate);
  const today = vnNow();
  const dueUtc = Date.UTC(due.year, due.month - 1, due.day);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  return Math.round((todayUtc - dueUtc) / 86_400_000);
}

/* -------------------------------------------------------------------------- */
/* Tiền                                                                       */
/* -------------------------------------------------------------------------- */

const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

/** `12.450.000` — không kèm ký hiệu để chỗ gọi tự đặt `₫` cỡ nhỏ. */
export function formatMoney(amount: number) {
  return moneyFormatter.format(Math.round(amount));
}

/** `12.450.000 ₫` */
export function formatMoneyWithUnit(amount: number) {
  return `${formatMoney(amount)} ₫`;
}

/**
 * `12.450k` — quy về nghìn, dùng ở giữa donut nơi không đủ chỗ cho số đầy đủ.
 */
export function formatMoneyThousand(amount: number) {
  return `${moneyFormatter.format(Math.round(amount / 1000))}k`;
}

/**
 * `12,45M` / `11,4M` / `800k` — nhãn trục biểu đồ và badge chật chỗ.
 */
export function formatMoneyShort(amount: number) {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) return `${trimZero(amount / 1_000_000_000, 2)} tỷ`;
  if (abs >= 1_000_000) return `${trimZero(amount / 1_000_000, 2)}M`;
  if (abs >= 1_000) return `${trimZero(amount / 1_000, 0)}k`;
  return formatMoney(amount);
}

function trimZero(value: number, digits: number) {
  return value
    .toFixed(digits)
    .replace(/\.?0+$/, "")
    .replace(".", ",");
}

/* -------------------------------------------------------------------------- */
/* Phần trăm                                                                  */
/* -------------------------------------------------------------------------- */

/** `36,1%` — luôn dùng dấu phẩy theo vi-VN. */
export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits).replace(".", ",")}%`;
}

/** `+12,4%` / `−8,2%` — có dấu để thể hiện biến động. */
export function formatSignedPercent(value: number, digits = 1) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(digits).replace(".", ",")}%`;
}

/** Tỉ lệ phần trăm an toàn khi mẫu số bằng 0. */
export function ratio(part: number, total: number) {
  if (!total) return 0;
  return (part / total) * 100;
}

/* -------------------------------------------------------------------------- */
/* Chuỗi                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Bỏ dấu tiếng Việt — dùng cho nội dung chuyển khoản ngân hàng vì hệ thống
 * Napas chỉ nhận ký tự ASCII.
 */
export function removeDiacritics(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/** Sinh mã code lowercase không dấu, không khoảng trắng từ tên hiển thị. */
export function toSlugCode(input: string) {
  return removeDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 24);
}

/** Chữ cái đầu để hiển thị trên avatar. */
export function initialOf(name: string | null | undefined) {
  const trimmed = (name ?? "").trim();
  return trimmed ? trimmed[0]!.toUpperCase() : "?";
}
