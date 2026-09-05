import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export {
  CATEGORY_GROUPS,
  categoryGroupLabel,
  type CategoryGroup,
  type CategoryPlain,
} from "@/lib/types";

const categorySchema = new Schema(
  {
    /** Mã người dùng gõ trong Telegram — không cho sửa sau khi tạo. */
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "📦" },
    description: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },

    /* ------------------------- Field mở rộng cho web ------------------------ */
    /** Hạn mức mặc định hàng tháng; `Budget` có thể ghi đè theo từng tháng. */
    monthlyBudget: { type: Number, default: 0 },
    /** Từ khóa để bot tự phân loại tin nhắn vào danh mục này. */
    keywords: { type: [String], default: [] },
    group: { type: String, default: null },
    /** `telegramId` của người phụ trách, hoặc `shared` khi chia đều. */
    defaultAssignee: { type: String, default: null },
    /** Nhãn ngữ cảnh ngắn hiện dưới tên trên card, ví dụ "Cần kiểm soát". */
    contextLabel: { type: String, default: "" },
    color: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "categories" },
);

export type Category = InferSchemaType<typeof categorySchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const CategoryModel: Model<Category> =
  (mongoose.models.Category as Model<Category>) ??
  mongoose.model<Category>("Category", categorySchema);
