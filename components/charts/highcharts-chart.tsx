"use client";

import * as React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useTheme } from "next-themes";
import { CHART_COLOR_HEX } from "@/lib/chart-colors";

export function readCssColor(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

export function chartPalette() {
  return {
    primary: readCssColor("--primary", "#00685f"),
    foreground: readCssColor("--foreground", "#1a1b22"),
    outline: readCssColor("--outline", "#6d7a77"),
    surface: readCssColor("--surface", "#eeedf7"),
    surfaceHigh: readCssColor("--surface-high", "#e8e7f1"),
    income: readCssColor("--income", "#16a34a"),
    destructive: readCssColor("--destructive", "#dc2626"),
    card: readCssColor("--card", "#ffffff"),
    colors: CHART_COLOR_HEX.map((hex) => `#${hex}`),
  };
}

export function HighchartsChart({
  options,
  className,
}: {
  options: Highcharts.Options;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const merged = React.useMemo<Highcharts.Options>(
    () => ({
      credits: { enabled: false },
      accessibility: { enabled: false },
      title: { text: undefined },
      ...options,
    }),
    [options, resolvedTheme],
  );

  if (!mounted) {
    return <div className={className} style={{ minHeight: 180 }} />;
  }

  return (
    <div className={className}>
      <HighchartsReact highcharts={Highcharts} options={merged} />
    </div>
  );
}
