import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  /** Badge nhỏ phía trên tiêu đề, ví dụ "CẤU HÌNH HỆ THỐNG". */
  eyebrow?: string;
  /** Chú thích cạnh badge, ví dụ trạng thái đồng bộ bot. */
  meta?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  meta,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-gutter-md pt-2 pb-gutter-lg lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="flex max-w-2xl flex-col gap-1">
        {eyebrow || meta ? (
          <div className="flex flex-wrap items-center gap-2">
            {eyebrow ? (
              <Badge variant="accent" className="uppercase tracking-wider">
                {eyebrow}
              </Badge>
            ) : null}
            {meta ? (
              <>
                <span className="text-body-sm text-outline">•</span>
                <span className="text-body-sm text-on-surface-variant">
                  {meta}
                </span>
              </>
            ) : null}
          </div>
        ) : null}
        <h1 className="text-headline-xl-mobile text-foreground sm:text-headline-xl">
          {title}
        </h1>
        {description ? (
          <p className="text-body-md text-on-surface-variant">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {actions}
        </div>
      ) : null}
    </section>
  );
}
