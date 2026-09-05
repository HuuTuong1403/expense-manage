import type { CategoryPlain } from "@/lib/models";
import {
  addHintRow,
  createWorkbook,
  styleHeader,
  type ColumnDef,
} from "@/lib/excel/workbook";

export const CATEGORY_COLUMNS: ColumnDef[] = [
  { header: "Mã", key: "code", width: 16, hint: "slug, không dấu, bắt buộc khi tạo" },
  { header: "Tên", key: "name", width: 24, hint: "Bắt buộc" },
  { header: "Icon", key: "icon", width: 10 },
  { header: "Định mức tháng", key: "monthlyBudget", width: 16, numFmt: "#,##0" },
  { header: "Từ khóa", key: "keywords", width: 32, hint: "Cách nhau bởi dấu phẩy" },
  { header: "Nhóm", key: "group", width: 16, hint: "sinhhoat / linhhoat / tietkiem" },
  { header: "Mô tả", key: "description", width: 28 },
];

export async function buildCategoriesWorkbook(
  categories: CategoryPlain[],
  template?: boolean,
) {
  const workbook = createWorkbook();
  const sheet = workbook.addWorksheet("Data");
  styleHeader(sheet, CATEGORY_COLUMNS);
  addHintRow(sheet, CATEGORY_COLUMNS);

  const rows = template
    ? [
        {
          code: "anuong",
          name: "Ăn uống",
          icon: "🍜",
          monthlyBudget: 3000000,
          keywords: "cafe, cơm, quán",
          group: "linhhoat",
          description: "Đi chợ, ăn ngoài",
        },
      ]
    : categories.map((category) => ({
        code: category.code,
        name: category.name,
        icon: category.icon,
        monthlyBudget: category.monthlyBudget,
        keywords: category.keywords.join(", "),
        group: category.group ?? "",
        description: category.description,
      }));

  for (const row of rows) {
    const added = sheet.addRow(row);
    added.getCell("monthlyBudget").numFmt = "#,##0";
  }

  return workbook;
}
