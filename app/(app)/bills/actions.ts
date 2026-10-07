"use server";

import { connectDb } from "@/lib/db";
import {
  BillModel,
  CategoryModel,
  UserModel,
  allocateBillCode,
  resolveUserName,
} from "@/lib/models";
import { billFormSchema } from "@/lib/validation/bill";
import {
  errorState,
  runAction,
  successState,
  zodErrorState,
  type ActionState,
} from "@/lib/action-result";
import { revalidateExpenseViews } from "@/lib/revalidate";
import { formatDate, formatMoneyWithUnit, vnDate, vnParts } from "@/lib/format";
import { escapeMarkdown, sendTelegramMessage } from "@/lib/telegram";

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return vnDate(year!, month!, day!);
}

function formValuesFrom(formData: FormData) {
  return billFormSchema.safeParse({
    amount: formData.get("amount") ?? "",
    categoryCode: formData.get("categoryCode") ?? "",
    date: formData.get("date") ?? "",
    description: formData.get("description") ?? "",
    userId: formData.get("userId") ?? "0",
    isPaid: formData.get("isPaid") ?? "false",
    dueDate: formData.get("dueDate") ?? "",
    paymentMethod: formData.get("paymentMethod") ?? "",
    note: formData.get("note") ?? "",
    type: formData.get("type") ?? "expense",
  });
}

export async function createBillAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const parsed = formValuesFrom(formData);
    if (!parsed.success) return zodErrorState(parsed.error);
    const values = parsed.data;

    await connectDb();

    const category = await CategoryModel.findOne({
      code: values.categoryCode,
    }).lean();
    if (!category) {
      return errorState("Danh mục không tồn tại", {
        categoryCode: ["Danh mục không tồn tại"],
      });
    }

    const user = await UserModel.findOne({ telegramId: values.userId }).lean();
    if (!user) {
      return errorState("Không tìm thấy thành viên", {
        userId: ["Không tìm thấy thành viên"],
      });
    }

    const date = parseDateInput(values.date);
    const { month, year } = vnParts(date);
    const code = await allocateBillCode();

    await BillModel.create({
      code,
      userId: user.telegramId,
      username: resolveUserName(user),
      category: {
        code: category.code,
        name: category.name,
        icon: category.icon ?? null,
      },
      amount: values.amount,
      description: values.description,
      date,
      month,
      year,
      isPaid: values.isPaid,
      paidDate: values.isPaid ? new Date() : null,
      dueDate: values.dueDate ? parseDateInput(values.dueDate) : null,
      paymentMethod: values.paymentMethod || null,
      note: values.note,
      type: values.type,
      source: "web",
    });

    await CategoryModel.updateOne(
      { code: category.code },
      { $inc: { usageCount: 1 } },
    );

    await sendTelegramMessage(
      `🧾 *Hóa đơn mới từ web*\n` +
        `• Mã: \`${code}\`\n` +
        `• Loại: ${category.icon ?? ""} ${escapeMarkdown(category.name)}\n` +
        `• Số tiền: ${formatMoneyWithUnit(values.amount)}\n` +
        `• Ngày: ${formatDate(date)}\n` +
        `• Ghi chú: ${values.note}\n` +
        `• Người trả: ${escapeMarkdown(resolveUserName(user))}`,
    );

    revalidateExpenseViews();
    return successState(`Đã thêm hóa đơn ${code}`);
  });
}

export async function updateBillAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const code = String(formData.get("code") ?? "");
    if (!code) return errorState("Thiếu mã hóa đơn");

    const parsed = formValuesFrom(formData);
    if (!parsed.success) return zodErrorState(parsed.error);
    const values = parsed.data;

    await connectDb();

    const bill = await BillModel.findOne({ code });
    if (!bill) return errorState("Không tìm thấy hóa đơn");

    const category = await CategoryModel.findOne({
      code: values.categoryCode,
    }).lean();
    if (!category) {
      return errorState("Danh mục không tồn tại", {
        categoryCode: ["Danh mục không tồn tại"],
      });
    }

    const user = await UserModel.findOne({ telegramId: values.userId }).lean();
    if (!user) {
      return errorState("Không tìm thấy thành viên", {
        userId: ["Không tìm thấy thành viên"],
      });
    }

    const date = parseDateInput(values.date);
    const { month, year } = vnParts(date);

    bill.category = {
      code: category.code,
      name: category.name,
      icon: category.icon ?? null,
    };
    bill.amount = values.amount;
    bill.description = values.description;
    // `month`/`year` là field denormalized, phải cập nhật cùng lúc với `date`.
    bill.date = date;
    bill.month = month;
    bill.year = year;
    bill.userId = user.telegramId;
    bill.username = resolveUserName(user);
    bill.dueDate = values.dueDate ? parseDateInput(values.dueDate) : null;
    bill.paymentMethod = values.paymentMethod || null;
    bill.note = values.note;
    bill.type = values.type;

    if (values.isPaid !== bill.isPaid) {
      bill.isPaid = values.isPaid;
      bill.paidDate = values.isPaid ? new Date() : null;
    }

    await bill.save();

    revalidateExpenseViews();
    return successState(`Đã cập nhật hóa đơn ${code}`);
  });
}

