"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui-m3/icon";

/**
 * Ô tìm kiếm ghi vào query string, có debounce để không đẩy history mỗi lần gõ.
 */
export function SearchInput(props: {
  paramKey?: string;
  placeholder: string;
  className?: string;
  inputClassName?: string;
}) {
  return (
    <React.Suspense
      fallback={
        <SearchInputControl
          {...props}
          value=""
          onChange={() => undefined}
        />
      }
    >
      <SearchInputInner {...props} />
    </React.Suspense>
  );
}

function SearchInputInner({
  paramKey = "q",
  placeholder,
  className,
  inputClassName,
}: {
  paramKey?: string;
  placeholder: string;
  className?: string;
  inputClassName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get(paramKey) ?? "";
  const [value, setValue] = React.useState(initial);

  const commit = React.useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams);
      if (next) params.set(paramKey, next);
      else params.delete(paramKey);
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, paramKey, router, searchParams],
  );

  React.useEffect(() => {
    if (value === initial) return;
    const timer = setTimeout(() => commit(value), 350);
    return () => clearTimeout(timer);
  }, [value, initial, commit]);

  return (
    <SearchInputControl
      placeholder={placeholder}
      className={className}
      inputClassName={inputClassName}
      value={value}
      onChange={setValue}
    />
  );
}

function SearchInputControl({
  placeholder,
  className,
  inputClassName,
  value,
  onChange,
}: {
  placeholder: string;
  className?: string;
  inputClassName?: string;
  value: string;
  onChange: (value: string) => void;
}) {

  return (
    <div className={cn("relative flex items-center", className)}>
      <Icon
        name="search"
        size={18}
        className="pointer-events-none absolute left-2.5 text-outline"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "h-9 w-full rounded-md bg-surface-low pr-8 pl-9 text-body-md text-foreground placeholder:text-outline focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden",
          inputClassName,
        )}
      />
      {value ? (
        <button
          type="button"
          aria-label="Xóa từ khóa"
          onClick={() => onChange("")}
          className="absolute right-2 flex items-center text-outline transition-colors hover:text-foreground"
        >
          <Icon name="close" size={16} />
        </button>
      ) : null}
    </div>
  );
}
