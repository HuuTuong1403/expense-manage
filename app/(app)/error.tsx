"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui-m3/icon";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <Icon name="error" size={36} className="text-destructive" />
      <h1 className="text-headline-md">Không tải được trang</h1>
      <p className="max-w-md text-body-md text-on-surface-variant">
        Có lỗi xảy ra khi lấy dữ liệu. Thử lại hoặc quay lại sau.
      </p>
      {process.env.NODE_ENV === "development" ? (
        <p className="max-w-lg font-mono text-code text-outline">{error.message}</p>
      ) : null}
      <Button size="md" onClick={reset}>
        Thử lại
      </Button>
    </div>
  );
}
