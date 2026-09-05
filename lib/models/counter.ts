import "server-only";
import mongoose, { Schema, type Model } from "mongoose";
import { BillModel } from "@/lib/models/bill";

type CounterDoc = { _id: string; seq: number };

const counterSchema = new Schema<CounterDoc>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { collection: "counters", versionKey: false },
);

export const CounterModel: Model<CounterDoc> =
  (mongoose.models.Counter as Model<CounterDoc>) ??
  mongoose.model<CounterDoc>("Counter", counterSchema);

const BILL_COUNTER_ID = "bill";

/** Số lớn nhất đang có trong các mã `bill<N>` — logic gốc của bot. */
async function maxBillNumber() {
  const bills = await BillModel.find({ code: /^bill\d+$/ }, { code: 1 })
    .lean()
    .exec();

  return bills.reduce((max, bill) => {
    const match = /^bill(\d+)$/.exec(bill.code ?? "");
    const value = match ? Number(match[1]) : 0;
    return value > max ? value : max;
  }, 0);
}

async function seedCounterFromBills() {
  const max = await maxBillNumber();
  await CounterModel.updateOne(
    { _id: BILL_COUNTER_ID },
    { $max: { seq: max } },
    { upsert: true },
  );
}

/**
 * Cấp phát một khối mã `bill<N>` liên tiếp.
 *
 * Bot vẫn tự sinh mã bằng cách quét max của cả collection, nên counter có thể bị
 * tụt lại. Vì vậy sau khi cấp phát ta kiểm tra trùng; nếu có thì đẩy counter lên
 * bằng max thực tế rồi cấp lại. Cách này giữ cho bot chạy y như cũ mà web import
 * hàng loạt vẫn nhanh.
 */
export async function allocateBillCodes(count: number): Promise<string[]> {
  if (count <= 0) return [];

  const existing = await CounterModel.findById(BILL_COUNTER_ID).lean().exec();
  if (!existing) await seedCounterFromBills();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const updated = await CounterModel.findOneAndUpdate(
      { _id: BILL_COUNTER_ID },
      { $inc: { seq: count } },
      { new: true, upsert: true },
    )
      .lean()
      .exec();

    const end = updated?.seq ?? count;
    const codes = Array.from(
      { length: count },
      (_, index) => `bill${end - count + index + 1}`,
    );

    const clash = await BillModel.exists({ code: { $in: codes } });
    if (!clash) return codes;

    await seedCounterFromBills();
  }

  throw new Error(
    "Không cấp phát được mã hóa đơn mới. Thử lại sau ít giây.",
  );
}

export async function allocateBillCode() {
  const [code] = await allocateBillCodes(1);
  return code!;
}
