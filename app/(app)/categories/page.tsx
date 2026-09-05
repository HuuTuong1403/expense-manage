import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui-m3/icon";
import { StatCard } from "@/components/ui-m3/stat-card";
import { SurfaceCard } from "@/components/ui-m3/surface-card";
import { PageHeader } from "@/components/ui-m3/page-header";
import { EmptyState } from "@/components/ui-m3/empty-state";
import { SearchInput } from "@/components/ui-m3/search-input";
import { Segmented } from "@/components/ui-m3/segmented";
import { SortMenu } from "@/components/ui-m3/sort-menu";
import { CategoryCard } from "@/components/categories/category-card";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { ExportMenu } from "@/components/excel/export-menu";
import { ImportDialog } from "@/components/excel/import-dialog";
import { listCategoriesWithSpend } from "@/lib/repositories/categories";
import { listActiveUsers } from "@/lib/repositories/users";
import { readPeriod, readStringParam } from "@/lib/period";
import { formatMoneyShort, formatPercent, formatPeriodLabel, ratio } from "@/lib/format";
import { removeDiacritics } from "@/lib/format";

const SORT_OPTIONS = [
  { value: "usage", label: "Tỷ lệ dùng" },
  { value: "spent", label: "Số đã chi" },
  { value: "budget", label: "Hạn mức" },
  { value: "name", label: "Tên A → Z" },
];

