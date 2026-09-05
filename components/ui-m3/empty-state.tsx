import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui-m3/icon";
import type { IconName } from "@/lib/icons";

type EmptyStateProps = {
  icon?: IconName;
  title: string;
  description?: React.ReactNode;
  /** Luôn cho người dùng một việc để làm tiếp, không để bảng rỗng trơ. */
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon = "inventory_2",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-gutter-md py-gutter-xl text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-low text-outline">
        <Icon name={icon} size={24} />
      </span>
      <p className="text-headline-sm text-foreground">{title}</p>
      {description ? (
        <p className="max-w-sm text-body-sm text-outline">{description}</p>
      ) : null}
      {action ? <div className="mt-2 flex items-center gap-gutter-sm">{action}</div> : null}
    </div>
  );
}
