import { useState } from "react";
import type { Column } from "@/domain";
import {
  Button,
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  Field,
} from "@shared/ui";

export interface DeleteColumnDialogProps {
  column: Column | null;
  destinations: Column[];
  pending: boolean;
  onClose: () => void;
  onConfirm: (moveTo: string) => void;
}

/**
 * R-K3 : supprimer une colonne exige de choisir où déplacer ses tâches —
 * jamais de suppression silencieuse de leur contenu.
 */
export function DeleteColumnDialog({
  column,
  destinations,
  pending,
  onClose,
  onConfirm,
}: DeleteColumnDialogProps) {
  const [moveTo, setMoveTo] = useState(destinations[0]?.id ?? "");

  return (
    <Dialog open={Boolean(column)} onOpenChange={(next) => !next && onClose()}>
      <DialogPopup>
        <DialogTitle>Supprimer « {column?.label} »</DialogTitle>
        <DialogDescription>
          Choisis la colonne qui accueillera les tâches de cette colonne.
        </DialogDescription>

        <Field label="Déplacer les tâches vers" className="mt-4">
          <select
            value={moveTo}
            onChange={(e) => setMoveTo(e.target.value)}
            className="h-9 rounded-md border border-border bg-transparent px-2.5 text-body-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {destinations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            disabled={!moveTo || pending}
            onClick={() => onConfirm(moveTo)}
          >
            {pending ? "Suppression…" : "Supprimer la colonne"}
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
