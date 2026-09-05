import { connectDb } from "@/lib/db";
import { SettlementModel, settlementSessionCode } from "@/lib/models";
import { removeDiacritics } from "@/lib/format";
import { getTotalsByMember } from "@/lib/repositories/bills";
import { listActiveUsers } from "@/lib/repositories/users";
import type { Period } from "@/lib/period";
import type {
  BalanceMember,
  BalanceResult,
  BalanceTransfer,
  SettlementMethod,
} from "@/lib/types";

export type {
  BalanceMember,
  BalanceResult,
  BalanceTransfer,
  SettlementMethod,
} from "@/lib/types";

/** Nội dung chuyển khoản: Napas chỉ nhận ASCII nên phải bỏ dấu. */
export function transferNote(
  period: Period,
  fromName: string,
  toName: string,
) {
  const periodLabel = period.all
    ? "tat ca"
    : period.from || period.to
      ? `${period.from ?? ""}-${period.to ?? ""}`
      : `thang ${period.month}/${period.year}`;
  return removeDiacritics(
    `Doi soat ${periodLabel} - ${fromName} tra ${toName}`,
  );
}

/**
 * Ghép người nợ nhiều nhất với người được nhận nhiều nhất để số lần chuyển
 * khoản là ít nhất — thuật toán greedy port từ `balance.js` của bot.
 */
function buildSettlements(
  members: { userId: number; name: string; net: number }[],
) {
  const debtors = members
    .filter((member) => member.net < -0.5)
    .map((member) => ({ ...member, remaining: -member.net }))
    .sort((a, b) => b.remaining - a.remaining);

  const creditors = members
    .filter((member) => member.net > 0.5)
    .map((member) => ({ ...member, remaining: member.net }))
    .sort((a, b) => b.remaining - a.remaining);

  const settlements: {
    fromUserId: number;
    fromName: string;
    toUserId: number;
    toName: string;
    amount: number;
  }[] = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]!;
    const creditor = creditors[creditorIndex]!;
    const amount = Math.min(debtor.remaining, creditor.remaining);

    if (amount > 0.5) {
      settlements.push({
        fromUserId: debtor.userId,
        fromName: debtor.name,
        toUserId: creditor.userId,
        toName: creditor.name,
        amount: Math.round(amount),
      });
    }

    debtor.remaining -= amount;
    creditor.remaining -= amount;

    if (debtor.remaining <= 0.5) debtorIndex += 1;
    if (creditor.remaining <= 0.5) creditorIndex += 1;
  }

  return settlements;
}

export function transferKey(fromUserId: number, toUserId: number) {
  return `${fromUserId}->${toUserId}`;
}

export async function computeBalance(
  period: Period,
  method: SettlementMethod = "equal",
): Promise<BalanceResult> {
  await connectDb();

  const sessionCode = settlementSessionCode(
    period.month,
    period.year,
    method,
    period,
  );

  const [users, totals, settlement] = await Promise.all([
    listActiveUsers(),
    getTotalsByMember(period),
    SettlementModel.findOne({ sessionCode }).lean().exec(),
  ]);

  const paidByUser = new Map(totals.map((item) => [item.userId, item]));
  // Tổng lấy từ toàn bộ hóa đơn trong kỳ, kể cả của người đã bị tắt, để số tổng
  // luôn khớp với trang Hóa đơn.
  const totalAmount = totals.reduce((sum, item) => sum + item.total, 0);

  const weightSum =
    method === "weighted"
      ? users.reduce((sum, user) => sum + (user.weight || 0), 0)
      : users.length;

  const members: BalanceMember[] = users.map((user) => {
    const paid = paidByUser.get(user.telegramId)?.total ?? 0;
    const share =
      weightSum > 0
        ? method === "weighted"
          ? (totalAmount * (user.weight || 0)) / weightSum
          : totalAmount / weightSum
        : 0;

    return {
      userId: user.telegramId,
      name: user.name,
      weight: user.weight,
      paid,
      share,
      net: paid - share,
      billCount: paidByUser.get(user.telegramId)?.count ?? 0,
      bankShortName: user.bankShortName,
      accountNumber: user.accountNumber,
      accountName: user.accountName,
      bankBin: user.bankBin,
    };
  });

  // Các khoản đã chuyển khoản bù được cộng/trừ vào số dư để lần đối soát sau
  // không đòi trả lại lần nữa.
  const settledTransfers = (settlement?.transfers ?? []).filter(
    (transfer) => transfer.status === "settled",
  );

  const byId = new Map(members.map((member) => [member.userId, member]));
  for (const transfer of settledTransfers) {
    const from = byId.get(transfer.fromUserId);
    const to = byId.get(transfer.toUserId);
    if (from) from.net += transfer.amount;
    if (to) to.net -= transfer.amount;
  }

  const pending = buildSettlements(members).map((item) => ({
    ...item,
    key: transferKey(item.fromUserId, item.toUserId),
    note: transferNote(period, item.fromName, item.toName),
    status: "pending" as const,
  }));

  const settled: BalanceTransfer[] = settledTransfers.map((transfer) => ({
    key: transferKey(transfer.fromUserId, transfer.toUserId),
    fromUserId: transfer.fromUserId,
    fromName: transfer.fromName,
    toUserId: transfer.toUserId,
    toName: transfer.toName,
    amount: transfer.amount,
    note: transfer.note ?? "",
    status: "settled" as const,
  }));

  const debtorCount = members.filter((member) => member.net < -0.5).length;
  const creditorCount = members.filter((member) => member.net > 0.5).length;

  return {
    method,
    sessionCode,
    totalAmount,
    memberCount: members.length,
    perMemberAmount: members.length > 0 ? totalAmount / members.length : 0,
    members,
    transfers: [...settled, ...pending],
    naiveTransferCount: debtorCount * creditorCount,
    lastSettledAt: settledTransfers.length
      ? settledTransfers
          .map((transfer) =>
            transfer.settledAt ? new Date(transfer.settledAt).toISOString() : "",
          )
          .filter(Boolean)
          .sort()
          .at(-1) ?? null
      : null,
    createdByName: settlement?.createdByName ?? null,
  };
}