export default async function CategoriesPage({
  searchParams,
}: PageProps<"/categories">) {
  const params = await searchParams;
  const period = readPeriod(params);
  const query = readStringParam(params, "q") ?? "";
  const filter = readStringParam(params, "filter") ?? "all";
  const sort = readStringParam(params, "sort") ?? "usage";

  const [allCategories, members] = await Promise.all([
    listCategoriesWithSpend(period),
    listActiveUsers(),
  ]);

  const totalBudget = allCategories.reduce(
    (sum, category) => sum + category.budget,
    0,
  );
  const totalSpent = allCategories.reduce(
    (sum, category) => sum + category.spent,
    0,
  );
  const overBudget = allCategories.filter((category) => category.overBy > 0);
  const warningCount = allCategories.filter(
    (category) => category.budget > 0 && category.percent >= 80,
  ).length;

  const mostUsedCode = allCategories.reduce<string | null>(
    (best, category) =>
      best === null ||
      category.billCount >
        (allCategories.find((item) => item.code === best)?.billCount ?? 0)
        ? category.code
        : best,
    null,
  );

  // Lọc và sắp xếp ở tầng ứng dụng: số danh mục nhỏ, không cần đẩy xuống Mongo.
  const needle = removeDiacritics(query).toLowerCase();
  let categories = allCategories.filter((category) => {
    if (needle) {
      const haystack = removeDiacritics(
        `${category.name} ${category.code} ${category.keywords.join(" ")}`,
      ).toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (filter === "warning") {
      return category.budget > 0 && category.percent >= 80;
    }
    if (filter === "safe") {
      return category.budget === 0 || category.percent < 80;
    }
    return true;
  });

  categories = categories.sort((a, b) => {
    if (sort === "spent") return b.spent - a.spent;
    if (sort === "budget") return b.budget - a.budget;
    if (sort === "name") return a.name.localeCompare(b.name, "vi");
    return b.usageCount - a.usageCount || b.billCount - a.billCount;
  });

  const others = allCategories.map((category) => ({
    code: category.code,
    name: category.name,
    icon: category.icon,
  }));
  const memberOptions = members.map((member) => ({
    telegramId: member.telegramId,
    name: member.name,
  }));

  return (
    <div className="flex flex-col">
      {/* Vệt sáng trang trí như mockup, đặt dưới nội dung */}
      <div className="relative w-full">
        <div className="pointer-events-none absolute -top-6 -left-10 -z-10 h-56 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 -z-10 h-64 w-80 rounded-full bg-secondary-container/20 blur-3xl" />
      </div>

      <PageHeader
        eyebrow="Cấu hình hệ thống"
        meta="Dùng chung dữ liệu với bot Telegram"
        title="Danh mục chi tiêu"
        description="Quản lý các nhóm chi tiêu, định mức ngân sách tháng và quy tắc phân loại cho Telegram bot."
        actions={
          <>
            <ExportMenu
              exportHref="/api/categories/export"
              templateHref="/api/categories/template"
            />
            <ImportDialog entity="categories" />
            <CategoryFormDialog mode="create" members={memberOptions}>
              <Button size="md">
                <Icon name="add_circle" size={18} />
                Thêm danh mục mới
              </Button>
            </CategoryFormDialog>
          </>
        }
      />

      <section className="mb-gutter-xl grid grid-cols-1 gap-gutter-md sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng ngân sách tháng"
          icon="account_balance_wallet"
          iconTone="primary"
          amount={totalBudget}
          accent="bg-primary/20"
          footer={
            <div className="flex items-center gap-1.5">
              <Icon name="trending_flat" size={15} className="text-income" />
              <span className="text-body-sm text-on-surface-variant">
                Hạn mức {formatPeriodLabel(period)}
              </span>
            </div>
          }
        />
        <StatCard
          label="Đã chi tiêu"
          icon="pie_chart"
          iconTone="warning"
          amount={totalSpent}
          accent="bg-warning"
          footer={
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="warning">
                {formatPercent(ratio(totalSpent, totalBudget))}
              </Badge>
              <span className="text-body-sm text-on-surface-variant">
                {totalBudget > totalSpent
                  ? `Còn lại ${formatMoneyShort(totalBudget - totalSpent)}`
                  : "Đã dùng hết hạn mức"}
              </span>
            </div>
          }
        />
        <StatCard
          label="Số danh mục"
          icon="dataset"
          iconTone="primary"
          value={allCategories.length}
          valueUnit="danh mục"
          accent="bg-income/30"
          footer={
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-income" />
              <span className="text-body-sm text-on-surface-variant">
                {allCategories.filter((item) => item.budget > 0).length} mục đã
                đặt hạn mức
              </span>
            </div>
          }
        />
        <StatCard
          label="Cảnh báo vượt"
          icon="notification_important"
          iconTone="danger"
          value={overBudget.length}
          valueUnit="danh mục"
          valueTone="danger"
          accent="bg-destructive"
          footer={
            overBudget.length > 0 ? (
              <span className="text-body-sm font-semibold text-destructive">
                Vượt định mức{" "}
                {formatMoneyShort(
                  overBudget.reduce((sum, item) => sum + item.overBy, 0),
                )}
              </span>
            ) : (
              <span className="text-body-sm text-on-surface-variant">
                Mọi danh mục đều trong hạn mức
              </span>
            )
          }
        />
      </section>

      <SurfaceCard className="mb-gutter-lg flex flex-col items-center justify-between gap-3 p-3 md:flex-row">
        <div className="flex w-full items-center gap-2 md:w-auto">
          <SearchInput
            placeholder="Lọc theo tên, tag bot, mã code..."
            className="w-full md:w-72"
            inputClassName="h-8"
          />
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 md:w-auto">
          <Segmented
            paramKey="filter"
            defaultValue="all"
            options={[
              { value: "all", label: `Tất cả (${allCategories.length})` },
              { value: "warning", label: `Cảnh báo (${warningCount})` },
              {
                value: "safe",
                label: `An toàn (${allCategories.length - warningCount})`,
              },
            ]}
          />
          <SortMenu options={SORT_OPTIONS} defaultValue="usage" />
        </div>
      </SurfaceCard>

      {categories.length === 0 ? (
        <SurfaceCard>
          <EmptyState
            icon="category"
            title="Không có danh mục nào khớp bộ lọc"
            description="Thử xóa từ khóa tìm kiếm hoặc chuyển sang xem tất cả."
            action={
              <Link
                href="/categories"
                className="text-body-sm font-medium text-primary hover:underline"
              >
                Xóa bộ lọc
              </Link>
            }
          />
        </SurfaceCard>
      ) : (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.code}
              category={category}
              members={memberOptions}
              others={others.filter((item) => item.code !== category.code)}
              isMostUsed={category.code === mostUsedCode && category.billCount > 0}
            />
          ))}
        </section>
      )}

      <SurfaceCard className="mt-gutter-xl flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="smart_toy" size={26} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-headline-sm text-foreground">
              Cú pháp phân loại qua Telegram
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              Gõ lệnh bot dạng{" "}
              <code className="rounded-sm bg-surface-high px-1.5 py-0.5 font-mono text-code font-bold text-primary">
                /addbill cafe 50000 Starbuck
              </code>{" "}
              hoặc{" "}
              <code className="rounded-sm bg-surface-high px-1.5 py-0.5 font-mono text-code font-bold text-primary">
                /addbill muasam 250000 Bách Hóa Xanh
              </code>{" "}
              để ghi nhận vào đúng mã danh mục.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="default" render={<Link href="/settings" />}>
            Cấu hình thông báo
          </Button>
        </div>
      </SurfaceCard>
    </div>
  );
}
