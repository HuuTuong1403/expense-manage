import { cn } from "@/lib/utils";

export type BudgetTone = "primary" | "warning" | "danger" | "idle";

const FILL_CLASSES: Record<BudgetTone, string> = {
  primary: "bg-primary",
  warning: "bg-warning",
  danger: "bg-destructive",
  idle: "bg-outline-variant",
};

export const BUDGET_TEXT_CLASSES: Record<BudgetTone, string> = {
  primary: "text-primary",
  warning: "text-warning",
  danger: "text-destructive",
  idle: "text-outline",
};

/**
 * Ngưỡng màu ngân sách theo mockup: dưới 80% dùng màu thương hiệu,
 * 80–100% cảnh báo, trên 100% là vượt trần.
 */
export function budgetTone(percent: number, spent = 1): BudgetTone {
  if (spent <= 0) return "idle";
  if (percent > 100) return "danger";
  if (percent >= 80) return "warning";
  return "primary";
}

type ProgressBarProps = {
  /** Phần trăm đã dùng; giá trị trên 100 vẫn vẽ đầy thanh. */
  percent: number;
  tone?: BudgetTone;
  /** Chiều cao thanh: 1 = 4px (mini), 1.5 = 6px, 2 = 8px. */
  height?: 1 | 1.5 | 2;
  className?: string;
  trackClassName?: string;
};

const HEIGHTS = {
  1: "h-1",
  1.5: "h-1.5",
  2: "h-2",
} as const;

export function ProgressBar({
  percent,
  tone = "primary",
  height = 1.5,
  className,
  trackClassName,
}: ProgressBarProps) {
  const width = Math.max(0, Math.min(100, percent));

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-surface",
        HEIGHTS[height],
        trackClassName,
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          FILL_CLASSES[tone],
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
