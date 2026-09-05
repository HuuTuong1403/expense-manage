import { cn } from "@/lib/utils";

type CategoryChipProps = {
  icon?: string | null;
  name: string;
  className?: string;
};

/** Chip danh mục: emoji + tên, luôn đi cùng nhau như bot đang hiển thị. */
export function CategoryChip({ icon, name, className }: CategoryChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-surface px-2 py-0.5 text-body-sm font-medium",
        className,
      )}
    >
      <span aria-hidden>{icon || "📦"}</span>
      <span className="truncate">{name}</span>
    </span>
  );
}
