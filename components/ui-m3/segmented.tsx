"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type SegmentedOption = {
  value: string;
  label: string;
};

/**
 * Nhóm nút phân đoạn ghi trạng thái vào query string, dùng cho các bộ lọc
 * "Tất cả / Cảnh báo / An toàn" và tab chia đều / theo trọng số.
 */
export function Segmented({
  paramKey,
  options,
  defaultValue,
  className,
}: {
  paramKey: string;
  options: SegmentedOption[];
  defaultValue: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? defaultValue;

  function select(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === defaultValue) params.delete(paramKey);
    else params.set(paramKey, value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 rounded-md bg-surface-low p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => select(option.value)}
            className={cn(
              "rounded-sm px-2.5 py-1 text-body-sm transition-colors",
              isActive
                ? "bg-card font-semibold text-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
