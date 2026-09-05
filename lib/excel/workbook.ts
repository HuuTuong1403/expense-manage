import ExcelJS from "exceljs";

export const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF00685F" },
};

export const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  name: "Calibri",
  size: 11,
};

export type ColumnDef = {
  header: string;
  key: string;
  width: number;
  hint?: string;
  numFmt?: string;
};

export function createWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Chi Tieu";
  workbook.created = new Date();
  return workbook;
}

export function styleHeader(sheet: ExcelJS.Worksheet, columns: ColumnDef[]) {
  sheet.columns = columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width,
  }));

  const header = sheet.getRow(1);
  header.height = 22;
  header.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };
}

export function addHintRow(sheet: ExcelJS.Worksheet, columns: ColumnDef[]) {
  const hints = columns.map((column) => column.hint ?? "");
  if (!hints.some(Boolean)) return;
  const row = sheet.insertRow(2, hints);
  row.font = { italic: true, color: { argb: "FF6D7A77" }, size: 9 };
  row.height = 18;
}

export function addLookupSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  values: string[],
) {
  const sheet = workbook.addWorksheet(name, { state: "hidden" });
  values.forEach((value, index) => {
    sheet.getCell(index + 1, 1).value = value;
  });
  return `'${name}'!$A$1:$A$${Math.max(1, values.length)}`;
}

export function applyListValidation(
  sheet: ExcelJS.Worksheet,
  columnIndex: number,
  formula: string,
  startRow = 2,
  endRow = 200,
) {
  for (let row = startRow; row <= endRow; row += 1) {
    sheet.getCell(row, columnIndex).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [formula],
      showErrorMessage: true,
      errorTitle: "Giá trị không hợp lệ",
      error: "Chọn một giá trị trong danh sách.",
    };
  }
}

export async function workbookBuffer(workbook: ExcelJS.Workbook) {
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function excelResponse(buffer: Buffer, filename: string) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export function parseExcelDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number") {
    return excelSerialToDate(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(trimmed);
    if (dmy) {
      return new Date(Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])));
    }
    const iso = new Date(trimmed);
    if (!Number.isNaN(iso.getTime())) return iso;
  }
  return null;
}

function excelSerialToDate(serial: number) {
  const utc = Math.round((serial - 25569) * 86400 * 1000);
  return new Date(utc);
}

export function cellString(value: unknown) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "text" in value) {
    return String((value as { text: string }).text).trim();
  }
  return String(value).trim();
}

export function cellNumber(value: unknown) {
  if (typeof value === "number") return value;
  const raw = cellString(value).replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : NaN;
}
