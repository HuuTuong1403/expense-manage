"use client";

import { toast } from "sonner";
import { Icon } from "@/components/ui-m3/icon";

export function CopyCodeButton({ code }: { code: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Đã sao chép ${code}`);
    } catch {
      toast.error("Không sao chép được mã");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Sao chép mã ${code}`}
      className="text-outline opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary"
    >
      <Icon name="content_copy" size={14} />
    </button>
  );
}
