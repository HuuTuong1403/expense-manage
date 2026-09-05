import { z } from "zod";

const budgetSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? 0 : Number(value.replace(/[.,\s]/g, ""))))
  .refine((value) => Number.isFinite(value) && value >= 0, {
    message: "Định mức phải là số không âm",
  });

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên danh mục").max(80, "Tên quá dài"),
  /** Mã bot dùng trong Telegram: chỉ chữ thường và số, không dấu. */
  code: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Mã cần ít nhất 2 ký tự")
    .max(24, "Mã quá dài")
    .regex(/^[a-z0-9]+$/, "Mã chỉ gồm chữ thường không dấu và số"),
  icon: z.string().trim().min(1, "Chọn biểu tượng").max(8),
  monthlyBudget: budgetSchema,
  /** Nhập cách nhau bởi dấu phẩy. */
  keywords: z
    .string()
    .trim()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  defaultAssignee: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value)),
  group: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value)),
  description: z.string().trim().max(200).default(""),
});

export type CategoryFormValues = z.output<typeof categoryFormSchema>;

/** Khi sửa thì mã đã cố định nên bỏ ra khỏi schema. */
export const categoryUpdateSchema = categoryFormSchema.omit({ code: true });
