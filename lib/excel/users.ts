import type { UserPlain } from "@/lib/models";
import {
  addHintRow,
  createWorkbook,
  styleHeader,
  type ColumnDef,
} from "@/lib/excel/workbook";

export const USER_COLUMNS: ColumnDef[] = [
  { header: "telegramId", key: "telegramId", width: 16, hint: "Bắt buộc, số" },
  { header: "Username", key: "username", width: 16 },
  { header: "Tên hiển thị", key: "displayName", width: 20 },
  { header: "Họ", key: "lastName", width: 14 },
  { header: "Tên", key: "firstName", width: 14 },
  { header: "Vai trò", key: "role", width: 12, hint: "admin / member" },
  { header: "Trọng số", key: "weight", width: 12 },
  { header: "BIN ngân hàng", key: "bankBin", width: 14 },
  { header: "Ngân hàng", key: "bankShortName", width: 14 },
  { header: "Số TK", key: "accountNumber", width: 18 },
  { header: "Chủ TK", key: "accountName", width: 22 },
  { header: "Hoạt động", key: "isActive", width: 12, hint: "Có / Không" },
];

export async function buildUsersWorkbook(
  users: UserPlain[],
  template?: boolean,
) {
  const workbook = createWorkbook();
  const sheet = workbook.addWorksheet("Data");
  styleHeader(sheet, USER_COLUMNS);
  addHintRow(sheet, USER_COLUMNS);

  const rows = template
    ? [
        {
          telegramId: 123456789,
          username: "username",
          displayName: "Nguyễn Văn A",
          lastName: "Nguyễn",
          firstName: "Văn A",
          role: "member",
          weight: 1,
          bankBin: "970422",
          bankShortName: "MB",
          accountNumber: "0123456789",
          accountName: "NGUYEN VAN A",
          isActive: "Có",
        },
      ]
    : users.map((user) => ({
        telegramId: user.telegramId,
        username: user.username ?? "",
        displayName: user.displayName ?? user.name,
        lastName: user.lastName ?? "",
        firstName: user.firstName ?? "",
        role: user.role,
        weight: user.weight,
        bankBin: user.bankBin ?? "",
        bankShortName: user.bankShortName ?? "",
        accountNumber: user.accountNumber ?? "",
        accountName: user.accountName ?? "",
        isActive: user.isActive ? "Có" : "Không",
      }));

  for (const row of rows) sheet.addRow(row);
  return workbook;
}
