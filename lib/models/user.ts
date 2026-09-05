import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    telegramId: { type: Number, required: true, unique: true, index: true },
    username: { type: String, default: null },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    joinedAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 },

    /* ------------------------- Field mở rộng cho web ------------------------ */
    displayName: { type: String, default: null },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    isActive: { type: Boolean, default: true },
    /** Trọng số khi đối soát theo tỉ lệ; 1 nghĩa là chia đều. */
    weight: { type: Number, default: 1, min: 0 },
    /** Tông màu avatar, giữ cố định để một người luôn cùng màu. */
    tone: { type: String, default: null },

    /* --------------------- Thông tin ngân hàng cho VietQR -------------------- */
    bankBin: { type: String, default: null },
    bankShortName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    accountName: { type: String, default: null },
  },
  { timestamps: true, collection: "users" },
);

export type User = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export { resolveUserName, type UserPlain } from "@/lib/types";

export const UserModel: Model<User> =
  (mongoose.models.User as Model<User>) ??
  mongoose.model<User>("User", userSchema);
