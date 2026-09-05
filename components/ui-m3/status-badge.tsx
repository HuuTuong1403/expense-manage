import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui-m3/icon";
import { daysPastDue } from "@/lib/format";

type BillStatusBadgeProps = {
  isPaid: boolean;
  dueDate?: Date | string | null;
  className?: string;
};

/**
 * Badge trạng thái hóa đơn. Quá hạn được ưu tiên hiển thị vì đó là thông tin
 * người dùng cần hành động ngay; luôn kèm chữ chứ không chỉ dựa vào màu.
 */
export function BillStatusBadge({
  isPaid,
  dueDate,
  className,
}: BillStatusBadgeProps) {
  if (isPaid) {
    return (
      <Badge variant="income" className={className}>
        Đã trả
      </Badge>
    );
  }

  if (dueDate) {
    const overdueDays = daysPastDue(dueDate);
    if (overdueDays > 0) {
      return (
        <Badge variant="overdue" className={className}>
          <Icon name="alarm" size={12} />
          Quá hạn {overdueDays} ngày
        </Badge>
      );
    }
  }

  return (
    <Badge variant="warning" className={className}>
      Chưa trả
    </Badge>
  );
}

/** Nhãn hạn thanh toán hiển thị dưới mô tả hóa đơn. */
export function isOverdue(isPaid: boolean, dueDate?: Date | string | null) {
  if (isPaid || !dueDate) return false;
  return daysPastDue(dueDate) > 0;
}
