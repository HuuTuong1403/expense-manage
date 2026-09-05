import { revalidatePath } from "next/cache";

/**
 * Mọi thay đổi hóa đơn đều ảnh hưởng tới nhiều trang cùng lúc (bảng, dashboard,
 * ngân sách, đối soát) nên làm mới chung một chỗ.
 *
 * Chỉ import từ Server Action / Route Handler — không kéo vào Client Component.
 */
export function revalidateExpenseViews() {
  for (const path of [
    "/dashboard",
    "/bills",
    "/categories",
    "/users",
    "/balance",
    "/budget",
    "/reports",
    "/settings",
  ]) {
    revalidatePath(path);
  }
}
