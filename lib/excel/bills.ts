import type { BillPlain } from "@/lib/models";
import { formatDate } from "@/lib/format";
import {
  addHintRow,
  addLookupSheet,
  applyListValidation,
  createWorkbook,
  styleHeader,
  type ColumnDef,
} from "@/lib/excel/workbook";

export const BILL_COLUMNS: ColumnDef[] = [
  { header: "Mã", key: "code", width: 12, hint: "Để trống khi nhập mới" },
  {
    header: "Ngày",
    key: "date",
    width: 14,
    hint: "dd/mm/yyyy",
    numFmt: "dd/mm/yyyy",
  },
  { header: "Mã danh mục", key: "categoryCode", width: 16, hint: "Bắt buộc" },
  { header: "Tên danh mục", key: "categoryName", width: 18 },
  {
    header: "Số tiền",
    key: "amount",
    width: 14,
    hint: "Số dương, không dấu ₫",
    numFmt: "#,##0",
  },
  { header: "Mô tả", key: "description", width: 32 },
  { header: "Username / telegramId", key: "payer", width: 22, hint: "Bắt buộc" },
  { header: "Trạng thái", key: "status", width: 16, hint: "Đã thanh toán / Chưa thanh toán" },
  { header: "Hạn thanh toán", key: "dueDate", width: 16, hint: "dd/mm/yyyy" },
  { header: "Phương thức", key: "paymentMethod", width: 14 },
];

export async function buildBillsWorkbook({
  bills,
  categoryCodes,
  memberKeys,
  template,
}: {
  bills: BillPlain[];
  categoryCodes: string[];
  memberKeys: string[];
  template?: boolean;
}) {
  const workbook = createWorkbook();
  const sheet = workbook.addWorksheet("Data");
  styleHeader(sheet, BILL_COLUMNS);
  addHintRow(sheet, BILL_COLUMNS);

  const rows = template
    ? [
        {
          code: "",
          date: new Date(),
          categoryCode: categoryCodes[0] ?? "anuong",
          categoryName: "",
          amount: 150000,
          description: "Ví dụ: ăn trưa",
          payer: memberKeys[0] ?? "",
          status: "Chưa thanh toán",
          dueDate: "",
          paymentMethod: "",
        },
      ]
    : bills.map((bill) => ({
        code: bill.code,
        date: new Date(bill.date),
        categoryCode: bill.category.code,
        categoryName: bill.category.name,
        amount: bill.amount,
        description: bill.description,
        payer: bill.username || String(bill.userId),
        status: bill.isPaid ? "Đã thanh toán" : "Chưa thanh toán",
        dueDate: bill.dueDate ? new Date(bill.dueDate) : "",
        paymentMethod: bill.paymentMethod ?? "",
      }));

  for (const row of rows) {
    const added = sheet.addRow(row);
    added.getCell("date").numFmt = "dd/mm/yyyy";
    added.getCell("amount").numFmt = "#,##0";
    if (row.dueDate instanceof Date) {
      added.getCell("dueDate").numFmt = "dd/mm/yyyy";
    }
  }

  if (!template && bills.length > 0) {
    const total = sheet.addRow({
      code: "",
      date: "",
      categoryCode: "",
      categoryName: "Tổng cộng",
      amount: bills.reduce((sum, bill) => sum + bill.amount, 0),
      description: "",
      payer: "",
      status: "",
      dueDate: "",
      paymentMethod: "",
    });
    total.font = { bold: true };
    total.getCell("amount").numFmt = "#,##0";
  }

  const catRange = addLookupSheet(workbook, "DanhMuc", categoryCodes);
  const memberRange = addLookupSheet(workbook, "ThanhVien", memberKeys);
  applyListValidation(sheet, 3, catRange, 3);
  applyListValidation(sheet, 7, memberRange, 3);
  applyListValidation(
    sheet,
    8,
    '"Đã thanh toán,Chưa thanh toán"',
    3,
  );

  return workbook;
}

export function billExportFilename(month: number | null, year: number | null) {
  if (!month || !year) return "chi-tieu-tat-ca.xlsx";
  return `chi-tieu-${month}-${year}.xlsx`;
}

export function formatBillDateCell(date: Date) {
  return formatDate(date);
}
