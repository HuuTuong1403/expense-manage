import { connectDb } from "@/lib/db";
import { BudgetModel, CategoryModel, type Category } from "@/lib/models";
import type { CategoryPlain, CategoryWithSpend } from "@/lib/types";
import { ratio } from "@/lib/format";
import { getTotalsByCategory } from "@/lib/repositories/bills";
import type { Period } from "@/lib/period";

export function toCategoryPlain(category: Category): CategoryPlain {
  return {
    id: String(category._id),
    code: category.code,
    name: category.name,
    icon: category.icon ?? "📦",
    description: category.description ?? "",
    usageCount: category.usageCount ?? 0,
    monthlyBudget: category.monthlyBudget ?? 0,
    keywords: category.keywords ?? [],
    group: category.group ?? null,
    defaultAssignee: category.defaultAssignee ?? null,
    contextLabel: category.contextLabel ?? "",
    isDefault: Boolean(category.isDefault),
    isActive: category.isActive !== false,
  };
}

export async function listCategories(): Promise<CategoryPlain[]> {
  await connectDb();
  const categories = await CategoryModel.find()
    .sort({ usageCount: -1, name: 1 })
    .lean<Category[]>()
    .exec();
  return categories.map(toCategoryPlain);
}

export type { CategoryWithSpend } from "@/lib/types";

/**
 * Danh mục kèm số đã chi trong kỳ và hạn mức áp dụng. Đây là dữ liệu cho cả
 * lưới card trang Danh mục và khối tiến độ ngân sách trên Dashboard.
 */
export async function listCategoriesWithSpend(
  period: Period,
): Promise<CategoryWithSpend[]> {
  await connectDb();

  const [categories, totals, overrides] = await Promise.all([
    CategoryModel.find().sort({ usageCount: -1, name: 1 }).lean<Category[]>().exec(),
    getTotalsByCategory(period),
    period.all || !period.month || !period.year
      ? Promise.resolve([])
      : BudgetModel.find({ month: period.month, year: period.year })
          .lean()
          .exec(),
  ]);

  const spendByCode = new Map(totals.map((item) => [item.code, item]));
  const overrideByCode = new Map(
    overrides.map((item) => [item.categoryCode, item.limit]),
  );

  return categories.map((category) => {
    const plain = toCategoryPlain(category);
    const spend = spendByCode.get(plain.code);
    const spent = spend?.total ?? 0;
    const budget = overrideByCode.get(plain.code) ?? plain.monthlyBudget ?? 0;
    const percent = budget > 0 ? ratio(spent, budget) : 0;

    return {
      ...plain,
      spent,
      billCount: spend?.count ?? 0,
      budget,
      percent,
      overBy: budget > 0 && spent > budget ? spent - budget : 0,
    };
  });
}

export async function getCategoryByCode(code: string) {
  await connectDb();
  const category = await CategoryModel.findOne({ code }).lean<Category>().exec();
  return category ? toCategoryPlain(category) : null;
}
