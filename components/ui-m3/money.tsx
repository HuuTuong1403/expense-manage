import { cn } from "@/lib/utils";
import {
  formatMoney,
  formatMoneyShort,
  formatMoneyThousand,
} from "@/lib/format";

const SIZES = {
  lg: "text-numeric-lg",
  md: "text-numeric-md",
  sm: "text-numeric-sm",
  code: "text-code",
} as const;

const TONES = {
  default: "text-foreground",
  muted: "text-outline",
  variant: "text-on-surface-variant",
  primary: "text-primary",
  income: "text-income",
  warning: "text-warning",
  danger: "text-destructive",
  expense: "text-expense",
  inherit: "",
} as const;

const UNIT_SIZES = {
  lg: "text-body-md",
  md: "text-body-sm",
  sm: "text-body-sm",
  code: "text-code",
} as const;

type MoneyProps = {
  value: number;
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
  /** `full` = 12.450.000 · `short` = 12,45M · `thousand` = 12.450k */
  format?: "full" | "short" | "thousand";
  /** Hiện `₫` cỡ nhỏ màu nhạt phía sau, đúng như mockup. */
  unit?: boolean;
  /** Thêm dấu `+`/`−` để thể hiện chiều của số dư. */
  signed?: boolean;
  className?: string;
};

/**
 * Mọi số tiền trong app đi qua đây: luôn mono, luôn `tabular-nums` để các chữ
 * số thẳng cột khi xếp trong bảng.
 */
export function Money({
  value,
  size = "md",
  tone = "default",
  format = "full",
  unit = false,
  signed = false,
  className,
}: MoneyProps) {
  const magnitude = Math.abs(value);
  const body =
    format === "short"
      ? formatMoneyShort(magnitude)
      : format === "thousand"
        ? formatMoneyThousand(magnitude)
        : formatMoney(magnitude);

  const sign = signed ? (value > 0 ? "+" : value < 0 ? "−" : "") : "";

  return (
    <span
      className={cn(
        "font-mono tabular whitespace-nowrap",
        SIZES[size],
        TONES[tone],
        className,
      )}
    >
      {sign}
      {body}
      {unit ? (
        <span className={cn("ml-1 font-sans font-normal text-outline", UNIT_SIZES[size])}>
          ₫
        </span>
      ) : null}
    </span>
  );
}
