import type { z } from "zod";

export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export const IDLE_STATE: ActionState = { status: "idle" };

export function successState(message: string): ActionState {
  return { status: "success", message };
}

export function errorState(
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionState {
  return { status: "error", message, fieldErrors };
}

/** Chuyển lỗi zod thành `fieldErrors` để form hiển thị dưới từng ô. */
export function zodErrorState(error: z.ZodError): ActionState {
  const fieldErrors: Record<string, string[]> = {};
  let firstError = "";

  for (const issue of error.issues) {
    if (!firstError) firstError = issue.message;
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_form";
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }

  return errorState(firstError || "Dữ liệu không hợp lệ", fieldErrors);
}

/** Bọc action để lỗi ngoài dự kiến hiện thành thông báo thay vì crash trang. */
export async function runAction(
  handler: () => Promise<ActionState>,
): Promise<ActionState> {
  try {
    return await handler();
  } catch (error) {
    console.error("Server action thất bại:", error);
    const message =
      error instanceof Error ? error.message : "Có lỗi xảy ra, thử lại sau.";
    return errorState(message);
  }
}
