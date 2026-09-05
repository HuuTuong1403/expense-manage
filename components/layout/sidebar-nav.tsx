"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui-m3/icon";
import { NAV_GROUPS } from "@/lib/nav";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="mt-gutter-xs flex flex-col gap-gutter-sm px-gutter-sm">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-gutter-sm">
          <div className="px-gutter-sm pt-gutter-sm pb-gutter-xs text-body-sm font-semibold tracking-wider text-outline uppercase">
            {group.label}
          </div>
          {group.items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-gutter-sm py-gutter-sm text-body-md transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground text-headline-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
