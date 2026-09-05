import { Input } from "@/components/ui/input";
import { Money } from "@/components/ui-m3/money";
import { StatCard } from "@/components/ui-m3/stat-card";
import { SurfaceCard } from "@/components/ui-m3/surface-card";
import { PageHeader } from "@/components/ui-m3/page-header";
import { EmptyState } from "@/components/ui-m3/empty-state";
import { ProgressBar, budgetTone } from "@/components/ui-m3/progress-bar";
import { BudgetSaveButton } from "@/components/budget/budget-save-button";
import {
  saveDefaultBudgetsAction,
  savePeriodBudgetsAction,
} from "@/app/(app)/budget/actions";
import { listCategoriesWithSpend } from "@/lib/repositories/categories";
import { readPeriod } from "@/lib/period";
import { formatMoney, formatPercent, formatPeriodLabel } from "@/lib/format";

export default async function BudgetPage({
  searchParams,
}: PageProps<"/budget">) {
  const params = await searchParams;
  const period = readPeriod(params);
  const categories = await listCategoriesWithSpend(period);
  const totalBudget = categories.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = categories.reduce((sum, item) => sum + item.spent, 0);
  const over = categories.filter((item) => item.overBy > 0);

  return (
    <div className="flex flex-col gap-gutter-lg">
      <PageHeader
        eyebrow="Thanh toán"
        title="Ngân sách"
        description={`Hạn mức ${formatPeriodLabel(period)}. Có thể đặt mặc định hoặc ghi đè riêng cho tháng đang xem.`}
      />

      <div className="grid grid-cols-1 gap-gutter-md sm:grid-cols-3">
        <StatCard label="Tổng hạn mức" icon="account_balance_wallet" amount={totalBudget} />
        <StatCard
          label="Đã chi"
          icon="payments"
          amount={totalSpent}
          valueTone={totalSpent > totalBudget && totalBudget > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Vượt trần"
          icon="warning"
          iconTone="danger"
          value={over.length}
          valueUnit="danh mục"
        />
      </div>

      {categories.length === 0 ? (
        <SurfaceCard>
          <EmptyState
            icon="account_balance_wallet"
            title="Chưa có danh mục"
            description="Tạo danh mục trước khi đặt hạn mức."
          />
        </SurfaceCard>
      ) : (
        <SurfaceCard>
          <form className="flex flex-col gap-4">
            {period.month && period.year ? (
              <>
                <input type="hidden" name="month" value={period.month} />
                <input type="hidden" name="year" value={period.year} />
              </>
            ) : null}

            {categories.map((category) => {
              const tone = budgetTone(category.percent, category.spent);
              return (
                <div key={category.code} className="grid grid-cols-1 gap-2 border-b border-surface-high/50 pb-4 last:border-0 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-3">
                    <p className="font-semibold">
                      {category.icon} {category.name}
                    </p>
                    <p className="font-mono text-code text-outline">{category.code}</p>
                  </div>
                  <div className="md:col-span-4">
                    <ProgressBar percent={category.percent} tone={tone} height={2} />
                    <p className="mt-1 text-body-sm text-outline">
                      {formatMoney(category.spent)} / {formatMoney(category.budget)} ₫ ·{" "}
                      {formatPercent(category.percent)}
                    </p>
                  </div>
                  <div className="md:col-span-3">
                    <input type="hidden" name="code" value={category.code} />
                    <Input
                      name="amount"
                      inputMode="numeric"
                      defaultValue={
                        category.budget ? category.budget.toLocaleString("vi-VN") : ""
                      }
                      placeholder="0"
                      className="font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    {category.overBy > 0 ? (
                      <span className="text-body-sm font-semibold text-destructive">
                        Vượt <Money value={category.overBy} size="sm" tone="danger" />
                      </span>
                    ) : (
                      <span className="text-body-sm text-outline">Trong hạn mức</span>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap gap-2">
              <BudgetSaveButton
                action={saveDefaultBudgetsAction}
                label="Lưu làm mặc định"
              />
              {period.month && period.year ? (
                <BudgetSaveButton
                  action={savePeriodBudgetsAction}
                  label={`Ghi đè ${formatPeriodLabel(period)}`}
                  variant="secondary"
                />
              ) : null}
            </div>
          </form>
        </SurfaceCard>
      )}
    </div>
  );
}
