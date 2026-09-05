import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card cơ bản của mockup: nền `card`, bo 8px, đổ bóng nhẹ, padding 20px.
 * Không dùng `Card` của shadcn vì bản base-nova dùng ring + bo 12px.
 */
export function SurfaceCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-lg bg-card p-card shadow-sm", className)}
      {...props}
    />
  );
}

type SectionCardProps = React.ComponentProps<"section"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Nội dung góc phải của header: badge, link, chú thích. */
  action?: React.ReactNode;
  headerClassName?: string;
};

/** Card có header tiêu đề + mô tả + slot phải, dùng cho mọi khối trên dashboard. */
export function SectionCard({
  title,
  description,
  action,
  className,
  headerClassName,
  children,
  ...props
}: SectionCardProps) {
  return (
    <section
      className={cn("flex flex-col rounded-lg bg-card p-card shadow-sm", className)}
      {...props}
    >
      <div
        className={cn(
          "mb-4 flex items-start justify-between gap-gutter-md",
          headerClassName,
        )}
      >
        <div className="min-w-0">
          <h2 className="text-headline-sm text-foreground">{title}</h2>
          {description ? (
            <p className="text-body-sm text-outline">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
