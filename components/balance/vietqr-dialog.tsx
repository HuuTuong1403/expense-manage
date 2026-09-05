"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui-m3/icon";
import { Money } from "@/components/ui-m3/money";
import {
  DialogOpener,
  ResponsiveFormDialog,
} from "@/components/ui-m3/responsive-form-dialog";
import { bankLabel } from "@/lib/banks";

export function VietQrDialog({
  bankBin,
  bankShortName,
  accountNumber,
  accountName,
  amount,
  note,
  receiverName,
}: {
  bankBin: string;
  bankShortName?: string | null;
  accountNumber: string;
  accountName?: string | null;
  amount: number;
  note: string;
  receiverName: string;
}) {
  const [open, setOpen] = React.useState(false);
  const src = `/api/qr?bankBin=${encodeURIComponent(bankBin)}&accountNumber=${encodeURIComponent(accountNumber)}&amount=${amount}&note=${encodeURIComponent(note)}&accountName=${encodeURIComponent(accountName ?? "")}`;

  async function copyNote() {
    try {
      await navigator.clipboard.writeText(note);
      toast.success("Đã sao chép nội dung chuyển khoản");
    } catch {
      toast.error("Không sao chép được");
    }
  }

  return (
    <>
      <DialogOpener onOpen={() => setOpen(true)}>
        <Button size="md" className="w-full">
          <Icon name="qr_code_2" size={18} />
          Xem mã QR VietQR
        </Button>
      </DialogOpener>

      <ResponsiveFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Mã QR VietQR"
        icon="qr_code_2"
        className="sm:max-w-sm"
      >
        <div className="flex flex-col items-center gap-3 p-gutter-lg">
          <p className="text-center text-body-sm text-on-surface-variant">
            Quét trực tiếp qua mọi app ngân hàng
          </p>
          <div className="rounded-md bg-surface-low p-3">
            <div className="rounded-md bg-card p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="VietQR" width={192} height={192} />
            </div>
          </div>
          <p className="font-mono text-code text-primary">
            {bankLabel(bankBin, bankShortName)} · {accountNumber}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Người nhận: {receiverName}
            {accountName ? ` (${accountName})` : ""}
          </p>
          <Money value={amount} size="md" unit tone="primary" />
          <button
            type="button"
            onClick={copyNote}
            className="w-full select-all rounded-md bg-surface px-3 py-2 font-mono text-code"
          >
            {note}
          </button>
          <div className="flex w-full gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Đóng
            </Button>
            <Button
              size="md"
              className="flex-1"
              render={<a href={`${src}&download=1`} />}
            >
              Tải ảnh QR
            </Button>
          </div>
        </div>
      </ResponsiveFormDialog>
    </>
  );
}
