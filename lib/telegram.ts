/**
 * Gửi thông báo sang Telegram bằng chính bot đang dùng.
 *
 * Cần `BOT_TOKEN` và `TELEGRAM_CHAT_ID` trong `.env`. Nếu chưa cấu hình thì mọi
 * hàm ở đây trả về `false` và không làm gì — các tính năng khác vẫn chạy bình
 * thường, chỉ mất phần thông báo.
 */
export function isTelegramConfigured() {
  return Boolean(process.env.BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/** Escape ký tự đặc biệt của Markdown legacy mà Telegram dùng. */
export function escapeMarkdown(text: string) {
  return text.replace(/([_*`[\]])/g, "\\$1");
}

export async function sendTelegramMessage(
  text: string,
  { chatId }: { chatId?: string | number } = {},
) {
  const token = process.env.BOT_TOKEN;
  const target = chatId ?? process.env.TELEGRAM_CHAT_ID;

  if (!token || !target) return false;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: target,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
        cache: "no-store",
      },
    );

    return response.ok;
  } catch (error) {
    // Thông báo thất bại không được làm hỏng nghiệp vụ chính.
    console.error("Không gửi được tin nhắn Telegram:", error);
    return false;
  }
}
