import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui-m3/icon";
import { StatCard } from "@/components/ui-m3/stat-card";
import { SurfaceCard } from "@/components/ui-m3/surface-card";
import { EmptyState } from "@/components/ui-m3/empty-state";
import { SearchInput } from "@/components/ui-m3/search-input";
import { DateRangeFilter } from "@/components/bills/date-range-filter";
import { UrlFilter } from "@/components/ui-m3/url-filter";
import { FilterChips } from "@/components/bills/filter-chips";
import { BillsWorkspace } from "@/components/bills/bills-workspace";
import { BillsPagination } from "@/components/bills/bills-pagination";
import {
  BillFormDialog,
  NewBillFromQuery,
} from "@/components/bills/bill-form-dialog";
import { ExportMenu } from "@/components/excel/export-menu";
import { ImportDialog } from "@/components/excel/import-dialog";
import {
  BILLS_PAGE_SIZE,
  getBillSummary,
  listBills,
  type BillFilters,
} from "@/lib/repositories/bills";
import { listCategories } from "@/lib/repositories/categories";
import { listActiveUsers } from "@/lib/repositories/users";
import { getCurrentUser } from "@/lib/current-user";
import {
  periodToQuery,
  readNumberParam,
  readPeriod,
  readStringParam,
  type SearchParamsInput,
} from "@/lib/period";
import { formatPercent, formatPeriodLabel, ratio } from "@/lib/format";
import { buildQuery } from "@/lib/query";

const AMOUNT_PRESETS = [
  { value: "0-100000", label: "Dưới 100k" },
  { value: "100000-500000", label: "100k – 500k" },
  { value: "500000-1000000", label: "500k – 1 triệu" },
  { value: "1000000-", label: "Trên 1 triệu" },
];

function readFilters(params: SearchParamsInput): BillFilters {
  const amount = readStringParam(params, "amount");
  let amountMin = readNumberParam(params, "amountMin");
  let amountMax = readNumberParam(params, "amountMax");
  if (amount) {
    const [min, max] = amount.split("-");
    amountMin = min ? Number(min) : null;
    amountMax = max ? Number(max) : null;
  }

  return {
    period: readPeriod(params),
    categoryCode: readStringParam(params, "category"),
    userId: readNumberParam(params, "user"),
    status: (readStringParam(params, "status") as BillFilters["status"]) ?? "all",
    amountMin,
    amountMax,
    search: readStringParam(params, "q"),
  };
}

