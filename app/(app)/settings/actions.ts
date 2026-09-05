"use server";

import { connectDb } from "@/lib/db";
import {
  BillModel,
  CategoryModel,
  RecurringBillModel,
  UserModel,
  allocateBillCode,
  resolveUserName,
} from "@/lib/models";
import { vnDate, vnNow, vnParts } from "@/lib/format";
import {
  errorState,
  runAction,
  successState,
} from "@/lib/action-result";
import { revalidateExpenseViews } from "@/lib/revalidate";
import { sendTelegramMessage, isTelegramConfigured } from "@/lib/telegram";

export async function createRecurringAction(formData: FormData) {
  return runAction(async () => {
    const name = String(formData.get("name") ?? "").trim();
    const categoryCode = String(formData.get("categoryCode") ?? "");
    const amount = Number(String(formData.get("amount") ?? "").replace(/[.,\s]/g, ""));
    const dayOfMonth = Number(formData.get("dayOfMonth") ?? 1);
    const userId = Number(formData.get("userId"));

    if (!name || !categoryCode || !amount || !userId) {
      return errorState("Điền đủ tên, danh mục, số tiền và người trả");
    }

    await connectDb();
    const [category, user] = await Promise.all([
      CategoryModel.findOne({ code: categoryCode }).lean(),
      UserModel.findOne({ telegramId: userId }).lean(),
    ]);
    if (!category || !user) return errorState("Danh mục hoặc thành viên không tồn tại");

    await RecurringBillModel.create({
      name,
      categoryCode: category.code,
      categoryName: category.name,
      categoryIcon: category.icon ?? null,
      amount,
      dayOfMonth: Math.min(31, Math.max(1, dayOfMonth)),
      dueInDays: Number(formData.get("dueInDays") ?? 7),
      userId: user.telegramId,
      username: resolveUserName(user),
      description: String(formData.get("description") ?? ""),
      isActive: true,
    });

    revalidateExpenseViews();
    return successState(`Đã thêm hóa đơn định kỳ ${name}`);
  });
}

export async function generateRecurringThisMonthAction() {
  return runAction(async () => {
    await connectDb();
    const { month, year } = vnNow();
    const templates = await RecurringBillModel.find({ isActive: true }).lean();
    let created = 0;

    for (const template of templates) {
      if (
        template.lastGeneratedMonth === month &&
        template.lastGeneratedYear === year
      ) {
        continue;
      }

      const day = Math.min(template.dayOfMonth, new Date(year, month, 0).getDate());
      const date = vnDate(year, month, day);
      const due = vnDate(year, month, day + (template.dueInDays ?? 7));
      const { month: billMonth, year: billYear } = vnParts(date);
      const code = await allocateBillCode();

      await BillModel.create({
        code,
        userId: template.userId,
        username: template.username,
        category: {
          code: template.categoryCode,
          name: template.categoryName,
          icon: template.categoryIcon ?? null,
        },
        amount: template.amount,
        description: template.description || template.name,
        date,
        month: billMonth,
        year: billYear,
        dueDate: due,
        recurringId: String(template._id),
        source: "web",
      });

      await RecurringBillModel.updateOne(
        { _id: template._id },
        { $set: { lastGeneratedMonth: month, lastGeneratedYear: year } },
      );
      await CategoryModel.updateOne(
        { code: template.categoryCode },
        { $inc: { usageCount: 1 } },
      );
      created += 1;
    }

    if (created > 0 && isTelegramConfigured()) {
      await sendTelegramMessage(
        `🔁 *Đã sinh ${created} hóa đơn định kỳ* cho tháng ${month}/${year}`,
      );
    }

    revalidateExpenseViews();
    return successState(
      created > 0
        ? `Đã sinh ${created} hóa đơn cho tháng ${month}/${year}`
        : "Mọi hóa đơn định kỳ tháng này đã được sinh",
    );
  });
}

export async function toggleRecurringAction(id: string, isActive: boolean) {
  return runAction(async () => {
    await connectDb();
    await RecurringBillModel.updateOne({ _id: id }, { $set: { isActive } });
    revalidateExpenseViews();
    return successState(isActive ? "Đã bật" : "Đã tắt");
  });
}

export async function deleteRecurringAction(id: string) {
  return runAction(async () => {
    await connectDb();
    await RecurringBillModel.deleteOne({ _id: id });
    revalidateExpenseViews();
    return successState("Đã xóa mẫu định kỳ");
  });
}

export async function testTelegramAction() {
  return runAction(async () => {
    if (!isTelegramConfigured()) {
      return errorState("Chưa có BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong .env");
    }
    const sent = await sendTelegramMessage("✅ Kiểm tra kết nối từ web Chi Tiêu.");
    return sent
      ? successState("Đã gửi tin nhắn thử vào nhóm")
      : errorState("Telegram từ chối tin nhắn. Kiểm tra token/chat id.");
  });
}
