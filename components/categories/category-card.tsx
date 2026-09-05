import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui-m3/icon";
import { Money } from "@/components/ui-m3/money";
import { ProgressBar, budgetTone } from "@/components/ui-m3/progress-bar";
import { CategoryActions } from "@/components/categories/category-actions";
import { formatMoneyShort, formatPercent } from "@/lib/format";
import { categoryGroupLabel, type CategoryWithSpend } from "@/lib/types";

type Member = { telegramId: number; name: string };

/** Nhãn ngữ cảnh suy ra từ mức dùng ngân sách, thay vì bắt người dùng tự nhập. */
function contextLabel(category: CategoryWithSpend) {
  if (category.overBy > 0) return { text: "Cần kiểm soát", tone: "danger" };
  if (category.budget > 0 && category.percent >= 80)
    return { text: "Sát hạn mức", tone: "warning" };
  if (category.spent === 0) return { text: "Chưa phát sinh", tone: "muted" };
  return { text: "Ổn định", tone: "income" };
}

const CONTEXT_CLASSES: Record<string, string> = {
  danger: "text-destructive font-medium",
  warning: "text-warning font-medium",
  income: "text-income font-medium",
  muted: "text-outline",
};

export function CategoryCard({
  category,
  members,
  others,
  isMostUsed,
}: {
  category: CategoryWithSpend;
  members: Member[];
  others: { code: string; name: string; icon: string }[];
  isMostUsed: boolean;
}) {
  const isOver = category.overBy > 0;
  const tone = budgetTone(category.percent, category.spent);
  const context = contextLabel(category);
  const remaining = Math.max(category.budget - category.spent, 0);

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-lg bg-card p-card shadow-sm transition-all duration-200 hover:shadow-md",
        isOver && "ring-1 ring-destructive/30",
      )}
    >
      {isOver ? (
        <div className="absolute top-0 right-0">
          <div className="rounded-bl-md bg-destructive px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-destructive-foreground uppercase shadow-sm">
            Vượt ngân sách
          </div>
        </div>
      ) : null}

      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg text-xl shadow-sm",
                isOver ? "bg-overdue/30" : "bg-surface",
              )}
            >
              <span aria-hidden>{category.icon}</span>
            </div>
            <div className="flex min-w-0 flex-col">
              <h2 className="truncate text-headline-sm text-foreground">
                {category.name}
              </h2>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge variant="code">{category.code}</Badge>
                <span
                  aria-hidden
                  className="size-1 rounded-full bg-outline"
                />
                <span
                  className={cn("text-body-sm", CONTEXT_CLASSES[context.tone])}
                >
                  {context.text}
                </span>
              </div>
            </div>
          </div>

          <div className={cn(isOver && "mt-6")}>
            <CategoryActions
              category={category}
              billCount={category.billCount}
              members={members}
              others={others}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={cn(
                "text-body-sm font-medium",
                isOver ? "font-semibold text-destructive" : "text-outline",
              )}
            >
              Tháng này
            </span>
            <Money
              value={category.spent}
              size="md"
              tone={isOver ? "danger" : "default"}
              unit
            />
          </div>

          <ProgressBar
            percent={category.budget > 0 ? category.percent : 0}
            tone={tone}
            height={1.5}
            trackClassName={isOver ? "bg-overdue/40" : undefined}
          />

          <div className="flex items-center justify-between pt-0.5 text-body-sm text-outline">
            <span>
              {category.budget > 0
                ? `Ngân sách: ${formatMoneyShort(category.budget)}`
                : "Chưa đặt ngân sách"}
            </span>
            {category.budget > 0 ? (
              <span
                className={cn(
                  "font-mono text-code font-semibold",
                  isOver ? "text-destructive" : undefined,
                )}
              >
                {formatPercent(category.percent, 0)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "-mx-card -mb-card mt-4 flex items-center justify-between gap-2 rounded-b-lg px-card pt-4 pb-3",
          isOver ? "bg-overdue/20" : "bg-surface-low/60",
        )}
      >
        <div className="flex items-center gap-1.5">
          <Icon
            name="receipt"
            size={15}
            className={isOver ? "text-destructive" : "text-outline"}
          />
          <span className="text-body-sm font-medium text-on-surface-variant">
            {category.billCount} hóa đơn
          </span>
        </div>

        {isOver ? (
          <Badge variant="destructive">
            Vượt {formatMoneyShort(category.overBy)}
          </Badge>
        ) : isMostUsed ? (
          <Badge variant="accent">Thường xuyên nhất</Badge>
        ) : category.budget > 0 ? (
          <span className="flex items-center gap-0.5 text-body-sm text-income">
            <Icon name="check_circle" size={14} />
            Còn {formatMoneyShort(remaining)}
          </span>
        ) : category.billCount > 0 ? (
          <span className="text-body-sm text-outline">
            Trung bình {formatMoneyShort(category.spent / category.billCount)}/lần
          </span>
        ) : (
          <span className="text-body-sm font-medium text-on-surface-variant">
            {categoryGroupLabel(category.group)}
          </span>
        )}
      </div>
    </article>
  );
}
