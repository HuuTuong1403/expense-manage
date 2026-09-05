import { connectDb } from "@/lib/db";
import { UserModel } from "@/lib/models";
import { revalidateExpenseViews } from "@/lib/revalidate";
import {
  cellNumber,
  cellString,
  pick,
  readFirstSheet,
  sheetToObjects,
  type ImportRowError,
} from "@/lib/excel/read";

function isActiveValue(value: unknown) {
  const raw = cellString(value).toLowerCase();
  return raw !== "không" && raw !== "0" && raw !== "false" && raw !== "no";
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ message: "Chưa chọn file" }, { status: 400 });
    }
    const buffer = await file.arrayBuffer();
    const rows = sheetToObjects(await readFirstSheet(buffer));
    const errors: ImportRowError[] = [];

    for (const { row, values } of rows) {
      const id = cellNumber(pick(values, "telegramId"));
      if (!Number.isFinite(id)) {
        errors.push({ row, message: "telegramId không hợp lệ" });
      }
    }

    if (url.searchParams.get("dryRun") !== "0") {
      return Response.json({
        total: rows.length,
        valid: rows.length - errors.length,
        errors,
      });
    }

    await connectDb();
    const errorRows = new Set(errors.map((item) => item.row));
    let inserted = 0;

    for (const { row, values } of rows) {
      if (errorRows.has(row)) continue;
      const telegramId = cellNumber(pick(values, "telegramId"));
      await UserModel.updateOne(
        { telegramId },
        {
          $set: {
            username: cellString(pick(values, "Username", "username")) || null,
            displayName: cellString(pick(values, "Tên hiển thị", "displayName")) || null,
            firstName: cellString(pick(values, "Tên", "firstName")) || null,
            lastName: cellString(pick(values, "Họ", "lastName")) || null,
            role: cellString(pick(values, "Vai trò", "role")) === "admin" ? "admin" : "member",
            weight: cellNumber(pick(values, "Trọng số", "weight")) || 1,
            bankBin: cellString(pick(values, "BIN ngân hàng", "bankBin")) || null,
            bankShortName: cellString(pick(values, "Ngân hàng", "bankShortName")) || null,
            accountNumber: cellString(pick(values, "Số TK", "accountNumber")) || null,
            accountName: cellString(pick(values, "Chủ TK", "accountName")) || null,
            isActive: isActiveValue(pick(values, "Hoạt động", "isActive")),
          },
          $setOnInsert: { telegramId, joinedAt: new Date() },
        },
        { upsert: true },
      );
      inserted += 1;
    }

    revalidateExpenseViews();
    return Response.json({
      inserted,
      skipped: rows.length - inserted,
      errors,
    });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Lỗi nhập" },
      { status: 400 },
    );
  }
}
