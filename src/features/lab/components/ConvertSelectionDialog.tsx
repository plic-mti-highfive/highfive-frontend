import { useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from "@shared/ui";

export interface WallSelectionItem {
  id: string;
  label: string;
}

export interface ConvertSelectionDialogProps {
  open: boolean;
  items: WallSelectionItem[];
  pending: boolean;
  onClose: () => void;
  onConfirm: (elementIds: string[]) => void;
}

/**
 * R-W2 : conversion d'une sélection du Mur en tâches. Le contrat
 * (`WallToTasksInput`, `src/domain/wall.ts`) ne porte qu'un tableau
 * d'identifiants d'éléments — le handler mock choisit lui-même le titre de
 * chaque tâche créée. La "proposition modifiable" (P5) porte donc sur ce
 * que le contrat expose réellement : quels éléments partent en tâches, pas
 * leur futur titre (qu'aucune route n'accepte en entrée).
 *
 * La liste cochable est déléguée à `SelectionChecklist`, remontée via une
 * `key` dérivée des ids sélectionnés : le jeu de cases cochées repart de
 * "tout coché" à chaque nouvelle sélection sans passer par un effet.
 */
export function ConvertSelectionDialog({
  open,
  items,
  pending,
  onClose,
  onConfirm,
}: ConvertSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPopup>
        <DialogTitle>Convertir la sélection en tâches</DialogTitle>
        <DialogDescription>
          Chaque élément coché devient une tâche dans la première colonne de Les
          Tâches. Décoche ce que tu ne veux pas convertir.
        </DialogDescription>

        <SelectionChecklist
          key={items.map((i) => i.id).join(",")}
          items={items}
          pending={pending}
          onCancel={onClose}
          onConfirm={onConfirm}
        />
      </DialogPopup>
    </Dialog>
  );
}

function SelectionChecklist({
  items,
  pending,
  onCancel,
  onConfirm,
}: {
  items: WallSelectionItem[];
  pending: boolean;
  onCancel: () => void;
  onConfirm: (elementIds: string[]) => void;
}) {
  const [kept, setKept] = useState<Set<string>>(
    () => new Set(items.map((i) => i.id)),
  );

  return (
    <>
      <div className="mt-4 flex max-h-64 flex-col gap-1 overflow-y-auto">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted"
          >
            <Checkbox
              checked={kept.has(item.id)}
              onCheckedChange={(checked) =>
                setKept((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(item.id);
                  else next.delete(item.id);
                  return next;
                })
              }
            />
            <span className="truncate text-body-md text-foreground">
              {item.label}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Annuler
        </Button>
        <Button
          disabled={kept.size === 0 || pending}
          onClick={() => onConfirm([...kept])}
        >
          {pending
            ? "Création…"
            : `Créer ${kept.size} tâche${kept.size > 1 ? "s" : ""}`}
        </Button>
      </div>
    </>
  );
}
