"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui-m3/icon";
import { FormField } from "@/components/ui-m3/form-field";
import {
  DialogOpener,
  ResponsiveFormDialog,
} from "@/components/ui-m3/responsive-form-dialog";
import { createUserAction, updateUserAction } from "@/app/(app)/users/actions";
import { IDLE_STATE } from "@/lib/action-result";
import { Combobox } from "@/components/ui/combobox";
import { FormSelect } from "@/components/ui/form-select";
import { VN_BANKS } from "@/lib/banks";
import type { UserPlain } from "@/lib/types";

export function UserFormDialog({
  mode,
  user,
  children,
}: {
  mode: "create" | "edit";
  user?: UserPlain;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(
    mode === "create" ? createUserAction : updateUserAction,
    IDLE_STATE,
  );

  React.useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      queueMicrotask(() => setOpen(false));
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <>
      {children ? (
        <DialogOpener onOpen={() => setOpen(true)}>{children}</DialogOpener>
      ) : null}
      <ResponsiveFormDialog
        open={open}
        onOpenChange={setOpen}
        title={mode === "create" ? "Thêm thành viên" : "Sửa thành viên"}
        icon="group"
        className="sm:max-w-xl"
      >
        <form action={formAction} className="flex flex-col gap-3 p-gutter-lg">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label="telegramId"
              htmlFor="user-id"
              required
              error={fieldErrors?.telegramId}
            >
              <Input
                id="user-id"
                name="telegramId"
                required
                readOnly={mode === "edit"}
                defaultValue={user?.telegramId}
                className="font-mono"
              />
            </FormField>
            <FormField label="Username Telegram" htmlFor="user-username">
              <Input
                id="user-username"
                name="username"
                defaultValue={user?.username ?? ""}
              />
            </FormField>
            <FormField
              label="Tên hiển thị"
              htmlFor="user-name"
              required
              error={fieldErrors?.displayName}
              className="sm:col-span-2"
            >
              <Input
                id="user-name"
                name="displayName"
                required
                defaultValue={user?.displayName ?? user?.name}
              />
            </FormField>
            <FormField label="Tên" htmlFor="user-first">
              <Input
                id="user-first"
                name="firstName"
                defaultValue={user?.firstName ?? ""}
              />
            </FormField>
            <FormField label="Họ" htmlFor="user-last">
              <Input
                id="user-last"
                name="lastName"
                defaultValue={user?.lastName ?? ""}
              />
            </FormField>
            <FormField label="Vai trò" htmlFor="user-role">
              <FormSelect
                id="user-role"
                name="role"
                required
                defaultValue={user?.role ?? "member"}
                options={[
                  { value: "member", label: "Thành viên" },
                  { value: "admin", label: "Quản trị" },
                ]}
              />
            </FormField>
            <FormField label="Trọng số chia tiền" htmlFor="user-weight">
              <Input
                id="user-weight"
                name="weight"
                type="number"
                step="0.1"
                min="0"
                defaultValue={user?.weight ?? 1}
              />
            </FormField>
          </div>

          <p className="pt-1 text-body-sm font-medium text-on-surface-variant">
            Tài khoản nhận VietQR
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Ngân hàng" htmlFor="user-bank">
              <BankField defaultBin={user?.bankBin ?? ""} />
            </FormField>
            <FormField label="Số tài khoản" htmlFor="user-acc">
              <Input
                id="user-acc"
                name="accountNumber"
                defaultValue={user?.accountNumber ?? ""}
                className="font-mono"
              />
            </FormField>
            <FormField
              label="Tên chủ tài khoản"
              htmlFor="user-acc-name"
              className="sm:col-span-2"
            >
              <Input
                id="user-acc-name"
                name="accountName"
                defaultValue={user?.accountName ?? ""}
              />
            </FormField>
          </div>

          <label className="flex items-center gap-2 text-body-sm">
            <input
              type="checkbox"
              name="isActive"
              value="true"
              defaultChecked={user?.isActive !== false}
              className="size-4 accent-primary"
            />
            Đang hoạt động
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="md" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" size="md" disabled={pending}>
              {pending ? <Icon name="refresh" size={18} className="animate-spin" /> : null}
              Lưu
            </Button>
          </div>
        </form>
      </ResponsiveFormDialog>
    </>
  );
}

function BankField({ defaultBin }: { defaultBin: string }) {
  const [bin, setBin] = React.useState(defaultBin);
  const bank = VN_BANKS.find((item) => item.bin === bin);

  return (
    <>
      <Combobox
        id="user-bank"
        name="bankBin"
        value={bin}
        onValueChange={setBin}
        placeholder="Chưa có"
        searchPlaceholder="Tìm ngân hàng..."
        options={VN_BANKS.map((item) => ({
          value: item.bin,
          label: `${item.shortName} — ${item.name}`,
        }))}
      />
      <input type="hidden" name="bankShortName" value={bank?.shortName ?? ""} />
    </>
  );
}
