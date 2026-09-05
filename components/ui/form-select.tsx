"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const NONE = "__none__";

export type SelectOption = {
  value: string;
  label: React.ReactNode;
};

type FormSelectProps = {
  name?: string;
  id?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
};

/**
 * Select shadcn kèm hidden input để submit FormData.
 * Giá trị rỗng dùng sentinel vì Select không nhận `value=""`.
 */
export function FormSelect({
  name,
  id,
  defaultValue,
  value,
  onValueChange,
  options,
  placeholder = "Chọn",
  required,
  allowEmpty = !required,
  emptyLabel,
  className,
}: FormSelectProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled;
  const emptyText = emptyLabel ?? placeholder;
  const selectValue = current || (allowEmpty ? NONE : current);
  const items = [
    ...(allowEmpty ? [{ value: NONE, label: emptyText }] : []),
    ...options.map((option) => ({ value: option.value, label: option.label })),
  ];

  function handleChange(next: string | null) {
    const real = !next || next === NONE ? "" : next;
    if (!isControlled) setUncontrolled(real);
    onValueChange?.(real);
  }

  return (
    <>
      {name ? (
        <input
          type="hidden"
          name={name}
          id={id}
          value={current}
          required={required ? current.length > 0 : undefined}
        />
      ) : null}
      <Select items={items} value={selectValue} onValueChange={handleChange}>
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue placeholder={placeholder}>
            {(selected) => {
              if (!selected || selected === NONE) return emptyText;
              const match = options.find((option) => option.value === selected);
              return match?.label ?? emptyText;
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          alignItemWithTrigger={false}
          className="min-w-(--anchor-width)"
        >
          {allowEmpty ? (
            <SelectItem value={NONE}>{emptyText}</SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
