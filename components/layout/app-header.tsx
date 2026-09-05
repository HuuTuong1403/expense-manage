"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Icon } from "@/components/ui-m3/icon";
import { MemberAvatar } from "@/components/ui-m3/member-avatar";
import { BrandMark } from "@/components/layout/brand-mark";
import { CommandPalette } from "@/components/layout/command-palette";
import { PeriodPicker } from "@/components/layout/period-picker";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import {
  SidebarUserCard,
  type ShellUser,
} from "@/components/layout/sidebar-user-card";
import { findNavLocation } from "@/lib/nav";

export function AppHeader({ user }: { user: ShellUser | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = findNavLocation(pathname);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-gutter-sm bg-card/90 px-gutter-md shadow-rail backdrop-blur-xl lg:left-rail">
      <div className="flex min-w-0 items-center gap-gutter-xs">
        <Button
          variant="ghost"
          size="icon-md"
          aria-label="Mở menu"
          className="lg:hidden"
          onClick={() => setMenuOpen(true)}
        >
          <Icon name="menu" size={20} />
        </Button>

        <nav
          aria-label="Đường dẫn"
          className="hidden items-center gap-gutter-xs text-body-md sm:flex"
        >
          <span className="text-on-surface-variant">
            {location?.group ?? "Tổng quan"}
          </span>
          <Icon name="chevron_right" size={16} className="text-outline" />
          <span className="font-semibold text-foreground">
            {location?.item.label ?? "Dashboard"}
          </span>
        </nav>

        <span className="truncate text-headline-sm text-foreground sm:hidden">
          {location?.item.label ?? "Dashboard"}
        </span>
      </div>

      <div className="flex items-center gap-gutter-xs lg:gap-gutter-md">
        <PeriodPicker />
        <CommandPalette />
        <ThemeToggle />
        <Button
          variant="default"
          size="md"
          render={<Link href="/bills?new=1" />}
          className="hidden sm:inline-flex"
        >
          <Icon name="add" size={18} />
          <span>Thêm hóa đơn</span>
        </Button>
        <Button
          variant="default"
          size="icon-md"
          aria-label="Thêm hóa đơn"
          render={<Link href="/bills?new=1" />}
          className="sm:hidden"
        >
          <Icon name="add" size={20} />
        </Button>
        <MemberAvatar
          name={user?.name ?? "?"}
          id={user?.telegramId ?? 0}
          size={32}
          className="hidden lg:flex"
        />
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-rail gap-0 bg-sidebar p-0 sm:max-w-none"
        >
          <SheetTitle className="sr-only">Điều hướng</SheetTitle>
          <div className="flex h-full flex-col justify-between overflow-y-auto">
            <div className="flex flex-col">
              <BrandMark />
              <SidebarNav onNavigate={() => setMenuOpen(false)} />
            </div>
            <SidebarUserCard user={user} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
