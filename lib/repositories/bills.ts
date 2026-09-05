import { connectDb } from "@/lib/db";
import { BillModel, type Bill, type BillPlain } from "@/lib/models";
import { periodMatch, type Period } from "@/lib/period";

/** Điều kiện `$match` của Mongo, giữ lỏng để ghép được các toán tử lồng nhau. */
type MatchStage = Record<string, unknown>;

export type BillStatusFilter = "all" | "paid" | "unpaid" | "overdue";

export type BillFilters = {
  period: Period;
  categoryCode?: string | null;
  userId?: number | null;
  status?: BillStatusFilter;
  amountMin?: number | null;
  amountMax?: number | null;
  search?: string | null;
};

export const BILLS_PAGE_SIZE = 8;

/** Loại trừ khoản thu nhập khỏi các con số chi tiêu. */
const EXPENSE_ONLY = { type: { $ne: "income" } } as const;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildBillMatch(filters: BillFilters): MatchStage {
  const match: MatchStage = {
    ...periodMatch(filters.period),
    ...EXPENSE_ONLY,
  };

  if (filters.categoryCode) match["category.code"] = filters.categoryCode;
  if (filters.userId) match.userId = filters.userId;

  if (filters.status === "paid") match.isPaid = true;
  if (filters.status === "unpaid") match.isPaid = false;
  if (filters.status === "overdue") {
    match.isPaid = false;
    match.dueDate = { $ne: null, $lt: new Date() };
  }

  if (filters.amountMin != null || filters.amountMax != null) {
    const amount: MatchStage = {};
    if (filters.amountMin != null) amount.$gte = filters.amountMin;
    if (filters.amountMax != null) amount.$lte = filters.amountMax;
    match.amount = amount;
  }

  if (filters.search) {
    const pattern = new RegExp(escapeRegExp(filters.search), "i");
    match.$or = [
      { description: pattern },
      { code: pattern },
      { "category.name": pattern },
      { username: pattern },
    ];
  }

  return match;
}

export function toBillPlain(bill: Bill): BillPlain {
  return {
    id: String(bill._id),
    code: bill.code ?? "",
    userId: bill.userId,
    username: bill.username ?? null,
    category: {
      code: bill.category?.code ?? "khac",
      name: bill.category?.name ?? "Khác",
      icon: bill.category?.icon ?? null,
    },
    amount: bill.amount,
    description: bill.description ?? "",
    date: new Date(bill.date ?? Date.now()).toISOString(),
    month: bill.month,
    year: bill.year,
    isPaid: Boolean(bill.isPaid),
    paidDate: bill.paidDate ? new Date(bill.paidDate).toISOString() : null,
    dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString() : null,
    type: (bill.type as "expense" | "income") ?? "expense",
    paymentMethod: bill.paymentMethod ?? null,
    note: bill.note ?? "",
    source: bill.source ?? "bot",
  };
}

export type BillListResult = {
  items: BillPlain[];
  /** Tổng số hóa đơn khớp bộ lọc, không phụ thuộc trang. */
  totalCount: number;
  /** Tổng tiền của toàn bộ bộ lọc — con số người dùng thực sự cần. */
  totalAmount: number;
  page: number;
  pageCount: number;
};

export async function listBills(
  filters: BillFilters,
  page = 1,
  pageSize = BILLS_PAGE_SIZE,
): Promise<BillListResult> {
  await connectDb();
  const match = buildBillMatch(filters);

  const [aggregate] = await BillModel.aggregate<{
    rows: Bill[];
    meta: { totalCount: number; totalAmount: number }[];
  }>([
    { $match: match },
    {
      $facet: {
        rows: [
          { $sort: { date: -1, _id: -1 } },
          { $skip: (Math.max(1, page) - 1) * pageSize },
          { $limit: pageSize },
        ],
        meta: [
          {
            $group: {
              _id: null,
              totalCount: { $sum: 1 },
              totalAmount: { $sum: "$amount" },
            },
          },
        ],
      },
    },
  ]);

  const meta = aggregate?.meta?.[0] ?? { totalCount: 0, totalAmount: 0 };
  const pageCount = Math.max(1, Math.ceil(meta.totalCount / pageSize));

  return {
    items: (aggregate?.rows ?? []).map(toBillPlain),
    totalCount: meta.totalCount,
    totalAmount: meta.totalAmount,
    page: Math.min(Math.max(1, page), pageCount),
    pageCount,
  };
}

export type BillSummary = {
  totalAmount: number;
  totalCount: number;
  paidAmount: number;
  paidCount: number;
  unpaidAmount: number;
  unpaidCount: number;
  overdueAmount: number;
  overdueCount: number;
  /** Hóa đơn quá hạn lớn nhất, dùng làm dòng phụ của KPI. */
  topOverdueLabel: string | null;
};

