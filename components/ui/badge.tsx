import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-code font-bold whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-surface-high text-on-surface-variant font-semibold",
        /** Trạng thái đã thanh toán, số dương, thu nhập. */
        income: "bg-income/10 text-income",
        /** Chưa thanh toán, ngân sách 80–100%. */
        warning: "bg-warning/10 text-warning",
        /** Quá hạn. */
        overdue: "bg-overdue text-overdue-foreground",
        /** Vượt ngân sách. */
        destructive: "bg-destructive text-destructive-foreground",
        "destructive-soft": "bg-destructive/10 text-destructive",
        expense: "bg-expense/10 text-expense",
        info: "bg-info/10 text-info",
        /** Nhấn nhẹ bằng màu thương hiệu. */
        accent: "bg-primary/10 text-primary font-semibold",
        /** Chip mã code: vuông hơn, chữ mono. */
        code: "rounded-sm bg-surface-high px-1.5 font-mono font-medium text-on-surface-variant",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-surface-high hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
