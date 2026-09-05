"use client";

import { ActionButton } from "@/components/ui-m3/action-button";
import { Icon } from "@/components/ui-m3/icon";
import { Money } from "@/components/ui-m3/money";
import {
  bulkDeleteBillsAction,
  bulkSetPaidAction,
} from "@/app/(app)/bills/actions";

export function BulkActionBar({
  codes,
  filterTotal,
  onClear,
}: {
  codes: string[];
  filterTotal: number;
  onClear: () => void;
}) {
  if (codes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Icon name="check_box" size={18} />
        <span className="text-body-md">
          Đã chọn <strong>{codes.length}</strong> hóa đơn
        </span>
        <span className="hidden h-4 w-px bg-primary-foreground/30 sm:block" />
        <ActionButton
          action={bulkSetPaidAction.bind(null, codes, true)}
          variant="ghost"
          size="sm"
          className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
        >
          <Icon name="task_alt" size={16} />
          Đánh dấu đã trả
        </ActionButton>
        <ActionButton
          action={async () => {
            const result = await bulkDeleteBillsAction(codes);
            if (result.status === "success") onClear();
            return result;
          }}
          confirm={`Xóa ${codes.length} hóa đơn đã chọn? Không hoàn tác được.`}
          variant="destructive"
          size="sm"
          className="bg-destructive/80"
        >
          <Icon name="delete" size={16} />
          Xóa hóa đơn
        </ActionButton>
        <button
          type="button"
          onClick={onClear}
          className="text-body-sm underline-offset-2 hover:underline"
        >
          Bỏ chọn
        </button>
      </div>
      <div className="text-body-sm">
        Tổng bộ lọc hiện tại:{" "}
        <Money value={filterTotal} size="sm" className="text-primary-foreground" />
      </div>
    </div>
  );
}
