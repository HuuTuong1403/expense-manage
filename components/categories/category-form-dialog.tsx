"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui-m3/icon";
import { FormField } from "@/components/ui-m3/form-field";
import { EmojiPicker } from "@/components/ui-m3/emoji-picker";
import {
  DialogOpener,
  ResponsiveFormDialog,
} from "@/components/ui-m3/responsive-form-dialog";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/(app)/categories/actions";
import { IDLE_STATE } from "@/lib/action-result";
import { Combobox } from "@/components/ui/combobox";
import { FormSelect } from "@/components/ui/form-select";
import { CATEGORY_GROUPS, type CategoryPlain } from "@/lib/types";
import { toSlugCode } from "@/lib/format";

type Member = { telegramId: number; name: string };

type CategoryFormDialogProps = {
  mode: "create" | "edit";
  category?: CategoryPlain;
  members: Member[];
  /** Nút mở dialog. Bỏ qua nếu dialog được điều khiển từ bên ngoài. */
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CategoryFormDialog({
  mode,
  category,
  members,
  children,
  open: controlledOpen,
  onOpenChange,
}: CategoryFormDialogProps) {
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

  const [state, formAction, pending] = useActionState(
    mode === "create" ? createCategoryAction : updateCategoryAction,
    IDLE_STATE,
  );
  const [codeDraft, setCodeDraft] = React.useState(category?.code ?? "");
  const [codeTouched, setCodeTouched] = React.useState(mode === "edit");

  // Đóng dialog và báo kết quả ngay khi action trả về thành công.
  React.useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      queueMicrotask(() => setOpen(false));
    } else if (state.status === "error") {
      toast.error(state.message);
    }
    // `setOpen` ổn định qua useCallback nên không gây vòng lặp.
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
        title={mode === "create" ? "Thêm danh mục mới" : "Sửa danh mục"}
        icon="category"
      >
        <form
          action={formAction}
          className="flex flex-col gap-gutter-md p-gutter-lg"
        >
          {mode === "edit" ? (
            <input type="hidden" name="code" value={category?.code ?? ""} />
          ) : null}

          <div className="grid grid-cols-4 gap-3">
            <FormField label="Biểu tượng" className="col-span-1">
              <EmojiPicker name="icon" defaultValue={category?.icon ?? "📦"} />
            </FormField>

            <FormField
              label="Tên danh mục"
              htmlFor="category-name"
              required
              error={fieldErrors?.name}
              className="col-span-3"
            >
              <Input
                id="category-name"
                name="name"
                required
                defaultValue={category?.name}
                placeholder="Ví dụ: Du lịch & Giải trí"
                onChange={(event) => {
                  if (!codeTouched) setCodeDraft(toSlugCode(event.target.value));
                }}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label="Mã code bot (slug)"
              htmlFor="category-code"
              required={mode === "create"}
              error={fieldErrors?.code}
              hint={
                mode === "edit"
                  ? "Không sửa được vì mọi người đã gõ mã này trong Telegram."
                  : "Dùng để gõ trong Telegram, ví dụ /addbill dulich 500000"
              }
            >
              <div className="relative">
                <span className="pointer-events-none absolute top-2.5 left-3 font-mono text-code text-outline">
                  /
                </span>
                {mode === "create" ? (
                  <Input
                    id="category-code"
                    name="code"
                    required
                    value={codeDraft}
                    onChange={(event) => {
                      setCodeTouched(true);
                      setCodeDraft(toSlugCode(event.target.value));
                    }}
                    placeholder="dulich"
                    className="pl-6 font-mono"
                  />
                ) : (
                  <Input
                    id="category-code"
                    value={category?.code ?? ""}
                    readOnly
                    disabled
                    className="pl-6 font-mono"
                  />
                )}
              </div>
            </FormField>

            <FormField
              label="Định mức tháng (₫)"
              htmlFor="category-budget"
              error={fieldErrors?.monthlyBudget}
            >
              <Input
                id="category-budget"
                name="monthlyBudget"
                inputMode="numeric"
                defaultValue={
                  category?.monthlyBudget
                    ? category.monthlyBudget.toLocaleString("vi-VN")
                    : ""
                }
                placeholder="2.000.000"
                className="font-mono"
              />
            </FormField>
          </div>

          <FormField
            label="Từ khóa nhận diện tự động"
            htmlFor="category-keywords"
            error={fieldErrors?.keywords}
            hint="Các từ khóa cách nhau bởi dấu phẩy, dùng để bot gắn tag tự động."
          >
            <Input
              id="category-keywords"
              name="keywords"
              defaultValue={category?.keywords.join(", ")}
              placeholder="vé máy bay, khách sạn, tour, resort..."
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Phụ trách mặc định" htmlFor="category-assignee">
              <Combobox
                id="category-assignee"
                name="defaultAssignee"
                defaultValue={category?.defaultAssignee ?? ""}
                placeholder="Không chỉ định"
                searchPlaceholder="Tìm người phụ trách..."
                options={[
                  { value: "shared", label: "Chia đều cho mọi người" },
                  ...members.map((member) => ({
                    value: String(member.telegramId),
                    label: member.name,
                  })),
                ]}
              />
            </FormField>

            <FormField label="Nhóm chi tiêu" htmlFor="category-group">
              <FormSelect
                id="category-group"
                name="group"
                defaultValue={category?.group ?? ""}
                allowEmpty
                emptyLabel="Chưa phân nhóm"
                options={CATEGORY_GROUPS.map((group) => ({
                  value: group.value,
                  label: group.label,
                }))}
              />
            </FormField>
          </div>

          <FormField label="Mô tả ngắn" htmlFor="category-description">
            <Input
              id="category-description"
              name="description"
              defaultValue={category?.description}
              placeholder="Ghi chú cho cả nhà cùng hiểu"
            />
          </FormField>

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
              {mode === "create" ? "Lưu danh mục" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </ResponsiveFormDialog>
    </>
  );
}
