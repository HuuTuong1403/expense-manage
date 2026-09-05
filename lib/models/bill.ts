import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Danh mục được nhúng thẳng vào hóa đơn dạng `{ code, name }` — giữ đúng cách
 * bot đang ghi, không đổi sang ObjectId ref.
 */
const billCategorySchema = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String, default: null },
  },
  { _id: false },
);

const billSchema = new Schema(
  {
    code: { type: String, index: true, unique: true },
    /** Bằng `telegramId` của người trả, kiểu Number như bot đang dùng. */
    userId: { type: Number, required: true, index: true },
    username: { type: String, default: null },
    category: {
      type: billCategorySchema,
      required: true,
      default: () => ({ code: "khac", name: "Khác" }),
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    /** Denormalized, phải luôn đồng bộ với `date`. */
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidDate: { type: Date, default: null },

    /* --- Field mở rộng cho web, đều optional để bot cũ không bị ảnh hưởng --- */
    dueDate: { type: Date, default: null },
    type: { type: String, enum: ["expense", "income"], default: "expense" },
    paymentMethod: { type: String, default: null },
    tags: { type: [String], default: undefined },
    note: { type: String, default: "" },
    attachmentUrl: { type: String, default: null },
    recurringId: { type: String, default: null },
    source: {
      type: String,
      enum: ["bot", "web", "import"],
      default: "bot",
    },
  },
  { timestamps: true, collection: "bills" },
);

billSchema.index({ userId: 1, month: 1, year: 1 });
billSchema.index({ month: 1, year: 1 });
billSchema.index({ "category.code": 1 });
billSchema.index({ isPaid: 1, dueDate: 1 });

export type BillCategoryRef = InferSchemaType<typeof billCategorySchema>;
export type Bill = InferSchemaType<typeof billSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type { BillPlain } from "@/lib/types";

export const BillModel: Model<Bill> =
  (mongoose.models.Bill as Model<Bill>) ??
  mongoose.model<Bill>("Bill", billSchema);
