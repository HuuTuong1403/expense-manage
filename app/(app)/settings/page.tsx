import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui-m3/icon";
import { Money } from "@/components/ui-m3/money";
import { SurfaceCard } from "@/components/ui-m3/surface-card";
import { PageHeader } from "@/components/ui-m3/page-header";
import { EmptyState } from "@/components/ui-m3/empty-state";
import { ActionButton } from "@/components/ui-m3/action-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { RecurringForm } from "@/components/settings/recurring-form";
import {
  deleteRecurringAction,
  generateRecurringThisMonthAction,
  testTelegramAction,
  toggleRecurringAction,
} from "@/app/(app)/settings/actions";
import { connectDb } from "@/lib/db";
import { RecurringBillModel } from "@/lib/models";
import { listCategories } from "@/lib/repositories/categories";
import { listActiveUsers } from "@/lib/repositories/users";
import { isTelegramConfigured } from "@/lib/telegram";

export default async function SettingsPage() {
  await connectDb();
  const [templates, categories, members] = await Promise.all([
    RecurringBillModel.find().sort({ name: 1 }).lean(),
    listCategories(),
    listActiveUsers(),
  ]);
  const telegramOk = isTelegramConfigured();

  return (
    <div className="flex flex-col gap-gutter-lg">
      <PageHeader
        eyebrow="Hệ thống"
        title="Cài đặt"
        description="Hóa đơn định kỳ, thông báo Telegram và giao diện."
      />

      <section className="grid grid-cols-1 gap-gutter-lg lg:grid-cols-2">
        <SurfaceCard>
          <h2 className="text-headline-sm">Hóa đơn định kỳ</h2>
          <p className="mb-4 text-body-sm text-on-surface-variant">
            Sinh tự động tiền nhà, điện, nước… cho tháng hiện tại.
          </p>
          <RecurringForm categories={categories} members={members} />
          <div className="mt-4">
            <ActionButton action={generateRecurringThisMonthAction} size="md">
              <Icon name="auto_mode" size={18} />
              Sinh hóa đơn tháng này
            </ActionButton>
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {templates.length === 0 ? (
              <EmptyState
                icon="event"
                title="Chưa có mẫu nào"
                description="Thêm tiền nhà hoặc hóa đơn cố định ở form bên trên."
              />
            ) : (
              templates.map((item) => (
                <li
                  key={String(item._id)}
                  className="flex items-center justify-between gap-2 rounded-lg bg-surface-low p-3"
                >
                  <div>
                    <p className="font-semibold">
                      {item.categoryIcon} {item.name}
                    </p>
                    <p className="text-body-sm text-outline">
                      Ngày {item.dayOfMonth} hàng tháng · {item.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Money value={item.amount} size="sm" />
                    <ActionButton
                      action={toggleRecurringAction.bind(
                        null,
                        String(item._id),
                        !item.isActive,
                      )}
                      variant="ghost"
                      size="icon-xs"
                    >
                      <Icon name={item.isActive ? "check_circle" : "schedule"} size={16} />
                    </ActionButton>
                    <ActionButton
                      action={deleteRecurringAction.bind(null, String(item._id))}
                      confirm="Xóa mẫu định kỳ này?"
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive"
                    >
                      <Icon name="delete" size={16} />
                    </ActionButton>
                  </div>
                </li>
              ))
            )}
          </ul>
        </SurfaceCard>

        <div className="flex flex-col gap-gutter-lg">
          <SurfaceCard>
            <h2 className="text-headline-sm">Thông báo Telegram</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Web gửi tin khi thêm hóa đơn, nhắc hạn và tóm tắt đối soát. Cần
              `BOT_TOKEN` và `TELEGRAM_CHAT_ID` trong file `.env`.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant={telegramOk ? "income" : "warning"}>
                {telegramOk ? "Đã cấu hình" : "Chưa cấu hình"}
              </Badge>
            </div>
            <div className="mt-4">
              <ActionButton action={testTelegramAction} variant="subtle" size="md">
                <Icon name="send" size={18} />
                Gửi tin nhắn thử
              </ActionButton>
            </div>
            <p className="mt-3 text-body-sm text-outline">
              Job đối soát 23:00 chạy trong tiến trình bot Telegram
              (`jobs/daily-settlement.js`), không phải trên Next.js.
            </p>
          </SurfaceCard>

          <SurfaceCard>
            <h2 className="text-headline-sm">Giao diện</h2>
            <p className="mt-1 mb-3 text-body-sm text-on-surface-variant">
              Sáng, tối hoặc theo hệ thống. Số tiền luôn theo `vi-VN`.
            </p>
            <ThemeToggle />
          </SurfaceCard>
        </div>
      </section>
    </div>
  );
}
