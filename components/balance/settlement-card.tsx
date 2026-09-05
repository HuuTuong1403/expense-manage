"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui-m3/surface-card";
import { Icon } from "@/components/ui-m3/icon";
import { Money } from "@/components/ui-m3/money";
import { MemberAvatar } from "@/components/ui-m3/member-avatar";
import { ActionButton } from "@/components/ui-m3/action-button";
import { VietQrDialog } from "@/components/balance/vietqr-dialog";
import { settleTransferAction } from "@/app/(app)/balance/actions";
import type { BalanceMember, BalanceTransfer } from "@/lib/types";
import { appendPeriod, type Period } from "@/lib/period";

export function SettlementCard({
  transfer,
  receiver,
  period,
  method,
  index,
}: {
  transfer: BalanceTransfer;
  receiver?: BalanceMember;
  period: Period;
  method: string;
  index: number;
}) {
  const settled = transfer.status === "settled";
  const hasBank = Boolean(receiver?.bankBin && receiver.accountNumber);

  async function copyNote() {
    try {
      await navigator.clipboard.writeText(transfer.note);
      toast.success("Đã sao chép nội dung chuyển khoản");
    } catch {
      toast.error("Không sao chép được");
    }
  }

  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="h-1 bg-linear-to-r from-primary via-primary-container to-secondary" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <Badge variant="code">Giao dịch #{String(index).padStart(2, "0")}</Badge>
          {settled ? (
            <Badge variant="income">Hoàn tất</Badge>
          ) : (
            <Badge variant="warning">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-warning" />
              </span>
              Chờ chuyển
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-low p-3">
          <div className="flex items-center gap-2">
            <MemberAvatar
              name={transfer.fromName}
              id={transfer.fromUserId}
              size={40}
            />
            <div>
              <p className="text-headline-sm">{transfer.fromName}</p>
              <p className="text-code text-outline">Người trả</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-outline">
            <Icon name="arrow_forward" size={20} />
            <span className="text-code">VietQR</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-headline-sm">{transfer.toName}</p>
              <p className="text-code text-outline">Người nhận</p>
            </div>
            <MemberAvatar
              name={transfer.toName}
              id={transfer.toUserId}
              size={40}
            />
          </div>
        </div>

        <div>
          <p className="text-body-sm text-outline">Số tiền cần chuyển</p>
          <Money value={transfer.amount} size="lg" unit tone="primary" />
        </div>

        <button
          type="button"
          onClick={copyNote}
          className="flex items-center justify-between rounded-md bg-surface px-3 py-2 text-left"
        >
          <span className="select-all font-mono text-code">{transfer.note}</span>
          <Icon name="content_copy" size={16} className="text-outline" />
        </button>

        {settled ? (
          <Button size="md" disabled className="w-full bg-income/10 text-income">
            <Icon name="verified" size={18} />
            Đã xác nhận xong
          </Button>
        ) : (
          <>
            {hasBank && receiver ? (
              <VietQrDialog
                bankBin={receiver.bankBin!}
                bankShortName={receiver.bankShortName}
                accountNumber={receiver.accountNumber!}
                accountName={receiver.accountName}
                amount={transfer.amount}
                note={transfer.note}
                receiverName={transfer.toName}
              />
            ) : (
              <p className="text-body-sm text-outline">
                Thêm số tài khoản cho {transfer.toName} để hiện mã QR.
              </p>
            )}
            <div>
              <ActionButton
                action={async () => {
                  const data = new FormData();
                  data.set("fromUserId", String(transfer.fromUserId));
                  data.set("toUserId", String(transfer.toUserId));
                  data.set("method", method);
                  appendPeriod(data, period);
                  return settleTransferAction(data);
                }}
                variant="subtle"
                size="md"
                className="w-full"
              >
                <Icon name="check_circle" size={18} />
                Ghi nhận đã chuyển khoản
              </ActionButton>
            </div>
          </>
        )}
      </div>
    </SurfaceCard>
  );
}
