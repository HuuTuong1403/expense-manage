"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ActionState } from "@/lib/action-result";

type ActionButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "type"
> & {
  /**
   * Server action đã bind sẵn tham số, ví dụ
   * `setBillPaidAction.bind(null, code, true)`.
   */
  action: () => Promise<ActionState>;
  /** Hỏi xác nhận bằng modal trước khi chạy — dùng cho hành động phá hủy. */
  confirm?: string;
  confirmTitle?: string;
  confirmActionLabel?: string;
  /** Nội dung thay thế khi đang chạy. */
  pendingChildren?: React.ReactNode;
};

/**
 * Nút gọi server action rồi báo kết quả bằng toast. Dùng cho các hành động một
 * cú nhấn: đánh dấu đã trả, xóa, nhắc nhở, ghi nhận chuyển khoản.
 */
export function ActionButton({
  action,
  confirm,
  confirmTitle = "Xác nhận",
  confirmActionLabel = "Đồng ý",
  children,
  pendingChildren,
  disabled,
  ...props
}: ActionButtonProps) {
  const [pending, startTransition] = React.useTransition();
  const [open, setOpen] = React.useState(false);

  function run() {
    setOpen(false);
    startTransition(async () => {
      const result = await action();
      if (result.status === "success") toast.success(result.message);
      else if (result.status === "error") toast.error(result.message);
    });
  }

  const label = pending && pendingChildren ? pendingChildren : children;

  if (!confirm) {
    return (
      <Button
        type="button"
        onClick={run}
        disabled={disabled || pending}
        aria-busy={pending}
        {...props}
      >
        {label}
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        disabled={disabled || pending}
        render={
          <Button
            type="button"
            disabled={disabled || pending}
            aria-busy={pending}
            {...props}
          />
        }
      >
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirm}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="secondary" size="md">
            Hủy bỏ
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" size="md" onClick={run}>
            {confirmActionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
