import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui-m3/icon";
import { Money } from "@/components/ui-m3/money";
import { SurfaceCard } from "@/components/ui-m3/surface-card";
import type { IconName } from "@/lib/icons";

const ICON_TONES = {
  neutral: "bg-surface-low text-on-surface-variant",
  primary: "bg-surface-low text-primary",
  income: "bg-income/10 text-income",
  warning: "bg-warning/10 text-warning",
  danger: "bg-overdue/40 text-destructive",
} as const;

const VALUE_TONES = {
  default: "default",
  primary: "primary",
  income: "income",
  warning: "warning",
  danger: "danger",
} as const;

const VALUE_TEXT_TONES = {
  default: "text-foreground",
  primary: "text-primary",
  income: "text-income",
  warning: "text-warning",
  danger: "text-destructive",
} as const;

type StatCardProps = {
  label: string;
  icon: IconName;
  iconTone?: keyof typeof ICON_TONES;
  /** Giá trị là số tiền — sẽ được định dạng qua `Money`. */
  amount?: number;
  /** Hoặc là một giá trị tuỳ ý (số lượng, "04 người"…). */
  value?: React.ReactNode;
  /** Đơn vị đi kèm khi dùng `value`, hiển thị nhỏ và nhạt hơn. */
  valueUnit?: string;
  valueTone?: keyof typeof VALUE_TONES;
  /** Dòng phụ dưới cùng: badge biến động, chú thích, cảnh báo. */
  footer?: React.ReactNode;
  /** Dải màu mảnh sát đáy card, dùng ở trang Danh mục. */
  accent?: string;
  className?: string;
};

export function StatCard({
  label,
  icon,
  iconTone = "neutral",
  amount,
  value,
  valueUnit,
  valueTone = "default",
  footer,
  accent,
  className,
}: StatCardProps) {
  return (
    <SurfaceCard
      className={cn(
        "relative flex flex-col justify-between overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-sm font-medium text-outline">{label}</span>
        <span
          className={cn(
            "flex items-center justify-center rounded-md p-1",
            ICON_TONES[iconTone],
          )}
        >
          <Icon name={icon} size={18} />
        </span>
      </div>

      <div className="mt-3">
        {amount !== undefined ? (
          <Money value={amount} size="lg" tone={VALUE_TONES[valueTone]} unit />
        ) : (
          <div
            className={cn(
              "font-mono tabular text-numeric-lg",
              VALUE_TEXT_TONES[valueTone],
            )}
          >
            {value}
            {valueUnit ? (
              <span className="ml-1 font-sans text-body-md font-normal text-outline">
                {valueUnit}
              </span>
            ) : null}
          </div>
        )}
        {footer ? <div className="mt-2">{footer}</div> : null}
      </div>

      {accent ? (
        <div className={cn("absolute inset-x-0 bottom-0 h-0.5", accent)} />
      ) : null}
    </SurfaceCard>
  );
}
