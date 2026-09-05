"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui-m3/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangeCalendar } from "@/components/ui/date-picker";
import { formatPeriodLabel, vnNow } from "@/lib/format";
import {
  hasDateRange,
  periodToDateRange,
  rangeToPeriod,
  readPeriod,
  shiftPeriod,
  writePeriodParams,
  type Period,
} from "@/lib/period";

function toObject(params: URLSearchParams) {
  return Object.fromEntries(params.entries());
}

/**
 * Bộ chọn kỳ dùng chung cho mọi trang. Trạng thái nằm trong query string nên
 * link chia sẻ được và kỳ được giữ nguyên khi chuyển trang.
 */
export function PeriodPicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const period = readPeriod(toObject(searchParams));
  const [draftYear, setDraftYear] = React.useState(
    period.year ?? vnNow().year,
  );
  const [tab, setTab] = React.useState<"month" | "day">(
    hasDateRange(period) ? "day" : "month",
  );

  function handleOpenChange(next: boolean) {
    if (next) {
      setDraftYear(period.year ?? vnNow().year);
      setTab(hasDateRange(period) ? "day" : "month");
    }
    setOpen(next);
  }

  const apply = React.useCallback(
    (next: Period) => {
      const params = new URLSearchParams(searchParams);
      writePeriodParams(params, next);
      router.push(`${pathname}?${params.toString()}`);
      setOpen(false);
    },
    [pathname, router, searchParams],
  );

  const now = vnNow();

  return (
    <div className="inline-flex items-center rounded-lg bg-surface p-0.5 shadow-sm">
      <button
        type="button"
        aria-label="Kỳ trước"
        disabled={period.all}
        onClick={() => apply(shiftPeriod(period, -1))}
        className="flex items-center p-gutter-xs text-on-surface-variant transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Icon name="chevron_left" size={18} />
      </button>

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1 px-gutter-sm py-gutter-xs font-mono text-numeric-sm font-semibold text-foreground"
            />
          }
        >
          <span className="whitespace-nowrap">
            {formatPeriodLabel(period)}
          </span>
          <Icon name="arrow_drop_down" size={16} />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-auto max-w-[min(36rem,calc(100vw-1.5rem))] gap-3"
        >
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as "month" | "day")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="month">Theo tháng</TabsTrigger>
              <TabsTrigger value="day">Theo ngày</TabsTrigger>
            </TabsList>

            <TabsContent value="month" className="flex flex-col gap-3 pt-1">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Năm trước"
                  onClick={() => setDraftYear((year) => year - 1)}
                  className="rounded-md p-1 text-on-surface-variant hover:bg-surface-high hover:text-foreground"
                >
                  <Icon name="chevron_left" size={18} />
                </button>
                <span className="font-mono text-numeric-sm font-semibold">
                  {draftYear}
                </span>
                <button
                  type="button"
                  aria-label="Năm sau"
                  onClick={() => setDraftYear((year) => year + 1)}
                  className="rounded-md p-1 text-on-surface-variant hover:bg-surface-high hover:text-foreground"
                >
                  <Icon name="chevron_right" size={18} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (month) => {
                    const isActive =
                      !period.all &&
                      !hasDateRange(period) &&
                      period.month === month &&
                      period.year === draftYear;
                    const isCurrent =
                      month === now.month && draftYear === now.year;

                    return (
                      <button
                        key={month}
                        type="button"
                        onClick={() =>
                          apply({ month, year: draftYear, all: false })
                        }
                        className={cn(
                          "h-8 rounded-md text-body-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface-low text-foreground hover:bg-surface-high",
                          !isActive && isCurrent && "text-primary",
                        )}
                      >
                        T{month}
                      </button>
                    );
                  },
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <QuickOption
                  label="Tháng này"
                  onClick={() =>
                    apply({ month: now.month, year: now.year, all: false })
                  }
                />
                <QuickOption
                  label="Tháng trước"
                  onClick={() =>
                    apply(
                      shiftPeriod(
                        { month: now.month, year: now.year, all: false },
                        -1,
                      ),
                    )
                  }
                />
                <QuickOption
                  label="Tất cả thời gian"
                  active={period.all}
                  onClick={() => apply({ month: null, year: null, all: true })}
                />
              </div>
            </TabsContent>

            <TabsContent value="day" className="pt-1">
              <DateRangeCalendar
                value={periodToDateRange(period)}
                onChange={(range) => apply(rangeToPeriod(range.from, range.to))}
              />
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>

      <button
        type="button"
        aria-label="Kỳ sau"
        disabled={period.all}
        onClick={() => apply(shiftPeriod(period, 1))}
        className="flex items-center p-gutter-xs text-on-surface-variant transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Icon name="chevron_right" size={18} />
      </button>
    </div>
  );
}

function QuickOption({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-body-sm transition-colors",
        active
          ? "bg-primary/10 font-semibold text-primary"
          : "bg-surface-low text-on-surface-variant hover:bg-surface-high hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
