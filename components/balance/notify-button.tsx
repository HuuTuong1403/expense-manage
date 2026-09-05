"use client";

import { ActionButton } from "@/components/ui-m3/action-button";
import { Icon } from "@/components/ui-m3/icon";
import { notifyBalanceAction } from "@/app/(app)/balance/actions";
import { appendPeriod, type Period } from "@/lib/period";

export function NotifyBalanceButton({
  period,
  method,
}: {
  period: Period;
  method: string;
}) {
  return (
    <ActionButton
      action={async () => {
        const data = new FormData();
        data.set("method", method);
        appendPeriod(data, period);
        return notifyBalanceAction(data);
      }}
      variant="subtle"
      size="md"
      className="w-full justify-start"
    >
      <Icon name="send" size={18} />
      Gửi thông báo vào nhóm Telegram
    </ActionButton>
  );
}
