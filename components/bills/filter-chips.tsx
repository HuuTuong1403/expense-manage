"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui-m3/icon";
import { periodToQuery, readPeriod } from "@/lib/period";

type Chip = {
  key: string;
  label: string;
  variant?: "warning" | "income" | "secondary";
};

export function FilterChips({
  chips,
}: {
  chips: Chip[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = readPeriod(Object.fromEntries(searchParams.entries()));

  if (chips.length === 0) return null;

  function hrefWithout(key: string) {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    if (key === "amount") {
      params.delete("amountMin");
      params.delete("amountMax");
    }
    if (key === "range") {
      params.delete("from");
      params.delete("to");
    }
    params.delete("page");
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-body-sm text-outline">Đang áp dụng:</span>
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant={chip.variant ?? "secondary"}
          className="gap-1 pr-1"
        >
          {chip.label}
          <Link
            href={hrefWithout(chip.key)}
            aria-label={`Xóa bộ lọc ${chip.label}`}
            className="rounded-full p-0.5 hover:bg-foreground/10"
          >
            <Icon name="close" size={12} />
          </Link>
        </Badge>
      ))}
      <Link
        href={`${pathname}?${periodToQuery(period)}`}
        className="text-body-sm font-medium text-primary hover:underline"
      >
        Xóa tất cả bộ lọc
      </Link>
    </div>
  );
}
