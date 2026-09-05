import { z } from "zod";

/** Ô nhập số tiền cho phép gõ dấu phân cách nghìn: "1.250.000". */
const amountSchema = z
  .string()
  .trim()
  .min(1, "Nhập số tiền")
  .transform((value) => Number(value.replace(/[.,\s]/g, "")))
  .refine((value) => Number.isFinite(value) && value > 0, {
    message: "Số tiền phải là số dương",
  });

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ");

const optionalDateSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Ngày không hợp lệ",
  });

export const billFormSchema = z.object({
  amount: amountSchema,
  categoryCode: z.string().trim().min(1, "Chọn danh mục"),
  date: dateSchema,
  description: z.string().trim().max(300, "Mô tả quá dài").default(""),
  userId: z.coerce.number().int().refine((value) => value !== 0, {
    message: "Chọn người trả",
  }),
  isPaid: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) => value === "on" || value === "true" || value === true),
  dueDate: optionalDateSchema.optional().default(null),
  paymentMethod: z.string().trim().default(""),
  note: z.string().trim().max(500).default(""),
  type: z.enum(["expense", "income"]).default("expense"),
});

export type BillFormInput = z.input<typeof billFormSchema>;
export type BillFormValues = z.output<typeof billFormSchema>;

export const PAYMENT_METHODS = [
  { value: "", label: "Không ghi rõ" },
  { value: "cash", label: "Tiền mặt" },
  { value: "bank", label: "Chuyển khoản" },
  { value: "card", label: "Thẻ" },
  { value: "ewallet", label: "Ví điện tử" },
] as const;

export function paymentMethodLabel(value?: string | null) {
  return (
    PAYMENT_METHODS.find((item) => item.value === (value ?? ""))?.label ??
    "Không ghi rõ"
  );
}
