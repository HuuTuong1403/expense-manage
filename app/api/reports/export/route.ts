import { excelResponse, workbookBuffer, createWorkbook, styleHeader } from "@/lib/excel/workbook";
import { getBillSummary, getTotalsByCategory, listBills } from "@/lib/repositories/bills";
import { previousPeriod, readNumberParam, readPeriod } from "@/lib/period";
import { formatPeriodLabel } from "@/lib/format";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const periodA = readPeriod(params);
  const compareMonth = readNumberParam(params, "compareMonth");
  const compareYear = readNumberParam(params, "compareYear");
  const periodB =
    compareMonth && compareYear
      ? { month: compareMonth, year: compareYear, all: false }
      : previousPeriod(periodA);

  const [summaryA, catsA, catsB, bills] = await Promise.all([
    getBillSummary({ period: periodA }),
    getTotalsByCategory(periodA),
    getTotalsByCategory(periodB),
    listBills({ period: periodA }, 1, 10_000),
  ]);

  const workbook = createWorkbook();

  const summary = workbook.addWorksheet("Tổng hợp");
  styleHeader(summary, [
    { header: "Chỉ số", key: "label", width: 28 },
    { header: formatPeriodLabel(periodA), key: "a", width: 20 },
  ]);
  summary.addRow({ label: "Tổng chi", a: summaryA.totalAmount });
  summary.addRow({ label: "Số hóa đơn", a: summaryA.totalCount });
  summary.addRow({ label: "Đã trả", a: summaryA.paidAmount });
  summary.addRow({ label: "Chưa trả", a: summaryA.unpaidAmount });

  const byCat = workbook.addWorksheet("Theo danh mục");
  styleHeader(byCat, [
    { header: "Mã", key: "code", width: 14 },
    { header: "Tên", key: "name", width: 22 },
    { header: formatPeriodLabel(periodA), key: "a", width: 16 },
    { header: formatPeriodLabel(periodB), key: "b", width: 16 },
  ]);
  const lookupB = new Map(catsB.map((item) => [item.code, item.total]));
  for (const row of catsA) {
    byCat.addRow({
      code: row.code,
      name: row.name,
      a: row.total,
      b: lookupB.get(row.code) ?? 0,
    });
  }

  const detail = workbook.addWorksheet("Chi tiết");
  styleHeader(detail, [
    { header: "Mã", key: "code", width: 12 },
    { header: "Ngày", key: "date", width: 14 },
    { header: "Danh mục", key: "category", width: 18 },
    { header: "Số tiền", key: "amount", width: 14 },
    { header: "Mô tả", key: "description", width: 28 },
    { header: "Người trả", key: "user", width: 16 },
  ]);
  for (const bill of bills.items) {
    detail.addRow({
      code: bill.code,
      date: new Date(bill.date),
      category: bill.category.name,
      amount: bill.amount,
      description: bill.description,
      user: bill.username,
    });
  }

  return excelResponse(
    await workbookBuffer(workbook),
    `bao-cao-${periodA.month ?? "all"}-${periodA.year ?? ""}.xlsx`,
  );
}
