"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui-m3/icon";
import { MOBILE_NAV_ITEMS } from "@/lib/nav";

/**
 * Bottom nav cho điện thoại: 4 mục dùng nhiều nhất, cộng một nút nổi ở giữa để
 * thêm hóa đơn mà không phải mở menu.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [left, right] = [
    MOBILE_NAV_ITEMS.slice(0, 2),
    MOBILE_NAV_ITEMS.slice(2),
  ];

  return (
    <nav
      aria-label="Điều hướng nhanh"
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-card/95 backdrop-blur-xl sm:hidden"
    >
      {left.map((item) => (
        <BottomNavLink key={item.href} item={item} pathname={pathname} />
      ))}

      <div className="relative w-16 shrink-0">
        <Link
          href="/bills?new=1"
          aria-label="Thêm hóa đơn"
          className="absolute -top-5 left-1/2 flex size-12 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
        >
          <Icon name="add" size={24} />
        </Link>
      </div>

      {right.map((item) => (
        <BottomNavLink key={item.href} item={item} pathname={pathname} />
      ))}
    </nav>
  );
}

function BottomNavLink({
  item,
  pathname,
}: {
  item: (typeof MOBILE_NAV_ITEMS)[number];
  pathname: string;
}) {
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 text-body-sm transition-colors",
        isActive ? "text-primary" : "text-outline",
      )}
    >
      <Icon name={item.icon} size={20} filled={isActive} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