export async function setBillPaidAction(code: string, isPaid: boolean) {
  return runAction(async () => {
    await connectDb();
    const result = await BillModel.updateOne(
      { code },
      { $set: { isPaid, paidDate: isPaid ? new Date() : null } },
    );

    if (result.matchedCount === 0) return errorState("Không tìm thấy hóa đơn");

    revalidateExpenseViews();
    return successState(
      isPaid ? `Đã đánh dấu ${code} là đã trả` : `Đã hủy thanh toán ${code}`,
    );
  });
}

export async function deleteBillAction(code: string) {
  return runAction(async () => {
    await connectDb();
    const bill = await BillModel.findOneAndDelete({ code }).lean();
    if (!bill) return errorState("Không tìm thấy hóa đơn");

    if (bill.category?.code) {
      await CategoryModel.updateOne(
        { code: bill.category.code, usageCount: { $gt: 0 } },
        { $inc: { usageCount: -1 } },
      );
    }

    revalidateExpenseViews();
    return successState(`Đã xóa hóa đơn ${code}`);
  });
}

export async function bulkSetPaidAction(codes: string[], isPaid: boolean) {
  return runAction(async () => {
    if (codes.length === 0) return errorState("Chưa chọn hóa đơn nào");

    await connectDb();
    const result = await BillModel.updateMany(
      { code: { $in: codes } },
      { $set: { isPaid, paidDate: isPaid ? new Date() : null } },
    );

    revalidateExpenseViews();
    return successState(
      `Đã cập nhật ${result.modifiedCount} hóa đơn thành ${
        isPaid ? "đã trả" : "chưa trả"
      }`,
    );
  });
}

export async function bulkDeleteBillsAction(codes: string[]) {
  return runAction(async () => {
    if (codes.length === 0) return errorState("Chưa chọn hóa đơn nào");

    await connectDb();
    const bills = await BillModel.find({ code: { $in: codes } })
      .select({ "category.code": 1 })
      .lean();

    await BillModel.deleteMany({ code: { $in: codes } });

    // Trả lại usageCount cho từng danh mục theo số hóa đơn vừa xóa.
    const perCategory = new Map<string, number>();
    for (const bill of bills) {
      const key = bill.category?.code;
      if (key) perCategory.set(key, (perCategory.get(key) ?? 0) + 1);
    }
    await Promise.all(
      [...perCategory].map(([code, count]) =>
        CategoryModel.updateOne({ code }, { $inc: { usageCount: -count } }),
      ),
    );

    revalidateExpenseViews();
    return successState(`Đã xóa ${bills.length} hóa đơn`);
  });
}

/** Gửi nhắc nhở vào nhóm Telegram cho một hóa đơn chưa thanh toán. */
export async function remindBillAction(code: string) {
  return runAction(async () => {
    await connectDb();
    const bill = await BillModel.findOne({ code }).lean();
    if (!bill) return errorState("Không tìm thấy hóa đơn");

    const sent = await sendTelegramMessage(
      `⏰ *Nhắc thanh toán*\n` +
        `• Mã: \`${bill.code}\`\n` +
        `• Nội dung: ${escapeMarkdown(bill.description || bill.category?.name || "")}\n` +
        `• Số tiền: ${formatMoneyWithUnit(bill.amount)}\n` +
        (bill.dueDate ? `• Hạn: ${formatDate(bill.dueDate)}\n` : "") +
        `• Người phụ trách: ${escapeMarkdown(bill.username ?? "")}`,
    );

    if (!sent) {
      return errorState(
        "Chưa cấu hình BOT_TOKEN và TELEGRAM_CHAT_ID nên không gửi được nhắc nhở.",
      );
    }

    return successState(`Đã gửi nhắc nhở cho ${code}`);
  });
}
