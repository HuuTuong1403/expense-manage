"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui-m3/icon";
import { Money } from "@/components/ui-m3/money";
import { CategoryChip } from "@/components/ui-m3/category-chip";
import { MemberAvatar } from "@/components/ui-m3/member-avatar";
import { BillStatusBadge, isOverdue } from "@/components/ui-m3/status-badge";
import { ActionButton } from "@/components/ui-m3/action-button";
import { CopyCodeButton } from "@/components/bills/copy-code-button";
import { BillFormDialog } from "@/components/bills/bill-form-dialog";
import {
  deleteBillAction,
  setBillPaidAction,
} from "@/app/(app)/bills/actions";
import { formatDate, formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BillPlain, CategoryPlain, UserPlain } from "@/lib/types";

export function BillsTable({
  bills,
  selected,
  onToggle,
  onToggleAll,
  categories,
  members,
}: {
  bills: BillPlain[];
  selected: Set<string>;
  onToggle: (code: string) => void;
  onToggleAll: (checked: boolean) => void;
  categories: CategoryPlain[];
  members: UserPlain[];
}) {
  const allChecked =
    bills.length > 0 && bills.every((bill) => selected.has(bill.code));

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[880px] text-left">
        <thead className="bg-surface-low text-code tracking-wider text-outline uppercase">
          <tr>
            <th className="w-10 px-3 py-2.5">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(event) => onToggleAll(event.target.checked)}
                aria-label="Chọn tất cả hóa đơn trên trang"
                className="size-4 accent-primary"
              />
            </th>
            <th className="px-2 py-2.5 font-semibold">Mã</th>
            <th className="px-2 py-2.5 font-semibold">Ngày</th>
            <th className="px-2 py-2.5 font-semibold">Danh mục</th>
            <th className="min-w-[200px] px-2 py-2.5 font-semibold">
              Mô tả chi tiết
            </th>
            <th className="px-2 py-2.5 font-semibold">Người trả</th>
            <th className="px-2 py-2.5 text-right font-semibold">Số tiền</th>
            <th className="px-2 py-2.5 text-center font-semibold">Trạng thái</th>
            <th className="w-12 px-2 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-high/40">
          {bills.map((bill) => {
            const overdue = isOverdue(bill.isPaid, bill.dueDate);
            const checked = selected.has(bill.code);

            return (
              <tr
                key={bill.id}
                className={cn(
                  "group relative transition-colors hover:bg-surface-low/60",
                  overdue && "bg-overdue/20",
                  checked && "bg-surface-high/20",
                )}
              >
                {overdue ? (
                  <td className="absolute top-0 bottom-0 left-0 w-1 bg-destructive p-0" />
                ) : null}
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(bill.code)}
                    aria-label={`Chọn hóa đơn ${bill.code}`}
                    className="size-4 accent-primary"
                  />
                </td>
                <td className="px-2 py-2.5">
                  <span className="inline-flex items-center gap-1 font-mono text-code font-medium">
                    {bill.code}
                    <CopyCodeButton code={bill.code} />
                  </span>
                </td>
                <td className="px-2 py-2.5 text-body-sm text-on-surface-variant">
                  {formatDayMonth(bill.date)}
                </td>
                <td className="px-2 py-2.5">
                  <CategoryChip
                    icon={bill.category.icon}
                    name={bill.category.name}
                  />
                </td>
                <td className="px-2 py-2.5">
                  <p className="line-clamp-1 text-body-md text-foreground">
                    {bill.description || "—"}
                  </p>
                  {overdue && bill.dueDate ? (
                    <p className="font-mono text-code font-medium text-destructive">
                      Hạn thanh toán: {formatDate(bill.dueDate)}
                    </p>
                  ) : null}
                </td>
                <td className="px-2 py-2.5">
                  <span className="inline-flex items-center gap-1.5">
                    <MemberAvatar
                      name={bill.username}
                      id={bill.userId}
                      size={24}
                    />
                    <span className="text-body-sm">{bill.username ?? "—"}</span>
                  </span>
                </td>
                <td className="px-2 py-2.5 text-right">
                  <Money value={bill.amount} size="md" className="font-semibold" />
                </td>
                <td className="px-2 py-2.5 text-center">
                  <BillStatusBadge isPaid={bill.isPaid} dueDate={bill.dueDate} />
                </td>
                <td className="px-2 py-2.5">
                  <BillRowMenu
                    bill={bill}
                    categories={categories}
                    members={members}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BillRowMenu({
  bill,
  categories,
  members,
}: {
  bill: BillPlain;
  categories: CategoryPlain[];
  members: UserPlain[];
}) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <BillFormDialog
        mode="edit"
        bill={bill}
        categories={categories}
        members={members}
      >
        <Button variant="ghost" size="icon-xs" aria-label={`Sửa ${bill.code}`}>
          <Icon name="edit" size={16} />
        </Button>
      </BillFormDialog>
      <ActionButton
        action={setBillPaidAction.bind(null, bill.code, !bill.isPaid)}
        variant="ghost"
        size="icon-xs"
        aria-label={bill.isPaid ? "Hủy thanh toán" : "Đánh dấu đã trả"}
      >
        <Icon name={bill.isPaid ? "undo" : "task_alt"} size={16} />
      </ActionButton>
      <ActionButton
        action={deleteBillAction.bind(null, bill.code)}
        confirm={`Xóa hóa đơn ${bill.code}?`}
        variant="ghost"
        size="icon-xs"
        aria-label={`Xóa ${bill.code}`}
        className="text-destructive hover:text-destructive"
      >
        <Icon name="delete" size={16} />
      </ActionButton>
    </div>
  );
}
