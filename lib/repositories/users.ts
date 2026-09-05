import { connectDb } from "@/lib/db";
import { UserModel, resolveUserName, type User, type UserPlain } from "@/lib/models";
import { getTotalsByMember } from "@/lib/repositories/bills";
import type { Period } from "@/lib/period";

export function toUserPlain(user: User): UserPlain {
  return {
    id: String(user._id),
    telegramId: user.telegramId,
    username: user.username ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    displayName: user.displayName ?? null,
    name: resolveUserName(user),
    role: (user.role as "admin" | "member") ?? "member",
    isActive: user.isActive !== false,
    weight: user.weight ?? 1,
    tone: user.tone ?? null,
    bankBin: user.bankBin ?? null,
    bankShortName: user.bankShortName ?? null,
    accountNumber: user.accountNumber ?? null,
    accountName: user.accountName ?? null,
    lastActivity: user.lastActivity
      ? new Date(user.lastActivity).toISOString()
      : null,
  };
}

export async function listUsers(): Promise<UserPlain[]> {
  await connectDb();
  const users = await UserModel.find().sort({ joinedAt: 1 }).lean<User[]>().exec();
  return users.map(toUserPlain);
}

export async function listActiveUsers(): Promise<UserPlain[]> {
  await connectDb();
  const users = await UserModel.find({ isActive: { $ne: false } })
    .sort({ joinedAt: 1 })
    .lean<User[]>()
    .exec();
  return users.map(toUserPlain);
}

export type UserWithSpend = UserPlain & {
  spent: number;
  billCount: number;
};

/** Thành viên kèm số tiền đã ứng trước trong kỳ. */
export async function listUsersWithSpend(
  period: Period,
  { activeOnly = false }: { activeOnly?: boolean } = {},
): Promise<UserWithSpend[]> {
  const [users, totals] = await Promise.all([
    activeOnly ? listActiveUsers() : listUsers(),
    getTotalsByMember(period),
  ]);

  const byId = new Map(totals.map((item) => [item.userId, item]));

  return users
    .map((user) => {
      const total = byId.get(user.telegramId);
      return {
        ...user,
        spent: total?.total ?? 0,
        billCount: total?.count ?? 0,
      };
    })
    .sort((a, b) => b.spent - a.spent);
}
