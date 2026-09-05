import { excelResponse, workbookBuffer } from "@/lib/excel/workbook";
import { buildCategoriesWorkbook } from "@/lib/excel/categories";
import { listCategories } from "@/lib/repositories/categories";

export async function GET() {
  const categories = await listCategories();
  const workbook = await buildCategoriesWorkbook(categories);
  return excelResponse(await workbookBuffer(workbook), "danh-muc.xlsx");
}