/** Bốn con số KPI của trang Hóa đơn, tính theo đúng bộ lọc đang xem. */
export async function getBillSummary(
  filters: BillFilters,
): Promise<BillSummary> {
  await connectDb();
  // Bộ lọc trạng thái bị loại ra: KPI luôn hiển thị đủ 4 nhóm trạng thái.
  const match = buildBillMatch({ ...filters, status: "all" });
  const now = new Date();

  const [result] = await BillModel.aggregate<{
    total: { amount: number; count: number }[];
    paid: { amount: number; count: number }[];
    unpaid: { amount: number; count: number }[];
    overdue: { amount: number; count: number }[];
    topOverdue: { description: string; category: { name: string } }[];
  }>([
    { $match: match },
    {
      $facet: {
        total: [
          { $group: { _id: null, amount: { $sum: "$amount" }, count: { $sum: 1 } } },
        ],
        paid: [
          { $match: { isPaid: true } },
          { $group: { _id: null, amount: { $sum: "$amount" }, count: { $sum: 1 } } },
        ],
        unpaid: [
          { $match: { isPaid: false } },
          { $group: { _id: null, amount: { $sum: "$amount" }, count: { $sum: 1 } } },
        ],
        overdue: [
          { $match: { isPaid: false, dueDate: { $ne: null, $lt: now } } },
          { $group: { _id: null, amount: { $sum: "$amount" }, count: { $sum: 1 } } },
        ],
        topOverdue: [
          { $match: { isPaid: false, dueDate: { $ne: null, $lt: now } } },
          { $sort: { amount: -1 } },
          { $limit: 1 },
          { $project: { description: 1, category: 1 } },
        ],
      },
    },
  ]);

  const pick = (rows?: { amount: number; count: number }[]) =>
    rows?.[0] ?? { amount: 0, count: 0 };

  const total = pick(result?.total);
  const paid = pick(result?.paid);
  const unpaid = pick(result?.unpaid);
  const overdue = pick(result?.overdue);
  const top = result?.topOverdue?.[0];

  return {
    totalAmount: total.amount,
    totalCount: total.count,
    paidAmount: paid.amount,
    paidCount: paid.count,
    unpaidAmount: unpaid.amount,
    unpaidCount: unpaid.count,
    overdueAmount: overdue.amount,
    overdueCount: overdue.count,
    topOverdueLabel: top
      ? top.description || top.category?.name || null
      : null,
  };
}

export type CategoryTotal = {
  code: string;
  name: string;
  icon: string | null;
  total: number;
  count: number;
};

export async function getTotalsByCategory(
  period: Period,
): Promise<CategoryTotal[]> {
  await connectDb();

  const rows = await BillModel.aggregate<{
    _id: string;
    name: string;
    icon: string | null;
    total: number;
    count: number;
  }>([
    { $match: { ...periodMatch(period), ...EXPENSE_ONLY } },
    {
      $group: {
        _id: "$category.code",
        name: { $first: "$category.name" },
        icon: { $first: "$category.icon" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  return rows.map((row) => ({
    code: row._id ?? "khac",
    name: row.name ?? "Khác",
    icon: row.icon ?? null,
    total: row.total,
    count: row.count,
  }));
}

export type MemberTotal = {
  userId: number;
  username: string | null;
  total: number;
  count: number;
};

export async function getTotalsByMember(
  period: Period,
): Promise<MemberTotal[]> {
  await connectDb();

  const rows = await BillModel.aggregate<{
    _id: number;
    username: string | null;
    total: number;
    count: number;
  }>([
    { $match: { ...periodMatch(period), ...EXPENSE_ONLY } },
    {
      $group: {
        _id: "$userId",
        username: { $last: "$username" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  return rows.map((row) => ({
    userId: row._id,
    username: row.username ?? null,
    total: row.total,
    count: row.count,
  }));
}

/** Tổng chi của từng tháng trong danh sách, dùng cho biểu đồ xu hướng. */
export async function getMonthlyTotals(
  months: { month: number; year: number }[],
) {
  await connectDb();
  if (months.length === 0) return [];

  const rows = await BillModel.aggregate<{
    _id: { month: number; year: number };
    total: number;
    count: number;
  }>([
    {
      $match: {
        ...EXPENSE_ONLY,
        $or: months.map(({ month, year }) => ({ month, year })),
      },
    },
    {
      $group: {
        _id: { month: "$month", year: "$year" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const lookup = new Map(
    rows.map((row) => [`${row._id.year}-${row._id.month}`, row]),
  );

  return months.map(({ month, year }) => {
    const found = lookup.get(`${year}-${month}`);
    return {
      month,
      year,
      total: found?.total ?? 0,
      count: found?.count ?? 0,
    };
  });
}

/** Tổng chi tích lũy theo từng ngày trong kỳ. */
export async function getDailyTotals(period: Period) {
  await connectDb();

  const rows = await BillModel.aggregate<{ _id: number; total: number }>([
    { $match: { ...periodMatch(period), ...EXPENSE_ONLY } },
    {
      $group: {
        _id: { $dayOfMonth: { date: "$date", timezone: "Asia/Ho_Chi_Minh" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((row) => ({ day: row._id, total: row.total }));
}

export async function getRecentBills(limit = 5, period?: Period) {
  await connectDb();

  const bills = await BillModel.find({
    ...(period ? periodMatch(period) : {}),
    ...EXPENSE_ONLY,
  })
    .sort({ date: -1, _id: -1 })
    .limit(limit)
    .lean<Bill[]>()
    .exec();

  return bills.map(toBillPlain);
}

/**
 * Hóa đơn chưa trả có hạn: quá hạn trước, rồi tới sắp đến hạn.
 * Dùng cho panel "việc gấp" trên dashboard.
 */
export async function getDueBills(limit = 4) {
  await connectDb();

  const bills = await BillModel.find({
    isPaid: false,
    dueDate: { $ne: null },
    ...EXPENSE_ONLY,
  })
    .sort({ dueDate: 1 })
    .limit(limit)
    .lean<Bill[]>()
    .exec();

  return bills.map(toBillPlain);
}

export async function getBillByCode(code: string) {
  await connectDb();
  const bill = await BillModel.findOne({ code }).lean<Bill>().exec();
  return bill ? toBillPlain(bill) : null;
}

/** Số hóa đơn đang dùng một danh mục — để chặn xóa danh mục còn dữ liệu. */
export async function countBillsByCategory(categoryCode: string) {
  await connectDb();
  return BillModel.countDocuments({ "category.code": categoryCode });
}
