import Link from "next/link";
import { Icon } from "@/components/ui-m3/icon";
import { MemberAvatar } from "@/components/ui-m3/member-avatar";

export type ShellUser = {
  telegramId: number;
  name: string;
  username: string | null;
};

export function SidebarUserCard({ user }: { user: ShellUser | null }) {
  return (
    <div className="m-gutter-sm rounded-lg bg-surface-low p-gutter-sm">
      <div className="flex items-center justify-between gap-gutter-sm p-gutter-xs">
        <div className="flex min-w-0 items-center gap-gutter-sm">
          <MemberAvatar
            name={user?.name ?? "?"}
            id={user?.telegramId ?? 0}
            size={36}
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-headline-sm text-foreground">
              {user?.name ?? "Chưa có thành viên"}
            </span>
            <span className="truncate font-mono text-code text-outline">
              {user?.username ? `@${user.username}` : "Thêm ở trang Thành viên"}
            </span>
          </div>
        </div>
        <Link
          href="/settings"
          title="Cài đặt"
          aria-label="Cài đặt"
          className="rounded-md p-gutter-xs text-on-surface-variant transition-colors hover:bg-surface-high hover:text-foreground"
        >
          <Icon name="settings" size={20} />
        </Link>
      </div>
    </div>
  );
}
