import { z } from "zod";

export const userFormSchema = z.object({
  telegramId: z.coerce.number().int().positive("telegramId phải là số dương"),
  username: z.string().trim().default(""),
  displayName: z.string().trim().min(1, "Nhập tên hiển thị"),
  firstName: z.string().trim().default(""),
  lastName: z.string().trim().default(""),
  role: z.enum(["admin", "member"]).default("member"),
  weight: z.coerce.number().min(0, "Trọng số không âm").default(1),
  bankBin: z.string().trim().default(""),
  bankShortName: z.string().trim().default(""),
  accountNumber: z.string().trim().default(""),
  accountName: z.string().trim().default(""),
  isActive: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) => value === "on" || value === "true" || value === true),
});

export type UserFormValues = z.output<typeof userFormSchema>;
