"use server";

import { connectDb } from "@/lib/db";
import { UserModel } from "@/lib/models";
import { userFormSchema } from "@/lib/validation/user";
import { VN_BANKS } from "@/lib/vietqr";
import {
  errorState,
  runAction,
  successState,
  zodErrorState,
  type ActionState,
} from "@/lib/action-result";
import { revalidateExpenseViews } from "@/lib/revalidate";

function raw(formData: FormData) {
  return {
    telegramId: formData.get("telegramId") ?? "",
    username: formData.get("username") ?? "",
    displayName: formData.get("displayName") ?? "",
    firstName: formData.get("firstName") ?? "",
    lastName: formData.get("lastName") ?? "",
    role: formData.get("role") ?? "member",
    weight: formData.get("weight") ?? "1",
    bankBin: formData.get("bankBin") ?? "",
    bankShortName: formData.get("bankShortName") ?? "",
    accountNumber: formData.get("accountNumber") ?? "",
    accountName: formData.get("accountName") ?? "",
    isActive: formData.get("isActive") ?? "false",
  };
}

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const parsed = userFormSchema.safeParse(raw(formData));
    if (!parsed.success) return zodErrorState(parsed.error);
    const values = parsed.data;

    await connectDb();
    const exists = await UserModel.exists({ telegramId: values.telegramId });
    if (exists) {
      return errorState("telegramId đã tồn tại", {
        telegramId: ["telegramId đã tồn tại"],
      });
    }

    const bank = VN_BANKS.find((item) => item.bin === values.bankBin);

    await UserModel.create({
      telegramId: values.telegramId,
      username: values.username || null,
      displayName: values.displayName,
      firstName: values.firstName || null,
      lastName: values.lastName || null,
      role: values.role,
      weight: values.weight,
      bankBin: values.bankBin || null,
      bankShortName: bank?.shortName ?? (values.bankShortName || null),
      accountNumber: values.accountNumber || null,
      accountName: values.accountName || null,
      isActive: values.isActive,
    });

    revalidateExpenseViews();
    return successState(`Đã thêm ${values.displayName}`);
  });
}

export async function updateUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const parsed = userFormSchema.safeParse(raw(formData));
    if (!parsed.success) return zodErrorState(parsed.error);
    const values = parsed.data;

    await connectDb();
    const user = await UserModel.findOne({ telegramId: values.telegramId });
    if (!user) return errorState("Không tìm thấy thành viên");

    user.username = values.username || null;
    user.displayName = values.displayName;
    user.firstName = values.firstName || null;
    user.lastName = values.lastName || null;
    user.role = values.role;
    user.weight = values.weight;
    const bank = VN_BANKS.find((item) => item.bin === values.bankBin);
    user.bankBin = values.bankBin || null;
    user.bankShortName = bank?.shortName ?? (values.bankShortName || null);
    user.accountNumber = values.accountNumber || null;
    user.accountName = values.accountName || null;
    user.isActive = values.isActive;
    await user.save();

    revalidateExpenseViews();
    return successState(`Đã cập nhật ${values.displayName}`);
  });
}

export async function deactivateUserAction(telegramId: number) {
  return runAction(async () => {
    await connectDb();
    const result = await UserModel.updateOne(
      { telegramId },
      { $set: { isActive: false } },
    );
    if (result.matchedCount === 0) return errorState("Không tìm thấy thành viên");
    revalidateExpenseViews();
    return successState("Đã tắt thành viên");
  });
}
