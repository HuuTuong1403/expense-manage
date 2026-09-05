import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Hạn mức ghi đè cho một danh mục trong một tháng cụ thể. Nếu không có bản ghi
 * nào thì dùng `Category.monthlyBudget`.
 */
const budgetSchema = new Schema(
  {
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    categoryCode: { type: String, required: true, lowercase: true },
    limit: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, collection: "budgets" },
);

budgetSchema.index(
  { year: 1, month: 1, categoryCode: 1 },
  { unique: true },
);

export type Budget = InferSchemaType<typeof budgetSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BudgetModel: Model<Budget> =
  (mongoose.models.Budget as Model<Budget>) ??
  mongoose.model<Budget>("Budget", budgetSchema);
