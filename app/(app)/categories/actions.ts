"use server";

import { connectDb } from "@/lib/db";
import { BillModel, CategoryModel } from "@/lib/models";
import {
  categoryFormSchema,
  categoryUpdateSchema,
} from "@/lib/validation/category";
import {
  errorState,
  runAction,
  successState,
  zodErrorState,
  type ActionState,
} from "@/lib/action-result";
import { revalidateExpenseViews } from "@/lib/revalidate";

function rawValues(formData: FormData) {
  return {
    name: formData.get("name") ?? "",
    code: formData.get("code") ?? "",
    icon: formData.get("icon") ?? "📦",
    monthlyBudget: formData.get("monthlyBudget") ?? "",
    keywords: formData.get("keywords") ?? "",
    defaultAssignee: formData.get("defaultAssignee") ?? "",
    group: formData.get("group") ?? "",
    description: formData.get("description") ?? "",
  };
}

export async function createCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const parsed = categoryFormSchema.safeParse(rawValues(formData));
    if (!parsed.success) return zodErrorState(parsed.error);
    const values = parsed.data;

    await connectDb();

    const existing = await CategoryModel.exists({ code: values.code });
    if (existing) {
      return errorState(`Mã "${values.code}" đã được dùng`, {
        code: [`Mã "${values.code}" đã được dùng`],
      });
    }

    await CategoryModel.create({
      code: values.code,
      name: values.name,
      icon: values.icon,
      description: values.description,
      monthlyBudget: values.monthlyBudget,
      keywords: values.keywords,
      defaultAssignee: values.defaultAssignee,
      group: values.group,
      isActive: true,
    });

    revalidateExpenseViews();
    return successState(`Đã thêm danh mục ${values.name}`);
  });
}

export async function updateCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const code = String(formData.get("code") ?? "").toLowerCase();
    if (!code) return errorState("Thiếu mã danh mục");

    const parsed = categoryUpdateSchema.safeParse(rawValues(formData));
    if (!parsed.success) return zodErrorState(parsed.error);
    const values = parsed.data;

    await connectDb();

    const category = await CategoryModel.findOne({ code });
    if (!category) return errorState("Không tìm thấy danh mục");

    category.name = values.name;
    category.icon = values.icon;
    category.description = values.description;
    category.monthlyBudget = values.monthlyBudget;
    category.keywords = values.keywords;
    category.defaultAssignee = values.defaultAssignee;
    category.group = values.group;
    await category.save();

    // Tên và icon được nhúng trong từng hóa đơn nên phải cập nhật đồng loạt,
    // nếu không bảng hóa đơn sẽ hiện tên cũ.
    await BillModel.updateMany(
      { "category.code": code },
      {
        $set: {
          "category.name": values.name,
          "category.icon": values.icon,
        },
      },
    );

    revalidateExpenseViews();
    return successState(`Đã cập nhật danh mục ${values.name}`);
  });
}

/**
 * Xóa danh mục. Nếu còn hóa đơn thì bắt buộc chọn danh mục thay thế và chuyển
 * toàn bộ hóa đơn sang đó trước, tránh để hóa đơn mồ côi.
 */
export async function deleteCategoryAction(
  code: string,
  replacementCode?: string | null,
) {
  return runAction(async () => {
    await connectDb();

    const category = await CategoryModel.findOne({ code }).lean();
    if (!category) return errorState("Không tìm thấy danh mục");

    const billCount = await BillModel.countDocuments({
      "category.code": code,
    });

    if (billCount > 0) {
      if (!replacementCode) {
        return errorState(
          `Còn ${billCount} hóa đơn đang dùng danh mục này. Chọn danh mục thay thế trước khi xóa.`,
        );
      }

      const replacement = await CategoryModel.findOne({
        code: replacementCode.toLowerCase(),
      }).lean();
      if (!replacement) return errorState("Danh mục thay thế không tồn tại");
      if (replacement.code === code) {
        return errorState("Danh mục thay thế phải khác danh mục đang xóa");
      }

      await BillModel.updateMany(
        { "category.code": code },
        {
          $set: {
            "category.code": replacement.code,
            "category.name": replacement.name,
            "category.icon": replacement.icon ?? null,
          },
        },
      );

      await CategoryModel.updateOne(
        { code: replacement.code },
        { $inc: { usageCount: billCount } },
      );
    }

    await CategoryModel.deleteOne({ code });

    revalidateExpenseViews();
    return successState(
      billCount > 0
        ? `Đã xóa danh mục và chuyển ${billCount} hóa đơn sang danh mục khác`
        : "Đã xóa danh mục",
    );
  });
}
