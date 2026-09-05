"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Icon } from "@/components/ui-m3/icon";
import { NAV_GROUPS, SETTINGS_ITEM } from "@/lib/nav";

/**
 * Ô tìm kiếm trên header. Trên desktop hiển thị như một input có gợi ý ⌘K,
 * dưới `md` thu về nút icon. Cả hai đều mở cùng một palette.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Tìm kiếm"
        className="relative hidden h-9 w-48 items-center rounded-lg bg-surface-low pr-12 pl-9 text-left text-body-sm text-outline transition-colors hover:bg-surface focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:flex lg:w-64"
      >
        <Icon
          name="search"
          size={18}
          className="pointer-events-none absolute left-gutter-sm"
        />
        <span>Tìm kiếm...</span>
        <kbd className="absolute right-2 rounded-sm bg-surface-highest px-1.5 py-0.5 font-mono text-code text-on-surface-variant">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Tìm kiếm"
        className="flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-high hover:text-foreground sm:hidden"
      >
        <Icon name="search" size={20} />
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Tìm kiếm và điều hướng"
        description="Nhảy nhanh tới một trang trong ứng dụng"
      >
        <CommandInput placeholder="Nhập tên trang hoặc hành động..." />
        <CommandList>
          <CommandEmpty>Không tìm thấy kết quả phù hợp.</CommandEmpty>
          {NAV_GROUPS.map((group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${group.label} ${item.label}`}
                  onSelect={() => go(item.href)}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandGroup heading="Hành động">
            <CommandItem
              value="Thêm hóa đơn mới"
              onSelect={() => go("/bills?new=1")}
            >
              <Icon name="add_circle" size={18} />
              <span>Thêm hóa đơn</span>
            </CommandItem>
            <CommandItem
              value="Cài đặt"
              onSelect={() => go(SETTINGS_ITEM.href)}
            >
              <Icon name={SETTINGS_ITEM.icon} size={18} />
              <span>{SETTINGS_ITEM.label}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
