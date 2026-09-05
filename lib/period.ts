import {
  daysBetweenYmd,
  isYmd,
  monthDateRange,
  parseYmd,
  shiftYmd,
  vnDayEnd,
  vnDayStart,
  vnNow,
} from "@/lib/format";

export type Period = {
  /** `null` khi đang xem tất cả thời gian hoặc khoảng ngày tùy chọn. */
  month: number | null;
  year: number | null;
  all: boolean;
  /** `YYYY-MM-DD` — lọc theo ngày thật, ghi đè month/year. */
  from?: string | null;
  to?: string | null;
};

export type SearchParamsInput = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function readNumberParam(
  params: SearchParamsInput,
  key: string,
): number | null {
  const raw = firstValue(params[key]);
  if (raw === undefined || raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function readStringParam(params: SearchParamsInput, key: string) {
  const raw = firstValue(params[key]);
  return raw && raw.length > 0 ? raw : null;
}

export function readBooleanParam(params: SearchParamsInput, key: string) {
  const raw = firstValue(params[key]);
  return raw === "1" || raw === "true";
}

export function hasDateRange(period: Period) {
  return Boolean(period.from || period.to);
}

/** Khoảng ngày đang áp dụng: `from`/`to` hoặc đầu–cuối tháng đang chọn. */
export function periodToDateRange(period: Period) {
  if (period.from || period.to) {
    return {
      from: period.from ?? period.to!,
      to: period.to ?? period.from!,
    };
  }
  if (period.all || !period.month || !period.year) return null;
  return monthDateRange(period.month, period.year);
}

/**
 * Nếu khoảng đúng một tháng dương lịch thì giữ filter theo tháng,
 * không thì chuyển sang `from`/`to`.
 */
export function rangeToPeriod(from: string, to: string): Period {
  const start = parseYmd(from);
  const full = monthDateRange(start.month, start.year);
  if (from === full.from && to === full.to) {
    return { month: start.month, year: start.year, all: false };
  }
  return { month: null, year: null, all: false, from, to };
}

/**
 * Đọc kỳ đang xem từ query string. `from`/`to` được ưu tiên hơn tháng/năm.
 * Mặc định là tháng hiện tại theo giờ VN.
 */
export function readPeriod(params: SearchParamsInput): Period {
  const fromRaw = readStringParam(params, "from");
  const toRaw = readStringParam(params, "to");
  const from = isYmd(fromRaw) ? fromRaw : null;
  const to = isYmd(toRaw) ? toRaw : null;

  if (from || to) {
    if (from && to && from > to) {
      return { month: null, year: null, all: false, from: to, to: from };
    }
    return { month: null, year: null, all: false, from, to };
  }

  if (readBooleanParam(params, "all")) {
    return { month: null, year: null, all: true };
  }

  const now = vnNow();
  const month = readNumberParam(params, "month");
  const year = readNumberParam(params, "year");

  return {
    month: month && month >= 1 && month <= 12 ? month : now.month,
    year: year && year >= 2000 && year <= 2100 ? year : now.year,
    all: false,
  };
}

/** Kỳ liền trước, dùng để so sánh biến động. */
export function previousPeriod(period: Period): Period {
  if (hasDateRange(period)) {
    const from = period.from ?? period.to!;
    const to = period.to ?? period.from!;
    const length = daysBetweenYmd(from, to) + 1;
    return {
      month: null,
      year: null,
      all: false,
      from: shiftYmd(from, -length),
      to: shiftYmd(to, -length),
    };
  }
  if (period.all || !period.month || !period.year) return period;
  return {
    month: period.month === 1 ? 12 : period.month - 1,
    year: period.month === 1 ? period.year - 1 : period.year,
    all: false,
  };
}

export function shiftPeriod(period: Period, delta: number): Period {
  if (hasDateRange(period)) {
    const from = period.from ?? period.to!;
    const to = period.to ?? period.from!;
    const length = daysBetweenYmd(from, to) + 1;
    const step = delta * length;
    return {
      month: null,
      year: null,
      all: false,
      from: shiftYmd(from, step),
      to: shiftYmd(to, step),
    };
  }
  if (period.all || !period.month || !period.year) return period;
  const zeroBased = period.month - 1 + delta;
  return {
    month: ((zeroBased % 12) + 12) % 12 + 1,
    year: period.year + Math.floor(zeroBased / 12),
    all: false,
  };
}

/** Ghi kỳ vào query, xóa các khóa kỳ cũ để không chồng month với from/to. */
export function writePeriodParams(params: URLSearchParams, next: Period) {
  params.delete("all");
  params.delete("month");
  params.delete("year");
  params.delete("from");
  params.delete("to");
  params.delete("page");

  if (next.from || next.to) {
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
    return;
  }
  if (next.all) {
    params.set("all", "1");
    return;
  }
  if (next.month) params.set("month", String(next.month));
  if (next.year) params.set("year", String(next.year));
}

export function appendPeriod(data: FormData, period: Period) {
  data.set("month", String(period.month ?? ""));
  data.set("year", String(period.year ?? ""));
  data.set("all", period.all ? "1" : "");
  data.set("from", period.from ?? "");
  data.set("to", period.to ?? "");
}

/** Chuỗi query của một kỳ, để dựng href cho nút lùi/tiến tháng. */
export function periodToQuery(period: Period) {
  if (period.from || period.to) {
    const parts: string[] = [];
    if (period.from) parts.push(`from=${period.from}`);
    if (period.to) parts.push(`to=${period.to}`);
    return parts.join("&");
  }
  if (period.all) return "all=1";
  return `month=${period.month}&year=${period.year}`;
}

/**
 * Danh sách N tháng gần nhất tính từ kỳ đang xem, cũ trước mới sau.
 * Dùng cho biểu đồ xu hướng.
 */
export function recentMonths(period: Period, count: number) {
  let anchor: Period;
  if (hasDateRange(period)) {
    const { year, month } = parseYmd((period.to ?? period.from)!);
    anchor = { month, year, all: false };
  } else if (period.all || !period.month || !period.year) {
    anchor = { month: vnNow().month, year: vnNow().year, all: false };
  } else {
    anchor = period;
  }

  return Array.from({ length: count }, (_, index) =>
    shiftPeriod(anchor, index - (count - 1)),
  ).map((item) => ({ month: item.month!, year: item.year! }));
}

/** Điều kiện `$match` của Mongo cho một kỳ. */
export function periodMatch(period: Period) {
  if (period.from || period.to) {
    const date: Record<string, Date> = {};
    if (period.from) date.$gte = vnDayStart(period.from);
    if (period.to) date.$lte = vnDayEnd(period.to);
    return { date };
  }
  if (period.all || !period.month || !period.year) return {};
  return { month: period.month, year: period.year };
}
