import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/** Mẫu hóa đơn lặp lại hàng tháng: tiền nhà, điện, nước, internet… */
const recurringBillSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    categoryCode: { type: String, required: true, lowercase: true },
    categoryName: { type: String, required: true },
    categoryIcon: { type: String, default: null },
    amount: { type: Number, required: true, min: 0 },
    /** Ngày trong tháng dùng làm ngày hóa đơn khi sinh. */
    dayOfMonth: { type: Number, required: true, min: 1, max: 31 },
    /** Số ngày sau ngày hóa đơn là tới hạn thanh toán. */
    dueInDays: { type: Number, default: 7, min: 0 },
    userId: { type: Number, required: true },
    username: { type: String, default: null },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    lastGeneratedMonth: { type: Number, default: null },
    lastGeneratedYear: { type: Number, default: null },
  },
  { timestamps: true, collection: "recurringbills" },
);

export type RecurringBill = InferSchemaType<typeof recurringBillSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RecurringBillModel: Model<RecurringBill> =
  (mongoose.models.RecurringBill as Model<RecurringBill>) ??
  mongoose.model<RecurringBill>("RecurringBill", recurringBillSchema);
