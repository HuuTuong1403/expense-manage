/** Kiểu và hằng số dùng được ở client — không import mongoose. */

export const CATEGORY_GROUPS = [
  { value: "sinhhoat", label: "Sinh hoạt cố định" },
  { value: "linhhoat", label: "Chi tiêu linh hoạt" },
  { value: "tietkiem", label: "Tiết kiệm & Đầu tư" },
] as const;

export type CategoryGroup = (typeof CATEGORY_GROUPS)[number]["value"];

export function categoryGroupLabel(group?: string | null) {
  return (
    CATEGORY_GROUPS.find((item) => item.value === group)?.label ??
    "Chưa phân nhóm"
  );
}

export type CategoryPlain = {
  id: string;
  code: string;
  name: string;
  icon: string;
  description: string;
  usageCount: number;
  monthlyBudget: number;
  keywords: string[];
  group: string | null;
  defaultAssignee: string | null;
  contextLabel: string;
  isDefault: boolean;
  isActive: boolean;
};

export type CategoryWithSpend = CategoryPlain & {
  spent: number;
  billCount: number;
  /** Hạn mức áp dụng cho kỳ: `Budget` của tháng nếu có, không thì mặc định. */
  budget: number;
  percent: number;
  overBy: number;
};

/** Dạng đã serialize để truyền xuống client. */
export type BillPlain = {
  id: string;
  code: string;
  userId: number;
  username: string | null;
  category: { code: string; name: string; icon: string | null };
  amount: number;
  description: string;
  date: string;
  month: number;
  year: number;
  isPaid: boolean;
  paidDate: string | null;
  dueDate: string | null;
  type: "expense" | "income";
  paymentMethod: string | null;
  note: string;
  source: string;
};

export type UserPlain = {
  id: string;
  telegramId: number;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  /** Tên đã chọn sẵn để hiển thị: displayName → firstName lastName → username. */
  name: string;
  role: "admin" | "member";
  isActive: boolean;
  weight: number;
  tone: string | null;
  bankBin: string | null;
  bankShortName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  lastActivity: string | null;
};

/** Tên hiển thị ưu tiên theo thứ tự người dùng dễ nhận ra nhất. */
export function resolveUserName(user: {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  telegramId?: number;
}) {
  if (user.displayName) return user.displayName;
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (user.username) return user.username;
  return `ID ${user.telegramId ?? "?"}`;
}

export type SettlementMethod = "equal" | "weighted";

export type BalanceMember = {
  userId: number;
  name: string;
  weight: number;
  /** Số tiền thành viên đã ứng ra trả trong kỳ. */
  paid: number;
  /** Phần thành viên phải chịu. */
  share: number;
  /** `paid - share`, đã trừ các khoản đã chuyển khoản bù. */
  net: number;
  billCount: number;
  bankShortName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  bankBin: string | null;
};

export type BalanceTransfer = {
  /** Khóa ổn định để nhận diện giao dịch giữa các lần render. */
  key: string;
  fromUserId: number;
  fromName: string;
  toUserId: number;
  toName: string;
  amount: number;
  note: string;
  status: "pending" | "settled";
};

export type BalanceResult = {
  method: SettlementMethod;
  sessionCode: string;
  totalAmount: number;
  memberCount: number;
  perMemberAmount: number;
  members: BalanceMember[];
  transfers: BalanceTransfer[];
  /** Số giao dịch nếu ai nợ cũng trả riêng cho từng người được nhận. */
  naiveTransferCount: number;
  lastSettledAt: string | null;
  createdByName: string | null;
};
