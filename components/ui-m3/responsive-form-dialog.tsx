"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui-m3/icon";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-media-query";
import type { IconName } from "@/lib/icons";

type ResponsiveFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  icon?: IconName;
  children: React.ReactNode;
  className?: string;
};

/**
 * Cùng một form, hiển thị bằng Dialog trên desktop và Sheet trượt từ dưới lên
 * trên mobile. Phần thân form dùng chung nên không nhân đôi logic.
 */
export function ResponsiveFormDialog({
  open,
  onOpenChange,
  title,
  icon = "category",
  children,
  className,
}: ResponsiveFormDialogProps) {
  const isMobile = useIsMobile();

  const header = (
    <div className="flex items-center gap-2.5 bg-surface-low px-gutter-lg py-gutter-md">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon name={icon} size={20} />
      </span>
      <span className="text-headline-md text-foreground">{title}</span>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "max-h-[92vh] gap-0 overflow-y-auto rounded-t-xl bg-card p-0",
            className,
          )}
        >
          <SheetTitle className="sr-only">{title}</SheetTitle>
          {header}
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-h-[90vh] w-full gap-0 overflow-y-auto rounded-xl bg-card p-0 sm:max-w-lg",
          className,
        )}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {header}
        {children}
      </DialogContent>
    </Dialog>
  );
}

/** Bọc phần tử con để mở dialog khi người dùng nhấn vào. */
export function DialogOpener({
  onOpen,
  children,
}: {
  onOpen: () => void;
  children: React.ReactNode;
}) {
  return (
    <span className="contents" onClick={onOpen}>
      {children}
    </span>
  );
}
