"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DateRangePicker } from "@/components/ui/date-picker";
import {
  periodToDateRange,
  rangeToPeriod,
  readPeriod,
  writePeriodParams,
} from "@/lib/period";

/**
 * Range-picker từ ngày → đến ngày.
 * Khi kỳ đang là một tháng, hiện đầu–cuối tháng; đổi khoảng thì ghi lại query.
 */
export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = readPeriod(Object.fromEntries(searchParams.entries()));
  const range = periodToDateRange(period);

  return (
    <DateRangePicker
      value={range}
      placeholder="Từ ngày – đến ngày"
      onChange={(next) => {
        const params = new URLSearchParams(searchParams);
        writePeriodParams(params, rangeToPeriod(next.from, next.to));
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="bg-surface-low"
    />
  );
}
