import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui-m3/icon";
import { buildQuery } from "@/lib/query";
import type { SearchParamsInput } from "@/lib/period";

export function BillsPagination({
  page,
  pageCount,
  from,
  to,
  totalCount,
  params,
}: {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  totalCount: number;
  params: SearchParamsInput;
}) {
  const hrefFor = (next: number) =>
    `?${buildQuery(params, { page: next <= 1 ? null : next })}`;

  const pages = visiblePages(page, pageCount);

  return (
    <div className="flex flex-col gap-3 rounded-b-lg bg-surface-low px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-body-sm text-on-surface-variant">
        Hiển thị <strong>{from}–{to}</strong> của{" "}
        <strong>{totalCount}</strong> hóa đơn • Trang {page} / {pageCount}
      </p>
      <div className="flex items-center gap-1">
        <PageLink href={hrefFor(page - 1)} disabled={page <= 1} label="Trang trước">
          <Icon name="chevron_left" size={18} />
          <span className="hidden sm:inline">Trước</span>
        </PageLink>
        {pages.map((item, index) =>
          item === "…" ? (
            <span key={`gap-${index}`} className="px-1 text-outline">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={hrefFor(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md font-mono text-code font-semibold transition-colors",
                item === page
                  ? "bg-primary text-primary-foreground"
                  : "text-on-surface-variant hover:bg-surface",
              )}
            >
              {item}
            </Link>
          ),
        )}
        <PageLink
          href={hrefFor(page + 1)}
          disabled={page >= pageCount}
          label="Trang sau"
        >
          <span className="hidden sm:inline">Sau</span>
          <Icon name="chevron_right" size={18} />
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        className="flex h-8 items-center gap-0.5 rounded-md px-2 text-body-sm text-outline cursor-not-allowed"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-8 items-center gap-0.5 rounded-md px-2 text-body-sm text-on-surface-variant hover:bg-surface"
    >
      {children}
    </Link>
  );
}

function visiblePages(page: number, pageCount: number): Array<number | "…"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const items = new Set([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...items].filter((item) => item >= 1 && item <= pageCount).sort(
    (a, b) => a - b,
  );

  const result: Array<number | "…"> = [];
  for (const item of sorted) {
    const last = result.at(-1);
    if (typeof last === "number" && item - last > 1) result.push("…");
    result.push(item);
  }
  return result;
}
