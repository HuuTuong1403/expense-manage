"use server";

import { connectDb } from "@/lib/db";
import { BudgetModel, CategoryModel } from "@/lib/models";
import {
  errorState,
  runAction,
  successState,
  type ActionState,
} from "@/lib/action-result";
import { revalidateExpenseViews } from "@/lib/revalidate";

function parseAmount(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").replace(/[.,\s]/g, "");
  const amount = Number(raw);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

export async function saveDefaultBudgetsAction(
  _prev: ActionState | undefined,
  formData: FormData,
) {
  return runAction(async () => {
    await connectDb();
    const codes = formData.getAll("code").map(String);
    const amounts = formData.getAll("amount");

    for (const [index, code] of codes.entries()) {
      const amount = parseAmount(amounts[index] ?? null);
      if (amount == null) {
        return errorState(`Hạn mức của ${code} không hợp lệ`);
      }
      await CategoryModel.updateOne({ code }, { $set: { monthlyBudget: amount } });
    }

    revalidateExpenseViews();
    return successState("Đã lưu hạn mức mặc định");
  });
}

export async function savePeriodBudgetsAction(
  _prev: ActionState | undefined,
  formData: FormData,
) {
  return runAction(async () => {
    const month = Number(formData.get("month"));
    const year = Number(formData.get("year"));
    if (!month || !year) return errorState("Chọn một tháng cụ thể để ghi đè");

    await connectDb();
    const codes = formData.getAll("code").map(String);
    const amounts = formData.getAll("amount");

    for (const [index, code] of codes.entries()) {
      const amount = parseAmount(amounts[index] ?? null);
      if (amount == null) continue;
      await BudgetModel.updateOne(
        { month, year, categoryCode: code },
        { $set: { limit: amount } },
        { upsert: true },
      );
    }

    revalidateExpenseViews();
    return successState(`Đã ghi đè hạn mức tháng ${month}/${year}`);
  });
}
