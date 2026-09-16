import * as React from "react";

import {
  Button,
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  Spinner,
} from "@shared/ui";

/**
 * Coquille de confirmation partagee par les actions d'administration
 * (suspendre, réactiver, supprimer, traiter un signalement…). Toute action
 * d'administration est irreversible ou sensible (R-RP3) : jamais de Toast
 * silencieux, toujours cette Modal (R-ET25).
 */
export interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  /** Desactive la confirmation (ex. motif obligatoire pas encore saisi). */
  confirmDisabled?: boolean;
  onConfirm: () => void;
  children?: React.ReactNode;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Annuler",
  destructive = false,
  pending = false,
  confirmDisabled = false,
  onConfirm,
  children,
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
        {children && <div className="mt-4 flex flex-col gap-3">{children}</div>}
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={pending || confirmDisabled}
          >
            {pending && <Spinner size="sm" />}
            {confirmLabel}
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
