"use client";

import * as React from "react";
import { ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ComboboxOption = {
  value: string;
  label: string;
  keywords?: string;
};

type ComboboxProps = {
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  required?: boolean;
  allowClear?: boolean;
  className?: string;
};

export function Combobox({
  name,
  id,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder = "Chọn",
  searchPlaceholder = "Tìm kiếm...",
  emptyText = "Không có kết quả",
  required,
  allowClear = !required,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled;
  const selected = options.find((option) => option.value === current);

  function set(next: string) {
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
  }

  return (
    <div className={cn("w-full", className)}>
      {name ? (
        <input
          type="hidden"
          name={name}
          id={id}
          value={current}
          required={required}
        />
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="subtle"
              role="combobox"
              aria-expanded={open}
              className="h-9 w-full justify-between px-3 font-normal"
            />
          }
        >
          <span className={cn("truncate", !selected && "text-outline")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDownIcon className="size-4 text-outline" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--anchor-width) min-w-56 p-1"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {allowClear && current ? (
                  <CommandItem
                    value="xoa lua chon"
                    onSelect={() => {
                      set("");
                      setOpen(false);
                    }}
                  >
                    Xóa lựa chọn
                  </CommandItem>
                ) : null}
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.keywords ?? ""} ${option.value}`}
                    data-checked={option.value === current}
                    onSelect={() => {
                      set(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
