"use client";

import * as React from "react";
import type Highcharts from "highcharts";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Money } from "@/components/ui-m3/money";
import { formatMoneyWithUnit, formatPercent, ratio } from "@/lib/format";
import { assignChartColors, chartColorHex } from "@/lib/chart-colors";
import { HighchartsChart } from "@/components/charts/highcharts-chart";

export type DonutSlice = {
  code: string;
  name: string;
  icon?: string | null;
  total: number;
};

export function CategoryDonut({
  slices,
  className,
}: {
  slices: DonutSlice[];
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const total = slices.reduce((sum, slice) => sum + slice.total, 0);
  const colors = assignChartColors(slices.map((slice) => slice.code));

  const options = React.useMemo<Highcharts.Options>(() => {
    return {
      chart: {
        type: "pie",
        height: 220,
        backgroundColor: "transparent",
        style: { fontFamily: "inherit" },
      },
      tooltip: {
        pointFormatter() {
          return `<b>${formatMoneyWithUnit(this.y ?? 0)}</b> (${formatPercent(this.percentage ?? 0)})`;
        },
      },
      plotOptions: {
        pie: {
          innerSize: "68%",
          borderWidth: 0,
          borderRadius: 6,
          dataLabels: { enabled: false },
        },
      },
      series: [
        {
          type: "pie",
          name: "Chi tiêu",
          data: slices.map((slice) => ({
            name: `${slice.icon ? `${slice.icon} ` : ""}${slice.name}`,
            y: slice.total,
            color: `#${chartColorHex(colors.get(slice.code) ?? 0)}`,
          })),
        },
      ],
      legend: { enabled: false },
    };
  }, [slices, colors, resolvedTheme]);

  return (
    <div
      className={cn(
        "grid grid-cols-1 items-center gap-gutter-lg md:grid-cols-12",
        className,
      )}
    >
      <div className="relative md:col-span-5">
        <HighchartsChart options={options} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-body-sm text-outline">Tổng chi</span>
          <Money value={total} size="md" format="thousand" />
          <span className="font-mono text-code text-outline">VND</span>
        </div>
      </div>

      <ul className="flex flex-col gap-2.5 md:col-span-7">
        {slices.map((slice) => {
          const percent = ratio(slice.total, total);
          const color = `#${chartColorHex(colors.get(slice.code) ?? 0)}`;

          return (
            <li key={slice.code} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2 text-body-sm">
                <span className="flex min-w-0 items-center gap-1.5 font-medium text-foreground">
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate">
                    {slice.icon ? `${slice.icon} ` : ""}
                    {slice.name}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <Money value={slice.total} size="sm" unit={false} />
                  <span className="w-12 text-right font-mono text-code text-outline">
                    {formatPercent(percent)}
                  </span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, percent)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
