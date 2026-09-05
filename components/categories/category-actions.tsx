"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui-m3/icon";
import { FormField } from "@/components/ui-m3/form-field";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { deleteCategoryAction } from "@/app/(app)/categories/actions";
import { Combobox } from "@/components/ui/combobox";
import type { CategoryPlain } from "@/lib/types";

type Member = { telegramId: number; name: string };

type CategoryActionsProps = {
  category: CategoryPlain;
  billCount: number;
  members: Member[];
  /** Danh mục khác để chuyển hóa đơn sang khi xóa. */
  others: { code: string; name: string; icon: string }[];
};

export function CategoryActions({
  category,
  billCount,
  members,
  others,
}: CategoryActionsProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [replacement, setReplacement] = React.useState(others[0]?.code ?? "");
  const [pending, startTransition] = React.useTransition();

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteCategoryAction(
        category.code,
        billCount > 0 ? replacement : null,
      );

      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Tùy chọn danh mục ${category.name}`}
            />
          }
        >
          <Icon name="more_horiz" size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2">
            <Icon name="edit" size={18} />
            Sửa danh mục
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            variant="destructive"
            className="gap-2"
          >
            <Icon name="delete" size={18} />
            Xóa danh mục
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CategoryFormDialog
        mode="edit"
        category={category}
        members={members}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogTitle className="text-headline-md">
            Xóa danh mục {category.icon} {category.name}?
          </DialogTitle>

          {billCount > 0 ? (
            <div className="flex flex-col gap-gutter-sm">
              <p className="text-body-md text-on-surface-variant">
                Còn <strong className="text-foreground">{billCount} hóa đơn</strong>{" "}
                đang dùng danh mục này. Chọn danh mục thay thế để chuyển các hóa
                đơn đó sang trước khi xóa.
              </p>

              {others.length === 0 ? (
                <p className="text-body-sm text-destructive">
                  Chưa có danh mục nào khác để chuyển sang. Hãy tạo một danh mục
                  mới trước.
                </p>
              ) : (
                <FormField label="Chuyển hóa đơn sang" htmlFor="replacement">
                  <Combobox
                    id="replacement"
                    value={replacement}
                    onValueChange={setReplacement}
                    placeholder="Chọn danh mục"
                    searchPlaceholder="Tìm danh mục..."
                    allowClear={false}
                    options={others.map((item) => ({
                      value: item.code,
                      label: `${item.icon} ${item.name}`,
                    }))}
                  />
                </FormField>
              )}
            </div>
          ) : (
            <p className="text-body-md text-on-surface-variant">
              Danh mục này chưa có hóa đơn nào, xóa sẽ không ảnh hưởng dữ liệu
              cũ.
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setDeleteOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              size="md"
              onClick={confirmDelete}
              disabled={pending || (billCount > 0 && others.length === 0)}
            >
              {pending ? (
                <Icon name="refresh" size={18} className="animate-spin" />
              ) : (
                <Icon name="delete" size={18} />
              )}
              Xóa danh mục
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
