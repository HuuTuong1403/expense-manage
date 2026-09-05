import { connectDb } from "@/lib/db";
import { CategoryModel } from "@/lib/models";
import { revalidateExpenseViews } from "@/lib/revalidate";
import { toSlugCode } from "@/lib/format";
import {
  cellNumber,
  cellString,
  pick,
  readFirstSheet,
  sheetToObjects,
  type ImportRowError,
} from "@/lib/excel/read";

async function preview(buffer: ArrayBuffer) {
  const rows = sheetToObjects(await readFirstSheet(buffer));
  const errors: ImportRowError[] = [];
  for (const { row, values } of rows) {
    const name = cellString(pick(values, "Tên", "name"));
    const code = toSlugCode(cellString(pick(values, "Mã", "code")) || name);
    if (!name) errors.push({ row, message: "Thiếu tên danh mục" });
    if (!code) errors.push({ row, message: "Không tạo được mã" });
  }
  return {
    total: rows.length,
    valid: rows.length - new Set(errors.map((item) => item.row)).size,
    errors,
  };
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
    if (url.searchParams.get("dryRun") !== "0") {
      return Response.json(await preview(buffer));
    }

    await connectDb();
    const rows = sheetToObjects(await readFirstSheet(buffer));
    let inserted = 0;
    const errors: ImportRowError[] = [];

    for (const { row, values } of rows) {
      const name = cellString(pick(values, "Tên", "name"));
      const code = toSlugCode(cellString(pick(values, "Mã", "code")) || name);
      if (!name || !code) {
        errors.push({ row, message: "Thiếu tên hoặc mã" });
        continue;
      }
      const payload = {
        name,
        icon: cellString(pick(values, "Icon", "icon")) || "📦",
        monthlyBudget: cellNumber(pick(values, "Định mức tháng", "monthlyBudget")) || 0,
        keywords: cellString(pick(values, "Từ khóa", "keywords"))
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        group: cellString(pick(values, "Nhóm", "group")) || null,
        description: cellString(pick(values, "Mô tả", "description")),
      };
      await CategoryModel.updateOne(
        { code },
        { $setOnInsert: { code }, $set: payload },
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
