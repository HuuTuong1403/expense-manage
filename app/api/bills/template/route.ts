import { excelResponse, workbookBuffer } from "@/lib/excel/workbook";
import { buildBillsWorkbook } from "@/lib/excel/bills";
import { listCategories } from "@/lib/repositories/categories";
import { listActiveUsers } from "@/lib/repositories/users";

export async function GET() {
  const [categories, members] = await Promise.all([
    listCategories(),
    listActiveUsers(),
  ]);

  const workbook = await buildBillsWorkbook({
    bills: [],
    categoryCodes: categories.map((item) => item.code),
    memberKeys: members.map((item) => item.username || String(item.telegramId)),
    template: true,
  });

  return excelResponse(await workbookBuffer(workbook), "mau-hoa-don.xlsx");
}
