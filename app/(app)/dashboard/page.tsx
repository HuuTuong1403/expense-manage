import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui-m3/icon";
import { Money } from "@/components/ui-m3/money";
import { StatCard } from "@/components/ui-m3/stat-card";
import { SectionCard } from "@/components/ui-m3/surface-card";
import { EmptyState } from "@/components/ui-m3/empty-state";
import { MemberAvatar } from "@/components/ui-m3/member-avatar";
import { BillStatusBadge } from "@/components/ui-m3/status-badge";
import {
  BUDGET_TEXT_CLASSES,
  ProgressBar,
  budgetTone,
} from "@/components/ui-m3/progress-bar";
import { ActionButton } from "@/components/ui-m3/action-button";
import { CategoryDonut } from "@/components/charts/category-donut";
import { MonthlyBars } from "@/components/charts/monthly-bars";
import { remindBillAction, setBillPaidAction } from "@/app/(app)/bills/actions";
import {
  getBillSummary,
  getDueBills,
  getMonthlyTotals,
  getRecentBills,
  getTotalsByCategory,
} from "@/lib/repositories/bills";
import { listCategoriesWithSpend } from "@/lib/repositories/categories";
import { listUsersWithSpend } from "@/lib/repositories/users";
import {
  hasDateRange,
  previousPeriod,
  readPeriod,
  recentMonths,
  periodToQuery,
} from "@/lib/period";
import {
  daysPastDue,
  formatDayMonth,
  formatMoneyShort,
  formatPercent,
  daysBetweenYmd,
  formatPeriodLabel,
  formatSignedPercent,
  ratio,
  vnNow,
} from "@/lib/format";
import { cn } from "@/lib/utils";

