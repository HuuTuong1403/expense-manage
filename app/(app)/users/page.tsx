import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui-m3/icon";
import { Money } from "@/components/ui-m3/money";
import { StatCard } from "@/components/ui-m3/stat-card";
import { SurfaceCard } from "@/components/ui-m3/surface-card";
import { PageHeader } from "@/components/ui-m3/page-header";
import { EmptyState } from "@/components/ui-m3/empty-state";
import { MemberAvatar } from "@/components/ui-m3/member-avatar";
import { ActionButton } from "@/components/ui-m3/action-button";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { ExportMenu } from "@/components/excel/export-menu";
import { ImportDialog } from "@/components/excel/import-dialog";
import { listUsersWithSpend } from "@/lib/repositories/users";
import { deactivateUserAction } from "@/app/(app)/users/actions";
import { readPeriod } from "@/lib/period";
import { formatDate, formatPeriodLabel } from "@/lib/format";
import { bankLabel } from "@/lib/banks";
import { cn } from "@/lib/utils";

export default async function UsersPage({
  searchParams,
}: PageProps<"/users">) {
  const params = await searchParams;
  const period = readPeriod(params);
  const members = await listUsersWithSpend(period);
  const active = members.filter((item) => item.isActive);
  const top = members[0];

  return (
    <div className="flex flex-col gap-gutter-lg">
      <PageHeader
        eyebrow="Dữ liệu"
        title="Thành viên"
        description="Quản lý người tham gia chi tiêu, trọng số chia tiền và tài khoản VietQR."
        actions={
          <>
            <ExportMenu
              exportHref="/api/users/export"
              templateHref="/api/users/template"
            />
            <ImportDialog entity="users" />
            <UserFormDialog mode="create">
              <Button size="md">
                <Icon name="add_circle" size={18} />
                Thêm thành viên
              </Button>
            </UserFormDialog>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-gutter-md sm:grid-cols-3">
        <StatCard
          label="Thành viên"
          icon="group"
          value={members.length}
          valueUnit="người"
          footer={`${active.length} đang hoạt động`}
        />
        <StatCard
          label={`Tổng chi ${formatPeriodLabel(period)}`}
          icon="payments"
          amount={members.reduce((sum, item) => sum + item.spent, 0)}
        />
        <StatCard
          label="Chi nhiều nhất"
          icon="trending_up"
          value={top?.name ?? "—"}
          footer={top ? <Money value={top.spent} size="sm" /> : "Chưa có dữ liệu"}
        />
      </div>

      <SurfaceCard className="overflow-hidden p-0">
        {members.length === 0 ? (
          <EmptyState
            icon="group"
            title="Chưa có thành viên"
            description="Thêm thành viên hoặc đợi họ /start trên Telegram."
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-surface-low text-code tracking-wider text-outline uppercase">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Thành viên</th>
                    <th className="px-3 py-2.5 font-semibold">telegramId</th>
                    <th className="px-3 py-2.5 font-semibold">Vai trò</th>
                    <th className="px-3 py-2.5 font-semibold">Trọng số</th>
                    <th className="px-3 py-2.5 font-semibold">Ngân hàng</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Chi kỳ này</th>
                    <th className="px-3 py-2.5 font-semibold">Hoạt động cuối</th>
                    <th className="w-24 px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-high/40">
                  {members.map((member) => (
                    <tr
                      key={member.telegramId}
                      className={cn(!member.isActive && "opacity-60")}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <MemberAvatar
                            name={member.name}
                            id={member.telegramId}
                            size={32}
                          />
                          <div>
                            <p className="font-semibold">{member.name}</p>
                            <p className="font-mono text-code text-outline">
                              {member.username ? `@${member.username}` : "—"}
                            </p>
                          </div>
                          {!member.isActive ? (
                            <Badge variant="secondary">Đã tắt</Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-code">
                        {member.telegramId}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={member.role === "admin" ? "accent" : "secondary"}>
                          {member.role === "admin" ? "Admin" : "Member"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 font-mono">{member.weight}</td>
                      <td className="px-3 py-2.5 text-body-sm">
                        {member.accountNumber
                          ? `${bankLabel(member.bankBin, member.bankShortName)} · ${member.accountNumber}`
                          : "Chưa có"}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Money value={member.spent} size="sm" />
                      </td>
                      <td className="px-3 py-2.5 text-body-sm text-outline">
                        {member.lastActivity ? formatDate(member.lastActivity) : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-end gap-1">
                          <UserFormDialog mode="edit" user={member}>
                            <Button variant="ghost" size="icon-xs" aria-label="Sửa">
                              <Icon name="edit" size={16} />
                            </Button>
                          </UserFormDialog>
                          {member.isActive ? (
                            <ActionButton
                              action={deactivateUserAction.bind(null, member.telegramId)}
                              confirm={`Tắt ${member.name}? Hóa đơn cũ vẫn giữ.`}
                              variant="ghost"
                              size="icon-xs"
                            >
                              <Icon name="close" size={16} />
                            </ActionButton>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="flex flex-col gap-2 p-3 md:hidden">
              {members.map((member) => (
                <li
                  key={member.telegramId}
                  className={cn(
                    "flex items-center justify-between rounded-lg bg-surface-low p-3",
                    !member.isActive && "opacity-60",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MemberAvatar name={member.name} id={member.telegramId} size={36} />
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="font-mono text-code text-outline">
                        {member.username ? `@${member.username}` : member.telegramId}
                      </p>
                    </div>
                  </div>
                  <Money value={member.spent} size="sm" />
                </li>
              ))}
            </ul>
          </>
        )}
      </SurfaceCard>
    </div>
  );
}
