/**
 * Bảng màu biểu đồ.
 *
 * Trên web dùng CSS variable để tự đổi theo light/dark. File Excel không đọc
 * được CSS variable nên có thêm bảng hex cố định (bản light) để màu trong file
 * khớp với màu trên web.
 */
export const CHART_COLOR_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
] as const;

export const CHART_COLOR_HEX = [
  "00685F",
  "2563EB",
  "EA580C",
  "D97706",
  "924628",
  "16A34A",
  "7C3AED",
  "0891B2",
] as const;

const PALETTE_SIZE = CHART_COLOR_VARS.length;

function hashCode(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1_000_003;
  }
  return hash;
}

/**
 * Gán màu cho một tập danh mục.
 *
 * Vị trí màu suy ra từ mã danh mục nên một danh mục giữ nguyên màu ở mọi biểu
 * đồ và mọi lần load. Khi hai mã băm trùng slot thì lấy slot trống kế tiếp để
 * trong cùng một biểu đồ không có hai mảng cùng màu.
 */
export function assignChartColors(codes: string[]) {
  const taken = new Set<number>();
  const result = new Map<string, number>();

  for (const code of codes) {
    let slot = hashCode(code) % PALETTE_SIZE;
    let attempts = 0;
    while (taken.has(slot) && attempts < PALETTE_SIZE) {
      slot = (slot + 1) % PALETTE_SIZE;
      attempts += 1;
    }
    taken.add(slot);
    result.set(code, slot);
  }

  return result;
}

export function chartColorVar(slot: number) {
  return CHART_COLOR_VARS[slot % PALETTE_SIZE]!;
}

export function chartColorHex(slot: number) {
  return CHART_COLOR_HEX[slot % PALETTE_SIZE]!;
}
