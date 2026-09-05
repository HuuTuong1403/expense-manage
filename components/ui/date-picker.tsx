"use client";

import * as React from "react";
import { vi } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  formatYmd,
  monthDateRange,
  toDateInputValue,
  vnNow,
  ymdToLocalDate,
} from "@/lib/format";

function todayYmd() {
  const { year, month, day } = vnNow();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function valueToRange(
  value?: Partial<DateRangeValue> | null,
): DateRange | undefined {
  if (!value?.from && !value?.to) return undefined;
  return {
    from: value.from ? ymdToLocalDate(value.from) : undefined,
    to: value.to ? ymdToLocalDate(value.to) : undefined,
  };
}

function completeRange(range: DateRange | undefined) {
  if (!range?.from || !range.to) return null;
  const from = toDateInputValue(range.from);
  const to = toDateInputValue(range.to);
  return from <= to ? { from, to } : { from: to, to: from };
}

type DatePickerProps = {
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

export function DatePicker({
  name,
  id,
  value,
  defaultValue,
  onChange,
  placeholder = "Chọn ngày",
  required,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled;
  const selected = current ? ymdToLocalDate(current) : undefined;

  function set(next: string) {
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  }

  return (
    <div className={cn("w-full", className)}>
      {name ? (
        <input type="hidden" name={name} id={id} value={current} required={required} />
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="subtle"
              id={name ? undefined : id}
              className="h-9 w-full justify-between px-3 font-normal"
            />
          }
        >
          <span className={cn("truncate", !current && "text-outline")}>
            {current ? formatYmd(current) : placeholder}
          </span>
          <CalendarIcon className="size-4 text-outline" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-2">
          <Calendar
            mode="single"
            locale={vi}
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              if (!date) return;
              set(toDateInputValue(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export type DateRangeValue = { from: string; to: string };

export function DateRangeCalendar({
  value,
  onChange,
  defaultMonth,
}: {
  value?: Partial<DateRangeValue> | null;
  onChange?: (value: DateRangeValue) => void;
  defaultMonth?: Date;
}) {
  const [draft, setDraft] = React.useState<DateRange | undefined>(() =>
    valueToRange(value),
  );

  React.useEffect(() => {
    setDraft(valueToRange(value));
  }, [value?.from, value?.to]);

  return (
    <div className="flex flex-col gap-2">
      <Calendar
        mode="range"
        locale={vi}
        numberOfMonths={2}
        selected={draft}
        defaultMonth={draft?.from ?? defaultMonth}
        onSelect={(range) => {
          setDraft(range);
          const next = completeRange(range);
          if (next) onChange?.(next);
        }}
      />
      <div className="flex flex-wrap gap-1.5 border-t border-surface-high pt-2">
        <Button
          type="button"
          variant="subtle"
          size="sm"
          onClick={() => {
            const today = todayYmd();
            onChange?.({ from: today, to: today });
          }}
        >
          Hôm nay
        </Button>
        <Button
          type="button"
          variant="subtle"
          size="sm"
          onClick={() => {
            const today = todayYmd();
            const { year, month } = vnNow();
            onChange?.({ from: monthDateRange(month, year).from, to: today });
          }}
        >
          Từ đầu tháng
        </Button>
      </div>
    </div>
  );
}

type DateRangePickerProps = {
  value?: Partial<DateRangeValue> | null;
  onChange?: (value: DateRangeValue) => void;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
};

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Từ ngày – đến ngày",
  className,
  align = "start",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const label =
    value?.from && value?.to
      ? value.from === value.to
        ? formatYmd(value.from)
        : `${formatYmd(value.from)} – ${formatYmd(value.to)}`
      : value?.from
        ? `${formatYmd(value.from)} – …`
        : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="subtle"
            className={cn(
              "h-9 justify-between gap-2 px-2.5 font-normal",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="size-4 text-outline" />
        <span className={cn("truncate text-body-sm", !value?.from && "text-outline")}>
          {label}
        </span>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-2">
        <DateRangeCalendar
          value={value}
          onChange={(range) => {
            onChange?.(range);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