/** Số ngày của một tháng, để tính nhịp tiêu và dự báo cuối tháng. */
function daysInMonth(month: number, year: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const params = await searchParams;
  const period = readPeriod(params);
  const previous = previousPeriod(period);
  const periodLabel = formatPeriodLabel(period);

  const [
    summary,
    previousSummary,
    categoryTotals,
    categories,
    members,
    monthly,
    recent,
    dueBills,
  ] = await Promise.all([
    getBillSummary({ period }),
    getBillSummary({ period: previous }),
    getTotalsByCategory(period),
    listCategoriesWithSpend(period),
    listUsersWithSpend(period, { activeOnly: true }),
    getMonthlyTotals(recentMonths(period, 6)),
    getRecentBills(4, period),
    getDueBills(3),
  ]);

  const now = vnNow();
  const today = `${now.year}-${String(now.month).padStart(2, "0")}-${String(now.day).padStart(2, "0")}`;
  const isCurrentPeriod = hasDateRange(period)
    ? Boolean(
        period.from &&
          period.to &&
          period.from <= today &&
          today <= period.to,
      )
    : !period.all && period.month === now.month && period.year === now.year;

  const change =
    previousSummary.totalAmount > 0
      ? ratio(
          summary.totalAmount - previousSummary.totalAmount,
          previousSummary.totalAmount,
        )
      : null;

  const totalDays = hasDateRange(period)
    ? period.from && period.to
      ? daysBetweenYmd(period.from, period.to) + 1
      : 0
    : period.all
      ? 0
      : daysInMonth(period.month!, period.year!);
  const elapsedDays = hasDateRange(period)
    ? period.from
      ? Math.min(daysBetweenYmd(period.from, today) + 1, totalDays)
      : totalDays
    : isCurrentPeriod
      ? now.day
      : totalDays;
  const forecast =
    elapsedDays > 0 && totalDays > 0
      ? (summary.totalAmount / elapsedDays) * totalDays
      : summary.totalAmount;

  const budgeted = categories
    .filter((category) => category.budget > 0)
    .slice(0, 4);
  const overBudgetCount = categories.filter(
    (category) => category.budget > 0 && category.spent > category.budget,
  ).length;

  const memberTotal = members.reduce((sum, member) => sum + member.spent, 0);

  return (
    <div className="flex flex-col gap-gutter-lg">
      {/* 4 KPI */}
      <div className="grid grid-cols-1 gap-gutter-md sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tổng chi"
          icon="payments"
          amount={summary.totalAmount}
          footer={
            change === null ? (
              <span className="text-body-sm text-outline">
                Chưa có dữ liệu kỳ trước để so sánh
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={change > 0 ? "expense" : "income"}>
                  <Icon
                    name={change > 0 ? "arrow_upward" : "arrow_downward"}
                    size={14}
                  />
                  {formatSignedPercent(change)}
                </Badge>
                <span className="text-body-sm text-outline">
                  so với {formatPeriodLabel(previous)} (
                  {formatMoneyShort(previousSummary.totalAmount)})
                </span>
              </div>
            )
          }
        />

        <StatCard
          label="Chưa thanh toán"
          icon="schedule"
          iconTone="warning"
          amount={summary.unpaidAmount}
          valueTone="warning"
          footer={
            <div className="flex items-center gap-1.5">
              <span className="size-2 animate-pulse rounded-full bg-warning" />
              <span className="text-body-sm font-medium text-on-surface-variant">
                {summary.unpaidCount} hóa đơn cần thanh toán
              </span>
            </div>
          }
        />

        <StatCard
          label="Số hóa đơn"
          icon="receipt"
          value={summary.totalCount}
          valueUnit="khoản"
          footer={
            <div className="flex items-center gap-2 text-body-sm">
              <span className="font-medium text-income">
                {summary.paidCount} đã trả
              </span>
              <span className="text-outline">·</span>
              <span className="font-medium text-warning">
                {summary.unpaidCount} chưa trả
              </span>
            </div>
          }
        />

        <StatCard
          label={isCurrentPeriod ? "Dự báo cuối tháng" : "Đã chốt trong kỳ"}
          icon="trending_up"
          iconTone="primary"
          amount={isCurrentPeriod ? forecast : summary.totalAmount}
          valueTone="primary"
          footer={
            <div className="flex items-center gap-1.5">
              <Icon name="analytics" size={14} className="text-outline" />
              <span className="text-body-sm text-outline">
                {isCurrentPeriod
                  ? `Theo nhịp tiêu ${elapsedDays}/${totalDays} ngày`
                  : "Kỳ đã kết thúc"}
              </span>
            </div>
          }
        />
      </div>

      {/* Donut + xu hướng */}
      <div className="grid grid-cols-1 gap-gutter-lg lg:grid-cols-12">
        <SectionCard
          className="lg:col-span-7"
          title="Chi tiêu theo danh mục"
          description={`Phân bổ chi tiêu ${periodLabel.toLowerCase()}`}
          action={
            <Badge variant="secondary" className="font-mono">
              {categoryTotals.length} nhóm chi
            </Badge>
          }
        >
          {categoryTotals.length === 0 ? (
            <EmptyState
              icon="pie_chart"
              title="Chưa có chi tiêu trong kỳ này"
              description="Thêm hóa đơn đầu tiên để thấy phân bổ theo danh mục."
              action={
                <Link
                  href="/bills?new=1"
                  className="text-body-sm font-medium text-primary hover:underline"
                >
                  Thêm hóa đơn
                </Link>
              }
            />
          ) : (
            <CategoryDonut slices={categoryTotals} />
          )}
        </SectionCard>

        <SectionCard
          className="lg:col-span-5"
          title="Xu hướng chi tiêu"
          description="So sánh các tháng gần đây"
          action={
            <div className="flex items-center gap-1.5 font-mono text-code text-outline">
              <span className="inline-block w-3 border-t-2 border-dashed border-outline" />
              <span>Trung bình</span>
            </div>
          }
        >
          <MonthlyBars
            data={monthly}
            activeMonth={period.month}
            activeYear={period.year}
          />
          <div className="flex items-center justify-between pt-3 text-body-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-primary" />
              Kỳ đang xem
            </span>
            <Link
              href="/reports"
              className="flex items-center font-medium text-primary hover:underline"
            >
              Xem báo cáo
              <Icon name="chevron_right" size={16} />
            </Link>
          </div>
        </SectionCard>
      </div>

      {/* Ngân sách + thành viên */}
      <div className="grid grid-cols-1 gap-gutter-lg lg:grid-cols-12">
        <SectionCard
          className="lg:col-span-6"
          title="Tiến độ ngân sách"
          description={`Hạn mức chi theo từng nhóm ${periodLabel.toLowerCase()}`}
          action={
            overBudgetCount > 0 ? (
              <Badge variant="warning">{overBudgetCount} mục vượt trần</Badge>
            ) : (
              <Badge variant="income">Trong hạn mức</Badge>
            )
          }
        >
          {budgeted.length === 0 ? (
            <EmptyState
              icon="account_balance_wallet"
              title="Chưa đặt hạn mức nào"
              description="Đặt ngân sách cho từng danh mục để theo dõi mức chi."
              action={
                <Link
                  href="/budget"
                  className="text-body-sm font-medium text-primary hover:underline"
                >
                  Đặt ngân sách
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-gutter-md">
              {budgeted.map((category) => {
                const tone = budgetTone(category.percent, category.spent);
                const isOver = category.overBy > 0;

                return (
                  <div
                    key={category.code}
                    className={cn(
                      "flex flex-col gap-1.5",
                      isOver && "rounded-md bg-destructive/5 p-2",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-body-md font-medium text-foreground">
                        <span aria-hidden>{category.icon}</span>
                        {category.name}
                        {isOver ? (
                          <Badge variant="destructive">
                            Vượt {formatMoneyShort(category.overBy)}
                          </Badge>
                        ) : null}
                      </span>
                      <div className="flex items-center gap-2">
                        <Money
                          value={category.spent}
                          size="sm"
                          tone={isOver ? "danger" : "default"}
                        />
                        <span className="font-mono text-numeric-sm font-normal text-outline">
                          / {formatMoneyShort(category.budget)}
                        </span>
                        <span
                          className={cn(
                            "font-mono text-numeric-sm font-semibold",
                            BUDGET_TEXT_CLASSES[tone],
                          )}
                        >
                          {formatPercent(category.percent, 0)}
                        </span>
                      </div>
                    </div>
                    <ProgressBar
                      percent={category.percent}
                      tone={tone}
                      height={2}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          className="lg:col-span-6"
          title="Chi tiêu theo thành viên"
          description="Số tiền đã ứng trước để chi trả"
          action={
            <Link
              href={`/balance?${periodToQuery(period)}`}
              className="text-body-sm font-medium text-primary hover:underline"
            >
              Bảng công nợ
            </Link>
          }
        >
          {members.length === 0 ? (
            <EmptyState
              icon="group"
              title="Chưa có thành viên nào"
              description="Thêm thành viên để chia và đối soát chi tiêu."
              action={
                <Link
                  href="/users"
                  className="text-body-sm font-medium text-primary hover:underline"
                >
                  Thêm thành viên
                </Link>
              }
            />
          ) : (
            <ul className="flex flex-col gap-3.5">
              {members.map((member) => {
                const percent = ratio(member.spent, memberTotal);

                return (
                  <li
                    key={member.telegramId}
                    className="flex items-center justify-between gap-gutter-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <MemberAvatar
                        name={member.name}
                        id={member.telegramId}
                        size={36}
                      />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-body-md font-semibold text-foreground">
                          {member.name}
                        </span>
                        <span className="font-mono text-code text-outline">
                          {member.billCount} hóa đơn đã tạo
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Money value={member.spent} size="md" />
                      <div className="mt-0.5 flex items-center justify-end gap-1.5">
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-surface">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                        <span className="font-mono text-code font-semibold text-outline">
                          {formatPercent(percent)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Hóa đơn gần nhất + việc gấp */}
      <div className="grid grid-cols-1 gap-gutter-lg lg:grid-cols-12">
        <SectionCard
          className="lg:col-span-7"
          title="Hóa đơn gần nhất"
          description="Giao dịch phát sinh mới nhất trong kỳ"
          action={
            <Link
              href={`/bills?${periodToQuery(period)}`}
              className="flex items-center gap-0.5 text-body-sm font-medium text-primary hover:underline"
            >
              Xem tất cả ({summary.totalCount})
              <Icon name="chevron_right" size={16} />
            </Link>
          }
        >
          {recent.length === 0 ? (
            <EmptyState
              icon="receipt_long"
              title="Chưa có hóa đơn nào"
              description="Hóa đơn thêm từ web hoặc từ bot Telegram đều hiện ở đây."
            />
          ) : (
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-body-sm tracking-wider text-outline uppercase">
                    <th className="pb-2.5 font-semibold">Mã</th>
                    <th className="pb-2.5 font-semibold">Nội dung</th>
                    <th className="hidden pb-2.5 font-semibold sm:table-cell">
                      Danh mục
                    </th>
                    <th className="pb-2.5 text-right font-semibold">Số tiền</th>
                    <th className="pb-2.5 text-right font-semibold">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-high/40 text-body-md">
                  {recent.map((bill) => (
                    <tr
                      key={bill.id}
                      className={cn(
                        "transition-colors hover:bg-surface-low/60",
                        !bill.isPaid && "bg-warning/5",
                      )}
                    >
                      <td className="py-2.5 font-mono text-code font-medium text-outline">
                        {bill.code}
                      </td>
                      <td className="py-2.5 font-medium text-foreground">
                        <span className="line-clamp-1">
                          {bill.description || bill.category.name}
                        </span>
                      </td>
                      <td className="hidden py-2.5 text-body-sm text-on-surface-variant sm:table-cell">
                        {bill.category.icon} {bill.category.name}
                      </td>
                      <td className="py-2.5 text-right">
                        <Money
                          value={bill.amount}
                          size="sm"
                          tone={bill.isPaid ? "default" : "warning"}
                        />
                      </td>
                      <td className="py-2.5 text-right">
                        <BillStatusBadge
                          isPaid={bill.isPaid}
                          dueDate={bill.dueDate}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard
          className="lg:col-span-5"
          title="Sắp đến hạn / Quá hạn"
          description="Các khoản chi bắt buộc cần hoàn tất"
          action={
            dueBills.length > 0 ? (
              <Badge variant="overdue">{dueBills.length} việc gấp</Badge>
            ) : null
          }
        >
          {dueBills.length === 0 ? (
            <EmptyState
              icon="task_alt"
              title="Không có khoản nào tới hạn"
              description="Thêm hạn thanh toán cho hóa đơn để được nhắc trước."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {dueBills.map((bill) => {
                const overdueDays = bill.dueDate
                  ? daysPastDue(bill.dueDate)
                  : 0;
                const isLate = overdueDays > 0;

                return (
                  <div
                    key={bill.id}
                    className="flex flex-col gap-2 rounded-md bg-surface-low p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={cn(
                            "flex items-center justify-center rounded-md p-1.5",
                            isLate
                              ? "bg-destructive/10 text-destructive"
                              : "bg-warning/10 text-warning",
                          )}
                        >
                          <Icon
                            name={isLate ? "warning" : "notifications_active"}
                            size={20}
                          />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-body-md font-semibold text-foreground">
                            {bill.description || bill.category.name}
                          </h3>
                          <div
                            className={cn(
                              "flex items-center gap-1.5 font-mono text-code font-medium",
                              isLate ? "text-destructive" : "text-warning",
                            )}
                          >
                            <span>
                              Hạn: {bill.dueDate ? formatDayMonth(bill.dueDate) : "—"}
                            </span>
                            <span>·</span>
                            <span className={isLate ? "font-bold" : undefined}>
                              {isLate
                                ? `Quá hạn ${overdueDays} ngày`
                                : `Còn ${Math.abs(overdueDays)} ngày`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Money
                        value={bill.amount}
                        size="md"
                        tone={isLate ? "danger" : "default"}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-body-sm text-outline">
                        Người phụ trách: {bill.username ?? "—"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <ActionButton
                          action={remindBillAction.bind(null, bill.code)}
                          variant="subtle"
                          size="sm"
                        >
                          <Icon name="send" size={16} />
                          Nhắc nhở
                        </ActionButton>
                        <ActionButton
                          action={setBillPaidAction.bind(null, bill.code, true)}
                          size="sm"
                        >
                          <Icon name="check_circle" size={16} />
                          Thanh toán
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 pt-2.5 text-body-sm text-outline">
            <Icon name="tips_and_updates" size={16} className="text-primary" />
            <span>
              Hóa đơn thêm từ bot Telegram hiện ở đây ngay, không cần đồng bộ.
            </span>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
