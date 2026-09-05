"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui-m3/icon";
import {
  DialogOpener,
  ResponsiveFormDialog,
} from "@/components/ui-m3/responsive-form-dialog";

type Entity = "bills" | "categories" | "users";

type Preview = {
  total: number;
  valid: number;
  errors: { row: number; message: string }[];
};

const ENDPOINTS: Record<Entity, string> = {
  bills: "/api/bills/import",
  categories: "/api/categories/import",
  users: "/api/users/import",
};

export function ImportDialog({ entity }: { entity: Entity }) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<Preview | null>(null);
  const [pending, setPending] = React.useState(false);

  async function send(dryRun: boolean) {
    if (!file) return;
    setPending(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch(
        `${ENDPOINTS[entity]}?dryRun=${dryRun ? "1" : "0"}`,
        { method: "POST", body },
      );
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message ?? "Không nhập được file");
        return;
      }
      if (dryRun) {
        setPreview(data);
      } else {
        toast.success(
          `Đã nhập ${data.inserted} dòng` +
            (data.skipped ? `, bỏ qua ${data.skipped}` : ""),
        );
        setOpen(false);
        setFile(null);
        setPreview(null);
      }
    } catch {
      toast.error("Không kết nối được máy chủ");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <DialogOpener onOpen={() => setOpen(true)}>
        <Button variant="subtle" size="md">
          <Icon name="file_upload" size={18} />
          Nhập dữ liệu
        </Button>
      </DialogOpener>

      <ResponsiveFormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setFile(null);
            setPreview(null);
          }
        }}
        title="Nhập Excel"
        icon="upload_file"
      >
        <div className="flex flex-col gap-gutter-md p-gutter-lg">
          <p className="text-body-sm text-on-surface-variant">
            Tải file mẫu, điền dữ liệu rồi chọn file để xem trước. Dòng lỗi sẽ
            được bỏ qua khi xác nhận.
          </p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setPreview(null);
            }}
            className="text-body-sm"
          />

          {preview ? (
            <div className="rounded-lg bg-surface-low p-3 text-body-sm">
              <p>
                {preview.valid}/{preview.total} dòng hợp lệ
              </p>
              {preview.errors.length > 0 ? (
                <ul className="mt-2 max-h-40 overflow-y-auto text-destructive">
                  {preview.errors.slice(0, 20).map((error) => (
                    <li key={`${error.row}-${error.message}`}>
                      Dòng {error.row}: {error.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-income">Không có lỗi.</p>
              )}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={!file || pending}
              onClick={() => send(true)}
            >
              Xem trước
            </Button>
            <Button
              type="button"
              size="md"
              disabled={!preview || preview.valid === 0 || pending}
              onClick={() => send(false)}
            >
              {pending ? (
                <Icon name="refresh" size={18} className="animate-spin" />
              ) : null}
              Xác nhận nhập
            </Button>
          </div>
        </div>
      </ResponsiveFormDialog>
    </>
  );
}
