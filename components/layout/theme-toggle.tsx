"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui-m3/icon";
import type { IconName } from "@/lib/icons";

const OPTIONS: { value: string; label: string; icon: IconName }[] = [
  { value: "light", label: "Sáng", icon: "light_mode" },
  { value: "dark", label: "Tối", icon: "dark_mode" },
  { value: "system", label: "Theo hệ thống", icon: "computer" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-md" aria-label="Đổi giao diện" />
        }
      >
        <Icon name="light_mode" size={20} className="dark:hidden" />
        <Icon name="dark_mode" size={20} className="hidden dark:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className="gap-2"
          >
            <Icon name={option.icon} size={18} />
            <span className="flex-1">{option.label}</span>
            {theme === option.value ? (
              <Icon name="check" size={16} className="text-primary" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
