import { excelResponse, workbookBuffer } from "@/lib/excel/workbook";
import { buildUsersWorkbook } from "@/lib/excel/users";

export async function GET() {
  const workbook = await buildUsersWorkbook([], true);
  return excelResponse(await workbookBuffer(workbook), "mau-thanh-vien.xlsx");
}