export default async function BillsPage({
  searchParams,
}: PageProps<"/bills">) {
  const params = await searchParams;
  const filters = readFilters(params);
  const page = readNumberParam(params, "page") ?? 1;

  const [list, summary, categories, members, currentUser] = await Promise.all([
    listBills(filters, page),
    getBillSummary(filters),
    listCategories(),
    listActiveUsers(),
    getCurrentUser().catch(() => null),
  ]);

  const query = buildQuery(params, {});
  const chips = [
    filters.search
      ? { key: "q", label: `Tìm: ${filters.search}` }
      : null,
    filters.categoryCode
      ? {
          key: "category",
          label:
            categories.find((item) => item.code === filters.categoryCode)
              ?.name ?? filters.categoryCode,
        }
      : null,
    filters.userId
      ? {
          key: "user",
          label:
            members.find((item) => item.telegramId === filters.userId)?.name ??
            String(filters.userId),
        }
      : null,
    filters.status && filters.status !== "all"
      ? {
          key: "status",
          label:
            filters.status === "paid"
              ? "Đã trả"
              : filters.status === "unpaid"
                ? "Chưa trả"
                : "Quá hạn",
          variant:
            filters.status === "paid"
              ? "income"
              : filters.status === "overdue"
                ? "warning"
                : "warning",
        }
      : null,
    readStringParam(params, "amount")
      ? {
          key: "amount",
          label:
            AMOUNT_PRESETS.find(
              (item) => item.value === readStringParam(params, "amount"),
            )?.label ?? "Khoảng tiền",
        }
      : null,
    filters.period.from || filters.period.to
      ? {
          key: "range",
          label: formatPeriodLabel(filters.period),
        }
      : null,
  ].filter(Boolean) as { key: string; label: string; variant?: "warning" | "income" }[];

  const from =
    list.totalCount === 0 ? 0 : (list.page - 1) * BILLS_PAGE_SIZE + 1;
  const to = Math.min(list.page * BILLS_PAGE_SIZE, list.totalCount);

  return (
    <div className="flex flex-col gap-gutter-lg">
      <NewBillFromQuery
        categories={categories}
        members={members}
        defaultUserId={currentUser?.telegramId}
      />

      <div className="grid grid-cols-1 gap-gutter-md sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tổng chi theo bộ lọc"
          icon="payments"
          amount={summary.totalAmount}
          footer={
            <span className="text-body-sm text-outline">
              / {summary.totalCount} bills · {formatPeriodLabel(filters.period)}
            </span>
          }
        />
        <StatCard
          label="Đã thanh toán"
          icon="task_alt"
          iconTone="income"
          amount={summary.paidAmount}
          valueTone="income"
          footer={
            <span className="text-body-sm text-income">
              {formatPercent(ratio(summary.paidAmount, summary.totalAmount))} tổng
              kỳ
            </span>
          }
        />
        <StatCard
          label="Chờ thanh toán"
          icon="schedule"
          iconTone="warning"
          amount={summary.unpaidAmount}
          valueTone="warning"
          footer={
            <span className="text-body-sm text-warning">
              {summary.unpaidCount} hóa đơn
            </span>
          }
        />
        <StatCard
          label="Quá hạn cần xử lý"
          icon="alarm"
          iconTone="danger"
          amount={summary.overdueAmount}
          valueTone="danger"
          footer={
            <span className="text-body-sm text-destructive">
              {summary.overdueCount} hóa đơn
              {summary.topOverdueLabel ? ` · ${summary.topOverdueLabel}` : ""}
            </span>
          }
        />
      </div>

      <SurfaceCard className="flex flex-col gap-3 p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <SearchInput
              placeholder="Tìm mô tả, mã, người trả..."
              className="min-w-[220px] max-w-xs"
            />
            <DateRangeFilter />
            <UrlFilter
              paramKey="category"
              label="Danh mục"
              searchable
              options={categories.map((item) => ({
                value: item.code,
                label: `${item.icon} ${item.name}`,
              }))}
            />
            <UrlFilter
              paramKey="user"
              label="Thành viên"
              searchable
              options={members.map((item) => ({
                value: String(item.telegramId),
                label: item.name,
              }))}
            />
            <UrlFilter
              paramKey="status"
              label="Trạng thái"
              options={[
                { value: "paid", label: "Đã trả" },
                { value: "unpaid", label: "Chưa trả" },
                { value: "overdue", label: "Quá hạn" },
              ]}
            />
            <UrlFilter
              paramKey="amount"
              label="Khoảng tiền"
              options={AMOUNT_PRESETS}
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <ExportMenu
              exportHref={`/api/bills/export?${query}`}
              templateHref="/api/bills/template"
            />
            <ImportDialog entity="bills" />
            <BillFormDialog
              mode="create"
              categories={categories}
              members={members}
              defaultUserId={currentUser?.telegramId}
            >
              <Button size="md">
                <Icon name="add" size={18} />
                Thêm hóa đơn
              </Button>
            </BillFormDialog>
          </div>
        </div>
        <FilterChips chips={chips} />
      </SurfaceCard>

      <SurfaceCard className="overflow-hidden p-0">
        {list.items.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="Không có hóa đơn nào khớp bộ lọc"
            description="Thử xóa bộ lọc hoặc thêm hóa đơn mới cho kỳ này."
            action={
              <div className="flex gap-2">
                <Link
                  href={`/bills?${periodToQuery(filters.period)}`}
                  className="text-body-sm font-medium text-primary hover:underline"
                >
                  Xóa bộ lọc
                </Link>
              </div>
            }
          />
        ) : (
          <>
            <div className="p-3">
              <BillsWorkspace
                bills={list.items}
                filterTotal={list.totalAmount}
                categories={categories}
                members={members}
              />
            </div>
            <BillsPagination
              page={list.page}
              pageCount={list.pageCount}
              from={from}
              to={to}
              totalCount={list.totalCount}
              params={params}
            />
          </>
        )}
      </SurfaceCard>
    </div>
  );
}
