"use client";

import * as React from "react";
import type Highcharts from "highcharts";
import { useTheme } from "next-themes";
import { Money } from "@/components/ui-m3/money";
import { MemberAvatar } from "@/components/ui-m3/member-avatar";
import { formatMoney, formatMoneyWithUnit } from "@/lib/format";
import type { BalanceMember } from "@/lib/types";
import { HighchartsChart, chartPalette } from "@/components/charts/highcharts-chart";

export function DivergingBalanceBars({ members }: { members: BalanceMember[] }) {
  const { resolvedTheme } = useTheme();
  const sorted = React.useMemo(
    () => members.slice().sort((a, b) => b.net - a.net),
    [members],
  );

  const options = React.useMemo<Highcharts.Options>(() => {
    const theme = chartPalette();
    return {
      chart: {
        type: "bar",
        height: Math.max(180, sorted.length * 44 + 48),
        backgroundColor: "transparent",
        style: { fontFamily: "inherit" },
      },
      xAxis: {
        categories: sorted.map((member) => member.name),
        lineColor: theme.surfaceHigh,
        tickLength: 0,
        labels: { style: { color: theme.foreground, fontSize: "12px" } },
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: theme.surfaceHigh,
        plotLines: [
          { value: 0, color: theme.outline, width: 1, zIndex: 5 },
        ],
        labels: {
          formatter() {
            return formatMoney(Number(this.value));
          },
          style: { color: theme.outline, fontSize: "11px" },
        },
      },
      tooltip: {
        formatter() {
          const member = sorted[this.index];
          const net = this.y ?? 0;
          const tone = net > 0 ? "Được nhận" : net < 0 ? "Cần đóng" : "Hòa";
          return `<b>${member?.name ?? ""}</b><br/>${tone}: ${formatMoneyWithUnit(net)}<br/>Đã chi: ${formatMoneyWithUnit(member?.paid ?? 0)}`;
        },
      },
      legend: { enabled: false },
      plotOptions: {
        bar: {
          borderWidth: 0,
          borderRadius: 6,
          pointPadding: 0.2,
          minPointLength: 2,
        },
      },
      series: [
        {
          type: "bar",
          name: "Công nợ",
          data: sorted.map((member) => ({
            y: Math.round(member.net),
            color:
              member.net > 0.5
                ? theme.income
                : member.net < -0.5
                  ? theme.destructive
                  : theme.surfaceHigh,
          })),
        },
      ],
    };
  }, [sorted, resolvedTheme]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-12 items-center gap-2 font-mono text-code tracking-wider uppercase">
        <span className="col-span-5 text-right text-destructive">
          Cần đóng thêm (−)
        </span>
        <span className="col-span-2 text-center">
          <span className="rounded-full bg-surface-high px-2 py-0.5 text-outline">
            Mốc 0 ₫
          </span>
        </span>
        <span className="col-span-5 text-left text-income">Được nhận về (+)</span>
      </div>

      <HighchartsChart options={options} />

      <ul className="flex flex-col gap-2">
        {sorted.map((member) => {
          const isCreditor = member.net > 0.5;
          const isDebtor = member.net < -0.5;
          return (
            <li
              key={member.userId}
              className="flex items-center justify-between gap-2 rounded-lg bg-surface-low/60 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <MemberAvatar name={member.name} id={member.userId} size={32} />
                <div>
                  <p className="text-headline-sm text-foreground">{member.name}</p>
                  <p className="font-mono text-code text-outline">
                    Đã chi {formatMoney(member.paid)} ₫
                  </p>
                </div>
              </div>
              <Money
                value={member.net}
                size="md"
                signed
                tone={isCreditor ? "income" : isDebtor ? "danger" : "muted"}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
