"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui-m3/form-field";
import { Icon } from "@/components/ui-m3/icon";
import { createRecurringAction } from "@/app/(app)/settings/actions";
import { Combobox } from "@/components/ui/combobox";
import { IDLE_STATE } from "@/lib/action-result";
import type { CategoryPlain, UserPlain } from "@/lib/types";

export function RecurringForm({
  categories,
  members,
}: {
  categories: CategoryPlain[];
  members: UserPlain[];
}) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => createRecurringAction(formData),
    IDLE_STATE,
  );

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <FormField label="Tên" htmlFor="rec-name" required className="sm:col-span-2">
        <Input id="rec-name" name="name" required placeholder="Tiền nhà" />
      </FormField>
      <FormField label="Danh mục" htmlFor="rec-cat" required>
        <Combobox
          id="rec-cat"
          name="categoryCode"
          required
          placeholder="Chọn danh mục"
          searchPlaceholder="Tìm danh mục..."
          options={categories.map((item) => ({
            value: item.code,
            label: `${item.icon} ${item.name}`,
          }))}
        />
      </FormField>
      <FormField label="Số tiền" htmlFor="rec-amount" required>
        <Input
          id="rec-amount"
          name="amount"
          required
          inputMode="numeric"
          className="font-mono"
        />
      </FormField>
      <FormField label="Ngày trong tháng" htmlFor="rec-day">
        <Input id="rec-day" name="dayOfMonth" type="number" min={1} max={31} defaultValue={1} />
      </FormField>
      <FormField label="Hạn sau (ngày)" htmlFor="rec-due">
        <Input id="rec-due" name="dueInDays" type="number" min={0} defaultValue={7} />
      </FormField>
      <FormField label="Người trả" htmlFor="rec-user" required className="sm:col-span-2">
        <Combobox
          id="rec-user"
          name="userId"
          required
          placeholder="Chọn thành viên"
          searchPlaceholder="Tìm thành viên..."
          options={members.map((item) => ({
            value: String(item.telegramId),
            label: item.name,
          }))}
        />
      </FormField>
      <FormField label="Mô tả" htmlFor="rec-desc" className="sm:col-span-2">
        <Input id="rec-desc" name="description" />
      </FormField>
      <Button type="submit" size="md" disabled={pending} className="sm:col-span-2">
        {pending ? <Icon name="refresh" size={18} className="animate-spin" /> : null}
        Thêm mẫu định kỳ
      </Button>
    </form>
  );
}
