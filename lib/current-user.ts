import { connectDb } from "@/lib/db";
import { UserModel, resolveUserName } from "@/lib/models";
import type { ShellUser } from "@/components/layout/sidebar-user-card";

/**
 * "Người dùng hiện tại" của app.
 *
 * Chưa có đăng nhập nên tạm lấy thành viên admin đang hoạt động, hoặc thành viên
 * tham gia sớm nhất. Mọi chỗ gọi đều đi qua đây để khi thêm session sau này chỉ
 * cần sửa đúng hàm này.
 */
export async function getCurrentUser(): Promise<ShellUser | null> {
  await connectDb();

  const user =
    (await UserModel.findOne({ isActive: { $ne: false }, role: "admin" })
      .sort({ joinedAt: 1 })
      .lean()
      .exec()) ??
    (await UserModel.findOne({ isActive: { $ne: false } })
      .sort({ joinedAt: 1 })
      .lean()
      .exec());

  if (!user) return null;

  return {
    telegramId: user.telegramId,
    name: resolveUserName(user),
    username: user.username ?? null,
  };
}
