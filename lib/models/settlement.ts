import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const transferSchema = new Schema(
  {
    fromUserId: { type: Number, required: true },
    fromName: { type: String, required: true },
    toUserId: { type: Number, required: true },
    toName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    /** Nội dung chuyển khoản không dấu để Napas nhận được. */
    note: { type: String, default: "" },
    status: { type: String, enum: ["pending", "settled"], default: "pending" },
    settledAt: { type: Date, default: null },
  },
  { _id: false },
);

/**
 * Một phiên đối soát của một kỳ. Ghi lại các khoản đã chuyển để lần đối soát
 * sau không tính lặp.
 */
const settlementSchema = new Schema(
  {
    /** Ví dụ `SETTLE-2026-09`. */
    sessionCode: { type: String, required: true, unique: true, index: true },
    month: { type: Number, default: null },
    year: { type: Number, default: null },
    method: { type: String, enum: ["equal", "weighted"], default: "equal" },
    totalAmount: { type: Number, default: 0 },
    perMemberAmount: { type: Number, default: 0 },
    memberCount: { type: Number, default: 0 },
    transfers: { type: [transferSchema], default: [] },
    createdBy: { type: Number, default: null },
    createdByName: { type: String, default: null },
  },
  { timestamps: true, collection: "settlements" },
);

export type SettlementTransfer = InferSchemaType<typeof transferSchema>;
export type Settlement = InferSchemaType<typeof settlementSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export function settlementSessionCode(
  month: number | null,
  year: number | null,
  method: string,
  range?: { from?: string | null; to?: string | null },
) {
  if (range?.from || range?.to) {
    return `SETTLE-${range.from ?? "open"}-${range.to ?? "open"}-${method.toUpperCase()}`;
  }
  const period =
    month && year ? `${year}-${String(month).padStart(2, "0")}` : "ALL";
  return `SETTLE-${period}-${method.toUpperCase()}`;
}

export const SettlementModel: Model<Settlement> =
  (mongoose.models.Settlement as Model<Settlement>) ??
  mongoose.model<Settlement>("Settlement", settlementSchema);
