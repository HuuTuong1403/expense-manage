import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui-m3/icon";
import { Money } from "@/components/ui-m3/money";
import { SurfaceCard, SectionCard } from "@/components/ui-m3/surface-card";
import { EmptyState } from "@/components/ui-m3/empty-state";
import { Segmented } from "@/components/ui-m3/segmented";
import { DivergingBalanceBars } from "@/components/charts/diverging-balance-bars";
import { SettlementCard } from "@/components/balance/settlement-card";
import { NotifyBalanceButton } from "@/components/balance/notify-button";
import { computeBalance, type SettlementMethod } from "@/lib/repositories/balance";
import { readStringParam, type Period } from "@/lib/period";
import { formatDate } from "@/lib/format";

const ALL_UNPAID: Period = { month: null, year: null, all: true };

export default async function BalancePage({
  searchParams,
}: PageProps<"/balance">) {
  const params = await searchParams;
  const method = (readStringParam(params, "method") as SettlementMethod) || "equal";
  const result = await computeBalance(method);

  const pending = result.transfers.filter((item) => item.status === "pending");
  const saved = ((result.naiveTransferCount - pending.length) /
    Math.max(1, result.naiveTransferCount)) *
    100;

  const byId = new Map(result.members.map((member) => [member.userId, member]));

  return (
    <div className="flex flex-col gap-gutter-xl">
      <SurfaceCard className="relative overflow-hidden p-5 lg:p-8">
        <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="accent" className="uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                Kỳ quyết toán mở
              </Badge>
              <span className="text-body-sm text-outline">
                · Toàn thời gian · chưa thanh toán
              </span>
            </div>
            <h1 className="text-headline-lg text-foreground">
              Đối soát công nợ nội bộ
            </h1>
            <p className="mt-1 max-w-xl text-body-md text-on-surface-variant">
              Chia đều hoặc theo trọng số trên mọi hóa đơn chưa thanh toán,
              rồi rút gọn các khoản phải trả thành ít giao dịch nhất.
            </p>
          </div>
          <Segmented
            paramKey="method"
            defaultValue="equal"
            options={[
              { value: "equal", label: "Chia đều (Mặc định)" },
              { value: "weighted", label: "Chia theo trọng số" },
            ]}
            className="shadow-inner"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric
            icon="payments"
            label="Tổng chưa thanh toán"
            value={<Money value={result.totalAmount} size="lg" unit />}
            hint={`${result.transfers.length} giao dịch đề xuất`}
          />
          <Metric
            icon="group"
            label="Thành viên tham gia"
            value={
              <span className="font-mono text-numeric-lg">
                {String(result.memberCount).padStart(2, "0")} người
              </span>
            }
            hint="100% thành viên đang hoạt động"
          />
          <Metric
            icon="equalizer"
            label="Bình quân mỗi người"
            value={
              <Money
                value={result.perMemberAmount}
                size="lg"
                unit
                tone="primary"
              />
            }
            hint={method === "weighted" ? "Theo trọng số" : "Chia đều"}
          />
        </div>
      </SurfaceCard>

      <SectionCard
        title="Biểu đồ công nợ"
        description="Thanh lệch hai chiều quanh trục 0"
        action={<Badge variant="secondary">Trục 0 cân bằng</Badge>}
      >
        {result.members.length === 0 ? (
          <EmptyState
            icon="group"
            title="Chưa có thành viên"
            description="Thêm thành viên trước khi đối soát."
          />
        ) : (
          <>
            <div className="mb-3 flex gap-4 text-body-sm">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-destructive" />
                Bên nợ (Chi &lt; Bình quân)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-income" />
                Bên nhận (Chi &gt; Bình quân)
              </span>
            </div>
            <DivergingBalanceBars members={result.members} />
          </>
        )}
      </SectionCard>

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-headline-lg">
              <Icon name="auto_mode" size={24} className="text-primary" />
              Gợi ý chuyển khoản
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Rút gọn từ {result.naiveTransferCount} phiên về {pending.length}{" "}
              giao dịch
            </p>
          </div>
          <Badge variant="income">
            Tối ưu {Math.round(Math.max(0, saved))}% thao tác
          </Badge>
        </div>

        {result.transfers.length === 0 ? (
          <SurfaceCard>
            <EmptyState
              icon="verified"
              title="Mọi người đã cân bằng"
              description="Không còn hóa đơn chưa thanh toán cần chia."
            />
          </SurfaceCard>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {result.transfers.map((transfer, index) => (
              <SettlementCard
                key={transfer.key}
                transfer={transfer}
                receiver={byId.get(transfer.toUserId)}
                period={ALL_UNPAID}
                method={method}
                index={index + 1}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <SurfaceCard className="lg:col-span-7">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon name="psychology" size={22} />
            </span>
            <div>
              <h3 className="text-headline-sm">Cơ chế tối ưu hóa bù trừ</h3>
              <ul className="mt-2 space-y-1 text-body-sm text-on-surface-variant">
                <li className="flex items-center gap-1.5">
                  <Icon name="check_circle" size={16} className="text-income" />
                  Ghép người nợ nhiều nhất với người được nhận nhiều nhất
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon name="check_circle" size={16} className="text-income" />
                  Các khoản đã ghi nhận không bị tính lại kỳ sau
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon name="check_circle" size={16} className="text-income" />
                  Nội dung chuyển khoản bỏ dấu để Napas nhận được
                </li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="code">{result.sessionCode}</Badge>
                <Badge variant="income">Đã kiểm tra cân đối thu chi</Badge>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="lg:col-span-5">
          <h3 className="text-headline-sm">Xuất dữ liệu &amp; Thông báo</h3>
          <div className="mt-3 flex flex-col gap-2">
            <Button
              variant="subtle"
              size="md"
              render={<a href="/api/bills/export?all=1&status=unpaid" />}
            >
              <Icon name="table_view" size={18} />
              Xuất biên bản đối soát (Excel)
            </Button>
            <NotifyBalanceButton period={ALL_UNPAID} method={method} />
          </div>
          <p className="mt-3 text-body-sm text-outline">
            Lần ghi nhận gần nhất:{" "}
            {result.lastSettledAt ? formatDate(result.lastSettledAt) : "chưa có"}
            {result.createdByName ? ` · ${result.createdByName}` : ""}
          </p>
        </SurfaceCard>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  hint,
}: {
  icon: "payments" | "group" | "equalizer";
  label: string;
  value: ReactNode;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface-low p-4 transition-transform hover:-translate-y-0.5">
      <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon name={icon} size={26} />
      </span>
      <div>
        <p className="text-code tracking-wider text-outline uppercase">{label}</p>
        <div>{value}</div>
        <p className="text-body-sm text-outline">{hint}</p>
      </div>
    </div>
  );
}
