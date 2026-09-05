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
import { formatMoneyWithUnit, formatPeriodLabel } from "@/lib/format";
import { readPeriod, type Period } from "@/lib/period";
import { escapeMarkdown, sendTelegramMessage } from "@/lib/telegram";

function periodFromForm(formData: FormData): Period {
  return readPeriod({
    month: String(formData.get("month") ?? ""),
    year: String(formData.get("year") ?? ""),
    all: String(formData.get("all") ?? ""),
    from: String(formData.get("from") ?? ""),
    to: String(formData.get("to") ?? ""),
  });
}

export async function settleTransferAction(formData: FormData) {
  return runAction(async () => {
    const period = periodFromForm(formData);
    const method = (formData.get("method") as SettlementMethod) || "equal";
    const fromUserId = Number(formData.get("fromUserId"));
    const toUserId = Number(formData.get("toUserId"));

    await connectDb();
    const result = computeBalance
      ? await computeBalance(period, method)
      : null;
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
          month: period.month,
          year: period.year,
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
    const period = periodFromForm(formData);
    const method = (formData.get("method") as SettlementMethod) || "equal";
    const result = await computeBalance(period, method);

    let message =
      `📊 *Đối soát ${escapeMarkdown(formatPeriodLabel(period))}*\n` +
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
