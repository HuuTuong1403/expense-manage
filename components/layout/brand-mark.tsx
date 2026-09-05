import Link from "next/link";
import { Icon } from "@/components/ui-m3/icon";

export function BrandMark() {
  return (
    <Link
      href="/dashboard"
      className="flex h-16 items-center gap-3 px-gutter-md"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Icon name="savings" size={20} filled />
      </span>
      <span className="text-headline-md font-bold tracking-tight text-primary">
        Chi Tiêu
      </span>
    </Link>
  );
}
