"use client";

import * as React from "react";
import { useActionState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui-m3/icon";
import { FormField } from "@/components/ui-m3/form-field";
import {
  DialogOpener,
  ResponsiveFormDialog,
} from "@/components/ui-m3/responsive-form-dialog";
import {
  createBillAction,
  updateBillAction,
} from "@/app/(app)/bills/actions";
import { IDLE_STATE } from "@/lib/action-result";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { FormSelect } from "@/components/ui/form-select";
import { PAYMENT_METHODS } from "@/lib/validation/bill";
import { toDateInputValue, vnNow } from "@/lib/format";
import type { BillPlain, CategoryPlain, UserPlain } from "@/lib/types";

type BillFormDialogProps = {
  mode: "create" | "edit";
  bill?: BillPlain;
  categories: CategoryPlain[];
  members: UserPlain[];
  defaultUserId?: number;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function todayInput() {
  const { year, month, day } = vnNow();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function yesterdayInput() {
  const now = vnNow();
  const date = new Date(Date.UTC(now.year, now.month - 1, now.day - 1));
  return toDateInputValue(date);
}

export function BillFormDialog({
  mode,
  bill,
  categories,
  members,
  defaultUserId,
  children,
  open: controlledOpen,
  onOpenChange,
}: BillFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (isControlled) onOpenChange?.(next);
      else setUncontrolledOpen(next);
    },
    [isControlled, onOpenChange],
  );

  const [dateValue, setDateValue] = React.useState(
    bill ? toDateInputValue(bill.date) : todayInput(),
  );
  const [showMore, setShowMore] = React.useState(
    Boolean(bill?.dueDate || bill?.paymentMethod || bill?.note),
  );

  const [state, formAction, pending] = useActionState(
    mode === "create" ? createBillAction : updateBillAction,
    IDLE_STATE,
  );

  React.useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      // Đóng dialog sau khi action thành công; không thể làm trong render.
      queueMicrotask(() => setOpen(false));
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, setOpen]);

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <>
      {children ? (
        <DialogOpener onOpen={() => setOpen(true)}>{children}</DialogOpener>
      ) : null}

      <ResponsiveFormDialog
        open={open}
        onOpenChange={setOpen}
        title={mode === "create" ? "Thêm hóa đơn" : `Sửa ${bill?.code}`}
        icon="receipt_long"
        className="sm:max-w-xl"
      >
        <form
          action={formAction}
          className="flex flex-col gap-gutter-md p-gutter-lg"
        >
          {mode === "edit" ? (
            <input type="hidden" name="code" value={bill?.code ?? ""} />
          ) : null}

          <FormField
            label="Số tiền"
            htmlFor="bill-amount"
            required
            error={fieldErrors?.amount}
          >
            <Input
              id="bill-amount"
              name="amount"
              required
              inputMode="numeric"
              defaultValue={
                bill ? bill.amount.toLocaleString("vi-VN") : undefined
              }
              placeholder="350.000"
              className="font-mono text-numeric-md"
            />
          </FormField>

          <FormField
            label="Danh mục"
            htmlFor="bill-category"
            required
            error={fieldErrors?.categoryCode}
          >
            <Combobox
              id="bill-category"
              name="categoryCode"
              required
              defaultValue={bill?.category.code ?? ""}
              placeholder="Chọn danh mục"
              searchPlaceholder="Tìm danh mục..."
              options={categories.map((category) => ({
                value: category.code,
                label: `${category.icon} ${category.name}`,
              }))}
            />
          </FormField>

          <FormField
            label="Ngày chi"
            htmlFor="bill-date"
            required
            error={fieldErrors?.date}
          >
            <div className="flex flex-col gap-2">
              <DatePicker
                id="bill-date"
                name="date"
                required
                value={dateValue}
                onChange={setDateValue}
              />
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => setDateValue(todayInput())}
                >
                  Hôm nay
                </Button>
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => setDateValue(yesterdayInput())}
                >
                  Hôm qua
                </Button>
              </div>
            </div>
          </FormField>

          <FormField
            label="Mô tả"
            htmlFor="bill-description"
            error={fieldErrors?.description}
          >
            <Input
              id="bill-description"
              name="description"
              defaultValue={bill?.description}
              placeholder="Đi chợ cuối tuần"
            />
          </FormField>

          <FormField
            label="Người trả"
            htmlFor="bill-user"
            required
            error={fieldErrors?.userId}
          >
            <Combobox
              id="bill-user"
              name="userId"
              required
              defaultValue={
                bill
                  ? String(bill.userId)
                  : defaultUserId
                    ? String(defaultUserId)
                    : ""
              }
              placeholder="Chọn thành viên"
              searchPlaceholder="Tìm thành viên..."
              options={members.map((member) => ({
                value: String(member.telegramId),
                label: member.name,
              }))}
            />
          </FormField>

          <label className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <input
              type="checkbox"
              name="isPaid"
              value="true"
              defaultChecked={bill?.isPaid}
              className="size-4 accent-primary"
            />
            Đã thanh toán
          </label>

          <button
            type="button"
            onClick={() => setShowMore((value) => !value)}
            className="self-start text-body-sm font-medium text-primary hover:underline"
          >
            {showMore ? "Ẩn chi tiết" : "Thêm chi tiết (hạn trả, phương thức)"}
          </button>

          {showMore ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Hạn thanh toán" htmlFor="bill-due">
                <DatePicker
                  id="bill-due"
                  name="dueDate"
                  defaultValue={
                    bill?.dueDate ? toDateInputValue(bill.dueDate) : ""
                  }
                  placeholder="Không có hạn"
                />
              </FormField>
              <FormField label="Phương thức" htmlFor="bill-method">
                <FormSelect
                  id="bill-method"
                  name="paymentMethod"
                  defaultValue={bill?.paymentMethod ?? ""}
                  allowEmpty
                  emptyLabel="Không ghi rõ"
                  options={PAYMENT_METHODS.filter((method) => method.value).map(
                    (method) => ({
                      value: method.value,
                      label: method.label,
                    }),
                  )}
                />
              </FormField>
              <FormField
                label="Ghi chú"
                htmlFor="bill-note"
                className="sm:col-span-2"
              >
                <Input
                  id="bill-note"
                  name="note"
                  defaultValue={bill?.note}
                />
              </FormField>
            </div>
          ) : (
            <>
              <input type="hidden" name="dueDate" value="" />
              <input type="hidden" name="paymentMethod" value="" />
              <input type="hidden" name="note" value="" />
            </>
          )}

          <input type="hidden" name="type" value={bill?.type ?? "expense"} />

          <div className="mt-2 flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" size="md" disabled={pending}>
              {pending ? (
                <Icon name="refresh" size={18} className="animate-spin" />
              ) : null}
              {mode === "create" ? "Lưu hóa đơn" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </ResponsiveFormDialog>
    </>
  );
}

/** Mở form tạo hóa đơn khi URL có `?new=1` (nút header / command palette). */
export function NewBillFromQuery(props: {
  categories: CategoryPlain[];
  members: UserPlain[];
  defaultUserId?: number;
}) {
  return (
    <React.Suspense fallback={null}>
      <NewBillFromQueryInner {...props} />
    </React.Suspense>
  );
}

function NewBillFromQueryInner({
  categories,
  members,
  defaultUserId,
}: {
  categories: CategoryPlain[];
  members: UserPlain[];
  defaultUserId?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shouldOpen = searchParams.get("new") === "1";

  function close() {
    const params = new URLSearchParams(searchParams);
    params.delete("new");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <BillFormDialog
      mode="create"
      categories={categories}
      members={members}
      defaultUserId={defaultUserId}
      open={shouldOpen}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    />
  );
}
