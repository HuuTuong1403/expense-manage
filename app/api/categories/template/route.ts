import { excelResponse, workbookBuffer } from "@/lib/excel/workbook";
import { buildCategoriesWorkbook } from "@/lib/excel/categories";

export async function GET() {
  const workbook = await buildCategoriesWorkbook([], true);
  return excelResponse(await workbookBuffer(workbook), "mau-danh-muc.xlsx");
}
