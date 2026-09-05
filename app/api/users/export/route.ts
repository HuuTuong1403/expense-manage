import { excelResponse, workbookBuffer } from "@/lib/excel/workbook";
import { buildUsersWorkbook } from "@/lib/excel/users";
import { listUsers } from "@/lib/repositories/users";

export async function GET() {
  const users = await listUsers();
  const workbook = await buildUsersWorkbook(users);
  return excelResponse(await workbookBuffer(workbook), "thanh-vien.xlsx");
}
