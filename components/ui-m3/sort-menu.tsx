"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui-m3/icon";

export function SortMenu(props: {
  paramKey?: string;
  options: { value: string; label: string }[];
  defaultValue: string;
}) {
  return (
    <Suspense fallback={<SortMenuControl {...props} current={props.defaultValue} onSelect={() => undefined} />}>
      <SortMenuInner {...props} />
    </Suspense>
  );
}

function SortMenuInner({
  paramKey = "sort",
  options,
  defaultValue,
}: {
  paramKey?: string;
  options: { value: string; label: string }[];
  defaultValue: string;
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
    <SortMenuControl
      options={options}
      current={current}
      onSelect={select}
    />
  );
}

function SortMenuControl({
  options,
  current,
  onSelect,
}: {
  options: { value: string; label: string }[];
  current: string;
  onSelect: (value: string) => void;
}) {
  const currentLabel =
    options.find((option) => option.value === current)?.label ?? "";

  return (
    <div className="flex items-center gap-1 font-mono text-code text-outline">
      <span>Sắp xếp:</span>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex items-center font-semibold text-foreground hover:text-primary"
            />
          }
        >
          {currentLabel}
          <Icon name="arrow_drop_down" size={14} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSelect(option.value)}
              className="gap-2"
            >
              <span className="flex-1">{option.label}</span>
              {current === option.value ? (
                <Icon name="check" size={16} className="text-primary" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
