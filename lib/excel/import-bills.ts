import { connectDb } from "@/lib/db";
import {
  BillModel,
  CategoryModel,
  UserModel,
  allocateBillCodes,
  resolveUserName,
} from "@/lib/models";
import { vnParts } from "@/lib/format";
import {
  cellNumber,
  cellString,
  parseExcelDate,
  pick,
  readFirstSheet,
  sheetToObjects,
  type ImportRowError,
} from "@/lib/excel/read";

export type BillImportPreview = {
  total: number;
  valid: number;
  errors: ImportRowError[];
};

async function parseRows(buffer: ArrayBuffer) {
  const sheet = await readFirstSheet(buffer);
  return sheetToObjects(sheet);
}

export async function previewBillImport(
  buffer: ArrayBuffer,
): Promise<BillImportPreview> {
  await connectDb();
  const rows = await parseRows(buffer);
  const errors: ImportRowError[] = [];

  const categories = await CategoryModel.find().lean();
  const users = await UserModel.find().lean();
  const byCode = new Map(categories.map((item) => [item.code, item]));
  const byUsername = new Map(
    users
      .filter((user) => user.username)
      .map((user) => [user.username!.toLowerCase(), user]),
  );
  const byId = new Map(users.map((user) => [user.telegramId, user]));

  for (const { row, values } of rows) {
    const categoryCode = cellString(
      pick(values, "Mã danh mục", "categoryCode"),
    ).toLowerCase();
    const amount = cellNumber(pick(values, "Số tiền", "amount"));
    const date = parseExcelDate(pick(values, "Ngày", "date"));
    const payer = cellString(pick(values, "Username / telegramId", "payer"));

    if (!categoryCode || !byCode.has(categoryCode)) {
      errors.push({ row, message: `Danh mục "${categoryCode || "?"}" không tồn tại` });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push({ row, message: "Số tiền không hợp lệ" });
    }
    if (!date) {
      errors.push({ row, message: "Ngày không hợp lệ (dd/mm/yyyy)" });
    }
    const user =
      byUsername.get(payer.toLowerCase()) ??
      byId.get(Number(payer));
    if (!user) {
      errors.push({ row, message: `Không tìm thấy thành viên "${payer}"` });
    }
  }

  return {
    total: rows.length,
    valid: rows.length - new Set(errors.map((item) => item.row)).size,
    errors,
  };
}

export async function commitBillImport(
  buffer: ArrayBuffer,
  { skipErrors = true }: { skipErrors?: boolean } = {},
) {
  await connectDb();
  const preview = await previewBillImport(buffer);
  const errorRows = new Set(preview.errors.map((item) => item.row));
  if (!skipErrors && preview.errors.length > 0) {
    return { inserted: 0, skipped: preview.total, errors: preview.errors };
  }

  const rows = await parseRows(buffer);
  const categories = await CategoryModel.find().lean();
  const users = await UserModel.find().lean();
  const byCode = new Map(categories.map((item) => [item.code, item]));
  const byUsername = new Map(
    users
      .filter((user) => user.username)
      .map((user) => [user.username!.toLowerCase(), user]),
  );
  const byId = new Map(users.map((user) => [user.telegramId, user]));

  const accepted = rows.filter((item) => !errorRows.has(item.row));
  const codes = await allocateBillCodes(accepted.length);

  const docs = accepted.map(({ values }, index) => {
    const category = byCode.get(
      cellString(pick(values, "Mã danh mục", "categoryCode")).toLowerCase(),
    )!;
    const payer = cellString(pick(values, "Username / telegramId", "payer"));
    const user =
      byUsername.get(payer.toLowerCase()) ?? byId.get(Number(payer))!;
    const date = parseExcelDate(pick(values, "Ngày", "date")) ?? new Date();
    const { month, year } = vnParts(date);
    const status = cellString(pick(values, "Trạng thái", "status"));
    const isPaid = /đã/.test(status.toLowerCase()) || status.toLowerCase() === "paid";

    return {
      code: codes[index],
      userId: user.telegramId,
      username: resolveUserName(user),
      category: {
        code: category.code,
        name: category.name,
        icon: category.icon ?? null,
      },
      amount: cellNumber(pick(values, "Số tiền", "amount")),
      description: cellString(pick(values, "Mô tả", "description")),
      date,
      month,
      year,
      isPaid,
      paidDate: isPaid ? new Date() : null,
      dueDate: parseExcelDate(pick(values, "Hạn thanh toán", "dueDate")),
      paymentMethod: cellString(pick(values, "Phương thức", "paymentMethod")) || null,
      source: "import" as const,
    };
  });

  if (docs.length > 0) {
    await BillModel.insertMany(docs, { ordered: false });
    const usage = new Map<string, number>();
    for (const doc of docs) {
      usage.set(doc.category.code, (usage.get(doc.category.code) ?? 0) + 1);
    }
    await Promise.all(
      [...usage].map(([code, count]) =>
        CategoryModel.updateOne({ code }, { $inc: { usageCount: count } }),
      ),
    );
  }

  return {
    inserted: docs.length,
    skipped: preview.total - docs.length,
    errors: preview.errors,
  };
}
