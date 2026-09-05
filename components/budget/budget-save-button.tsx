"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui-m3/icon";
import { IDLE_STATE, type ActionState } from "@/lib/action-result";

export function BudgetSaveButton({
  action,
  label,
  variant = "default",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  label: string;
  variant?: "default" | "secondary";
}) {
  const [state, formAction, pending] = useActionState(action, IDLE_STATE);

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <Button
      formAction={formAction}
      size="md"
      variant={variant}
      disabled={pending}
    >
      {pending ? <Icon name="refresh" size={18} className="animate-spin" /> : null}
      {label}
    </Button>
  );
}
