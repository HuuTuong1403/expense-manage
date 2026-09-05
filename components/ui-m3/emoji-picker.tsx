"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SUGGESTIONS = [
  "🏠", "🍜", "🛒", "🚗", "☕", "💊", "🎓", "🎁",
  "⚡", "💧", "📶", "📱", "👕", "✈️", "🏥", "🐶",
  "🧾", "💰", "🎬", "🏋️", "🎮", "📚", "🧴", "📦",
];

/** Ô chọn emoji làm biểu tượng danh mục, kèm khả năng dán emoji tuỳ ý. */
export function EmojiPicker({
  name,
  defaultValue = "📦",
}: {
  name: string;
  defaultValue?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label="Chọn biểu tượng"
              className="flex h-9 w-full items-center justify-center rounded-md bg-surface-low text-xl transition-colors hover:bg-surface-high"
            />
          }
        >
          {value}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <div className="grid grid-cols-8 gap-1">
            {SUGGESTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setValue(emoji);
                  setOpen(false);
                }}
                className="flex size-7 items-center justify-center rounded-sm text-lg transition-colors hover:bg-surface-high"
              >
                {emoji}
              </button>
            ))}
          </div>
          <Input
            aria-label="Biểu tượng tuỳ chọn"
            value={value}
            onChange={(event) => setValue(event.target.value.slice(0, 4))}
            placeholder="Dán emoji khác"
            className="h-8"
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
