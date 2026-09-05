"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui-m3/icon";
import { Money } from "@/components/ui-m3/money";
import { CategoryChip } from "@/components/ui-m3/category-chip";
import { BillStatusBadge, isOverdue } from "@/components/ui-m3/status-badge";
import { ActionButton } from "@/components/ui-m3/action-button";
import { BillFormDialog } from "@/components/bills/bill-form-dialog";
import {
  deleteBillAction,
  setBillPaidAction,
} from "@/app/(app)/bills/actions";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BillPlain, CategoryPlain, UserPlain } from "@/lib/types";

export function BillCardList({
  bills,
  selected,
  onToggle,
  categories,
  members,
}: {
  bills: BillPlain[];
  selected: Set<string>;
  onToggle: (code: string) => void;
  categories: CategoryPlain[];
  members: UserPlain[];
}) {
  return (
    <ul className="flex flex-col gap-2 md:hidden">
      {bills.map((bill) => {
        const overdue = isOverdue(bill.isPaid, bill.dueDate);
        const checked = selected.has(bill.code);

        return (
          <li
            key={bill.id}
            className={cn(
              "relative overflow-hidden rounded-lg border border-transparent bg-card p-3 shadow-sm",
              overdue && "bg-overdue/20",
              checked && "ring-1 ring-primary/40",
            )}
          >
            {overdue ? (
              <span className="absolute inset-y-0 left-0 w-1 bg-destructive" />
            ) : null}
            <div className="flex items-start justify-between gap-2">
              <label className="flex min-w-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(bill.code)}
                  aria-label={`Chọn hóa đơn ${bill.code}`}
                  className="size-4 accent-primary"
                />
                <CategoryChip
                  icon={bill.category.icon}
                  name={bill.category.name}
                />
              </label>
              <Money value={bill.amount} size="md" className="font-semibold" />
            </div>
            <p className="mt-1.5 line-clamp-2 pl-6 text-body-md text-foreground">
              {bill.description || bill.category.name}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pl-6">
              <div className="flex flex-wrap items-center gap-2 text-body-sm text-outline">
                <span>{formatDayMonth(bill.date)}</span>
                <span>·</span>
                <span>{bill.username ?? "—"}</span>
                <BillStatusBadge isPaid={bill.isPaid} dueDate={bill.dueDate} />
              </div>
              <div className="flex items-center gap-0.5">
                <BillFormDialog
                  mode="edit"
                  bill={bill}
                  categories={categories}
                  members={members}
                >
                  <Button variant="ghost" size="icon-xs" aria-label="Sửa">
                    <Icon name="edit" size={16} />
                  </Button>
                </BillFormDialog>
                <ActionButton
                  action={setBillPaidAction.bind(null, bill.code, !bill.isPaid)}
                  variant="ghost"
                  size="icon-xs"
                  aria-label={bill.isPaid ? "Hủy thanh toán" : "Đã trả"}
                >
                  <Icon name={bill.isPaid ? "undo" : "task_alt"} size={16} />
                </ActionButton>
                <ActionButton
                  action={deleteBillAction.bind(null, bill.code)}
                  confirm={`Xóa hóa đơn ${bill.code}?`}
                  variant="ghost"
                  size="icon-xs"
                  className="text-destructive"
                >
                  <Icon name="delete" size={16} />
                </ActionButton>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
