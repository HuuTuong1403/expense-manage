import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui-m3/icon";
import { Money } from "@/components/ui-m3/money";
import { StatCard } from "@/components/ui-m3/stat-card";
import { SurfaceCard, SectionCard } from "@/components/ui-m3/surface-card";
import { PageHeader } from "@/components/ui-m3/page-header";
import { EmptyState } from "@/components/ui-m3/empty-state";
import { MonthlyBars } from "@/components/charts/monthly-bars";
import { getBillSummary, getMonthlyTotals, getTotalsByCategory } from "@/lib/repositories/bills";
import {
  previousPeriod,
  readNumberParam,
  readPeriod,
  recentMonths,
  periodToQuery,
} from "@/lib/period";
import {
  formatPercent,
  formatPeriodLabel,
  formatSignedPercent,
  ratio,
} from "@/lib/format";
import { buildQuery } from "@/lib/query";

export default async function ReportsPage({
  searchParams,
}: PageProps<"/reports">) {
  const params = await searchParams;
  const periodA = readPeriod(params);
  const compareMonth = readNumberParam(params, "compareMonth");
  const compareYear = readNumberParam(params, "compareYear");
  const periodB =
    compareMonth && compareYear
      ? { month: compareMonth, year: compareYear, all: false }
      : previousPeriod(periodA);

  const [summaryA, summaryB, catsA, catsB, monthly] = await Promise.all([
    getBillSummary({ period: periodA }),
    getBillSummary({ period: periodB }),
    getTotalsByCategory(periodA),
    getTotalsByCategory(periodB),
    getMonthlyTotals(recentMonths(periodA, 12)),
  ]);

  const codes = new Set([
    ...catsA.map((item) => item.code),
    ...catsB.map((item) => item.code),
  ]);
  const lookupA = new Map(catsA.map((item) => [item.code, item]));
  const lookupB = new Map(catsB.map((item) => [item.code, item]));

  const rows = [...codes].map((code) => {
    const a = lookupA.get(code);
    const b = lookupB.get(code);
    const amountA = a?.total ?? 0;
    const amountB = b?.total ?? 0;
    return {
      code,
      name: a?.name ?? b?.name ?? code,
      icon: a?.icon ?? b?.icon ?? "📦",
      amountA,
      amountB,
      diff: amountA - amountB,
      percent: ratio(amountA - amountB, amountB),
    };
  }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  const change = ratio(
    summaryA.totalAmount - summaryB.totalAmount,
    summaryB.totalAmount,
  );

  const compareHref = (month: number, year: number) =>
    `?${buildQuery(params, { compareMonth: month, compareYear: year })}`;

  const prev = previousPeriod(periodA);
  const sameLastYear =
    periodA.month && periodA.year
      ? { month: periodA.month, year: periodA.year - 1 }
      : null;

  return (
    <div className="flex flex-col gap-gutter-lg">
      <PageHeader
        eyebrow="Tổng quan"
        title="Báo cáo"
        description={`So sánh ${formatPeriodLabel(periodA)} với ${formatPeriodLabel(periodB)}.`}
        actions={
          <Button
            size="md"
            render={
              <a
                href={`/api/reports/export?${periodToQuery(periodA)}&compareMonth=${periodB.month ?? ""}&compareYear=${periodB.year ?? ""}`}
              />
            }
          >
            <Icon name="file_download" size={18} />
            Xuất Excel nhiều sheet
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {prev.month && prev.year ? (
          <Link href={compareHref(prev.month, prev.year)}>
            <Badge variant={periodB.month === prev.month && periodB.year === prev.year ? "accent" : "secondary"}>
              Kỳ trước
            </Badge>
          </Link>
        ) : null}
        {sameLastYear ? (
          <Link href={compareHref(sameLastYear.month, sameLastYear.year)}>
            <Badge
              variant={
                periodB.month === sameLastYear.month &&
                periodB.year === sameLastYear.year
                  ? "accent"
                  : "secondary"
              }
            >
              Cùng kỳ năm trước
            </Badge>
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-gutter-md sm:grid-cols-3">
        <StatCard
          label={formatPeriodLabel(periodA)}
          icon="payments"
          amount={summaryA.totalAmount}
        />
        <StatCard
          label={formatPeriodLabel(periodB)}
          icon="analytics"
          amount={summaryB.totalAmount}
        />
        <StatCard
          label="Chênh lệch"
          icon="trending_up"
          amount={Math.abs(summaryA.totalAmount - summaryB.totalAmount)}
          valueTone={change > 0 ? "danger" : "income"}
          footer={
            <Badge variant={change > 0 ? "expense" : "income"}>
              {formatSignedPercent(change)}
            </Badge>
          }
        />
      </div>

      <SectionCard title="Xu hướng 12 tháng">
        <MonthlyBars
          data={monthly}
          activeMonth={periodA.month}
          activeYear={periodA.year}
        />
      </SectionCard>

      <SurfaceCard className="overflow-x-auto p-0">
        {rows.length === 0 ? (
          <EmptyState
            icon="bar_chart"
            title="Chưa có dữ liệu để so sánh"
            description="Thêm hóa đơn ở một trong hai kỳ."
          />
        ) : (
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-surface-low text-code tracking-wider text-outline uppercase">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Danh mục</th>
                <th className="px-3 py-2.5 text-right font-semibold">
                  {formatPeriodLabel(periodA)}
                </th>
                <th className="px-3 py-2.5 text-right font-semibold">
                  {formatPeriodLabel(periodB)}
                </th>
                <th className="px-3 py-2.5 text-right font-semibold">Chênh lệch</th>
                <th className="px-3 py-2.5 text-right font-semibold">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-high/40">
              {rows.map((row) => (
                <tr key={row.code}>
                  <td className="px-4 py-2.5">
                    {row.icon} {row.name}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Money value={row.amountA} size="sm" />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Money value={row.amountB} size="sm" />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Money
                      value={row.diff}
                      size="sm"
                      signed
                      tone={row.diff > 0 ? "expense" : row.diff < 0 ? "income" : "muted"}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-code">
                    {row.amountB ? formatPercent(row.percent) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SurfaceCard>
    </div>
  );
}
