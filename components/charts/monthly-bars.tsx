"use client";

import * as React from "react";
import type Highcharts from "highcharts";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { formatMoneyShort, formatMoneyWithUnit } from "@/lib/format";
import { HighchartsChart, chartPalette } from "@/components/charts/highcharts-chart";

export type MonthlyBar = {
  month: number;
  year: number;
  total: number;
};

export function MonthlyBars({
  data,
  activeMonth,
  activeYear,
  className,
}: {
  data: MonthlyBar[];
  activeMonth: number | null;
  activeYear: number | null;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const average =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.total, 0) / data.length
      : 0;

  const options = React.useMemo<Highcharts.Options>(() => {
    const theme = chartPalette();
    return {
      chart: {
        type: "column",
        height: 220,
        backgroundColor: "transparent",
        style: { fontFamily: "inherit" },
      },
      xAxis: {
        categories: data.map((item) => `T${item.month}`),
        lineColor: theme.surfaceHigh,
        tickLength: 0,
        labels: {
          style: { color: theme.outline, fontSize: "11px" },
        },
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: theme.surfaceHigh,
        labels: {
          formatter() {
            return formatMoneyShort(Number(this.value));
          },
          style: { color: theme.outline, fontSize: "11px" },
        },
        plotLines:
          average > 0
            ? [
                {
                  value: average,
                  color: theme.outline,
                  dashStyle: "ShortDash",
                  width: 1,
                  label: {
                    text: formatMoneyShort(average),
                    align: "right",
                    style: { color: theme.outline, fontSize: "10px" },
                  },
                },
              ]
            : undefined,
      },
      tooltip: {
        formatter() {
          const item = data[this.index];
          const label = item ? `Tháng ${item.month}/${item.year}` : String(this.x);
          return `<b>${label}</b><br/>${formatMoneyWithUnit(this.y ?? 0)}`;
        },
      },
      legend: { enabled: false },
      plotOptions: {
        column: {
          borderRadius: 4,
          borderWidth: 0,
          pointPadding: 0.15,
          groupPadding: 0.08,
          maxPointWidth: 28,
        },
      },
      series: [
        {
          type: "column",
          name: "Chi tiêu",
          data: data.map((item) => {
            const isActive =
              item.month === activeMonth && item.year === activeYear;
            return {
              y: item.total,
              color: isActive ? theme.primary : theme.surfaceHigh,
            };
          }),
        },
      ],
    };
  }, [data, activeMonth, activeYear, average, resolvedTheme]);

  return (
    <div className={cn("flex flex-col", className)}>
      <HighchartsChart options={options} />
    </div>
  );
}
