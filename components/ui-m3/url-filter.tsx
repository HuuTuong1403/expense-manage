"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Combobox } from "@/components/ui/combobox";
import { FormSelect } from "@/components/ui/form-select";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

/**
 * Nút lọc dạng "Nhãn: giá trị ▾" ghi vào query string, đúng toolbar mockup.
 */
export function UrlFilter({
  paramKey,
  label,
  options,
  emptyLabel = "Tất cả",
  searchable = false,
  className,
}: {
  paramKey: string;
  label: string;
  options: FilterOption[];
  emptyLabel?: string;
  searchable?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? "";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams);
    if (!value) params.delete(paramKey);
    else params.set(paramKey, value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const prefixed = options.map((option) => ({
    value: option.value,
    label: `${label}: ${option.label}`,
  }));

  if (searchable) {
    return (
      <div className={cn("min-w-44", className)}>
        <Combobox
          value={current}
          onValueChange={onChange}
          options={prefixed}
          placeholder={`${label}: ${emptyLabel}`}
          searchPlaceholder={`Tìm ${label.toLowerCase()}...`}
          allowClear
          className="[&_button]:bg-surface-low"
        />
      </div>
    );
  }

  return (
    <div className={cn("min-w-36", className)}>
      <FormSelect
        value={current}
        onValueChange={onChange}
        options={prefixed}
        allowEmpty
        emptyLabel={`${label}: ${emptyLabel}`}
        placeholder={`${label}: ${emptyLabel}`}
        className="bg-surface-low"
      />
    </div>
  );
}
