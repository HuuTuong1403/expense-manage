import ExcelJS from "exceljs";
import { cellNumber, cellString, parseExcelDate } from "@/lib/excel/workbook";

export type ImportRowError = {
  row: number;
  message: string;
};

export async function readFirstSheet(buffer: ArrayBuffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("File không có sheet nào");
  return sheet;
}

/** Đọc sheet Data: hàng 1 là header, bỏ hàng hint nếu ô A2 không khớp header. */
export function sheetToObjects(sheet: ExcelJS.Worksheet) {
  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell, col) => {
    headers[col] = cellString(cell.value);
  });

  const objects: { row: number; values: Record<string, unknown> }[] = [];
  const start = looksLikeHintRow(sheet.getRow(2), headers) ? 3 : 2;

  sheet.eachRow((row, number) => {
    if (number < start) return;
    const values: Record<string, unknown> = {};
    let empty = true;
    headers.forEach((header, col) => {
      if (!header) return;
      const value = row.getCell(col).value;
      if (value != null && cellString(value) !== "") empty = false;
      values[header] = value;
    });
    if (!empty) objects.push({ row: number, values });
  });

  return objects;
}

function looksLikeHintRow(row: ExcelJS.Row, headers: string[]) {
  const first = cellString(row.getCell(1).value).toLowerCase();
  const header = (headers[1] ?? "").toLowerCase();
  if (!first) return true;
  return first !== header && /trống|bắt buộc|dd\/mm|slug|ví dụ/.test(first);
}

export function pick(values: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (key in values && values[key] != null && cellString(values[key]) !== "") {
      return values[key];
    }
  }
  return undefined;
}

export { cellNumber, cellString, parseExcelDate };
