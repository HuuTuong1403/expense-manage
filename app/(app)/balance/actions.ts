"use server";

import { connectDb } from "@/lib/db";
import { SettlementModel } from "@/lib/models";
import { getCurrentUser } from "@/lib/current-user";
import { computeBalance, transferKey, type SettlementMethod } from "@/lib/repositories/balance";
import {
  errorState,
  runAction,
  successState,
} from "@/lib/action-result";
import { revalidateExpenseViews } from "@/lib/revalidate";
import { formatMoneyWithUnit } from "@/lib/format";
import { escapeMarkdown, sendTelegramMessage } from "@/lib/telegram";

export async function settleTransferAction(formData: FormData) {
  return runAction(async () => {
    const method = (formData.get("method") as SettlementMethod) || "equal";
    const fromUserId = Number(formData.get("fromUserId"));
    const toUserId = Number(formData.get("toUserId"));

    await connectDb();
    const result = await computeBalance(method);
    if (!result) return errorState("Không tính được đối soát");

    const transfer = result.transfers.find(
      (item) =>
        item.fromUserId === fromUserId &&
        item.toUserId === toUserId &&
        item.status === "pending",
    );
    if (!transfer) return errorState("Không còn giao dịch này");

    const current = await getCurrentUser().catch(() => null);

    await SettlementModel.updateOne(
      { sessionCode: result.sessionCode },
      {
        $setOnInsert: {
          sessionCode: result.sessionCode,
          month: null,
          year: null,
          method,
          totalAmount: result.totalAmount,
          perMemberAmount: result.perMemberAmount,
          memberCount: result.memberCount,
          createdBy: current?.telegramId ?? null,
          createdByName: current?.name ?? null,
        },
        $push: {
          transfers: {
            fromUserId: transfer.fromUserId,
            fromName: transfer.fromName,
            toUserId: transfer.toUserId,
            toName: transfer.toName,
            amount: transfer.amount,
            note: transfer.note,
            status: "settled",
            settledAt: new Date(),
          },
        },
      },
      { upsert: true },
    );

    revalidateExpenseViews();
    return successState(
      `Đã ghi nhận ${transfer.fromName} chuyển ${formatMoneyWithUnit(transfer.amount)} cho ${transfer.toName}`,
    );
  });
}

export async function notifyBalanceAction(formData: FormData) {
  return runAction(async () => {
    const method = (formData.get("method") as SettlementMethod) || "equal";
    const result = await computeBalance(method);

    let message =
      `📊 *Đối soát chưa thanh toán (toàn thời gian)*\n` +
      `Tổng: ${formatMoneyWithUnit(result.totalAmount)} · ${result.memberCount} người\n\n`;

    if (result.transfers.filter((item) => item.status === "pending").length === 0) {
      message += `Mọi người đã cân bằng.`;
    } else {
      message += `*Gợi ý chuyển khoản:*\n`;
      result.transfers
        .filter((item) => item.status === "pending")
        .forEach((item) => {
          message += `• ${escapeMarkdown(item.fromName)} → ${escapeMarkdown(item.toName)}: ${formatMoneyWithUnit(item.amount)}\n`;
        });
    }

    const sent = await sendTelegramMessage(message);
    if (!sent) {
      return errorState(
        "Chưa cấu hình BOT_TOKEN và TELEGRAM_CHAT_ID nên không gửi được.",
      );
    }
    return successState("Đã gửi tóm tắt đối soát vào nhóm Telegram");
  });
}

export { transferKey };
