import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@shared/lib/cn";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>,
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(
  props: React.ComponentProps<typeof DialogPrimitive.Portal>,
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-backdrop"
      className={cn(
        "fixed inset-0 z-overlay bg-black/40 transition-opacity duration-base data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

interface DialogPopupProps extends React.ComponentProps<
  typeof DialogPrimitive.Popup
> {
  showClose?: boolean;
}

function DialogPopup({
  className,
  children,
  showClose = true,
  ...props
}: DialogPopupProps) {
  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogPrimitive.Popup
        data-slot="dialog-popup"
        className={cn(
          "fixed top-1/2 left-1/2 z-modal w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-overlay outline-none transition-all duration-base data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            data-slot="dialog-close-icon"
            className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground outline-none transition-colors duration-fast hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="Fermer"
          >
            <X size={16} />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-heading-md font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("mt-1 text-body-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function DialogClose(
  props: React.ComponentProps<typeof DialogPrimitive.Close>,
) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
