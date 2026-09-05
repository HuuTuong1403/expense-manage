import { excelResponse, workbookBuffer } from "@/lib/excel/workbook";
import { billExportFilename, buildBillsWorkbook } from "@/lib/excel/bills";
import { listBills, type BillFilters } from "@/lib/repositories/bills";
import { listCategories } from "@/lib/repositories/categories";
import { listActiveUsers } from "@/lib/repositories/users";
import {
  readNumberParam,
  readPeriod,
  readStringParam,
} from "@/lib/period";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const filters: BillFilters = {
    period: readPeriod(params),
    categoryCode: readStringParam(params, "category"),
    userId: readNumberParam(params, "user"),
    status: (readStringParam(params, "status") as BillFilters["status"]) ?? "all",
    search: readStringParam(params, "q"),
  };

  const [list, categories, members] = await Promise.all([
    listBills(filters, 1, 10_000),
    listCategories(),
    listActiveUsers(),
  ]);

  const workbook = await buildBillsWorkbook({
    bills: list.items,
    categoryCodes: categories.map((item) => item.code),
    memberKeys: members.map((item) => item.username || String(item.telegramId)),
  });

  return excelResponse(
    await workbookBuffer(workbook),
    billExportFilename(filters.period.month, filters.period.year),
  );
}
