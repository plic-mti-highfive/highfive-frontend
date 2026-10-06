import { useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  Input,
  Spinner,
} from "@shared/ui";
import type { ProposedTask } from "@/domain";

const TITLE_MAX_LENGTH = 120;

export type SuggestTasksPhase = "loading" | "error" | "empty" | "ready";

export interface SuggestTasksDialogProps {
  open: boolean;
  phase: SuggestTasksPhase;
  proposals: ProposedTask[];
  /** Message français à afficher en phase `error`. */
  errorMessage?: string;
  /** Création des tâches retenues en cours. */
  accepting: boolean;
  /** Échec de la création (la liste reste affichée, l'utilisateur peut réessayer). */
  acceptError?: string;
  onClose: () => void;
  /** Relance la demande de propositions à l'IA. */
  onRetry: () => void;
  onConfirm: (tasks: ProposedTask[]) => void;
}

/**
 * « Suggérer des tâches (IA) » : l'IA propose, l'utilisateur dispose. Rien
 * n'est créé tant qu'il n'a pas validé ; il décoche ce qui ne convient pas et
 * corrige les titres. Description et éléments du Mur qui ont motivé la
 * proposition (`sourceHints`) sont affichés pour juger.
 */
export function SuggestTasksDialog({
  open,
  phase,
  proposals,
  errorMessage,
  accepting,
  acceptError,
  onClose,
  onRetry,
  onConfirm,
}: SuggestTasksDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPopup className="max-w-2xl">
        <DialogTitle>Suggérer des étapes (IA)</DialogTitle>
        <DialogDescription>
          Propositions déduites du contenu du Mur et de la description du
          projet. Rien n'est créé avant ta validation.
        </DialogDescription>

        {phase === "loading" && (
          <div
            className="mt-6 flex items-center gap-3 text-body-md text-muted-foreground"
            role="status"
          >
            <Spinner size="sm" />
            <span>Analyse du Mur en cours…</span>
          </div>
        )}

        {phase === "error" && (
          <div className="mt-6 flex flex-col gap-4">
            <p className="text-body-md text-danger-fg" role="alert">
              {errorMessage ?? "La suggestion d'étapes a échoué."}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Fermer
              </Button>
              <Button onClick={onRetry}>Réessayer</Button>
            </div>
          </div>
        )}

        {phase === "empty" && (
          <div className="mt-6 flex flex-col gap-4">
            <p className="text-body-md text-foreground">
              Le Mur ne contient pas encore assez de texte pour proposer des
              étapes. Ajoute quelques post-its ou notes, puis réessaie.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Fermer
              </Button>
              <Button onClick={onRetry}>Réessayer</Button>
            </div>
          </div>
        )}

        {phase === "ready" && (
          <ProposalsChecklist
            key={proposals.map((p) => p.title).join("\u0000")}
            proposals={proposals}
            accepting={accepting}
            acceptError={acceptError}
            onCancel={onClose}
            onConfirm={onConfirm}
          />
        )}
      </DialogPopup>
    </Dialog>
  );
}

interface DraftProposal {
  task: ProposedTask;
  kept: boolean;
}

function ProposalsChecklist({
  proposals,
  accepting,
  acceptError,
  onCancel,
  onConfirm,
}: {
  proposals: ProposedTask[];
  accepting: boolean;
  acceptError?: string;
  onCancel: () => void;
  onConfirm: (tasks: ProposedTask[]) => void;
}) {
  const [drafts, setDrafts] = useState<DraftProposal[]>(() =>
    proposals.map((task) => ({ task, kept: true })),
  );

  const retained = drafts
    .filter((draft) => draft.kept && draft.task.title.trim() !== "")
    .map(({ task }) => ({ ...task, title: task.title.trim() }));

  function patch(index: number, change: Partial<DraftProposal>) {
    setDrafts((prev) =>
      prev.map((draft, i) => (i === index ? { ...draft, ...change } : draft)),
    );
  }

  return (
    <>
      <ul className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto">
        {drafts.map((draft, index) => {
          const emptyTitle = draft.kept && draft.task.title.trim() === "";
          return (
            <li
              key={index}
              className={
                draft.kept
                  ? "rounded-md border border-border p-3"
                  : "rounded-md border border-border bg-muted p-3 opacity-60"
              }
            >
              <div className="flex items-start gap-2.5">
                <Checkbox
                  className="mt-2"
                  aria-label={`Retenir la proposition ${index + 1}`}
                  checked={draft.kept}
                  onCheckedChange={(checked) =>
                    patch(index, { kept: Boolean(checked) })
                  }
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Input
                    aria-label={`Titre de la proposition ${index + 1}`}
                    aria-invalid={emptyTitle || undefined}
                    value={draft.task.title}
                    maxLength={TITLE_MAX_LENGTH}
                    disabled={!draft.kept || accepting}
                    onChange={(event) =>
                      patch(index, {
                        task: { ...draft.task, title: event.target.value },
                      })
                    }
                  />
                  {draft.task.description && (
                    <p className="text-body-sm text-muted-foreground">
                      {draft.task.description}
                    </p>
                  )}
                  {draft.task.sourceHints.length > 0 && (
                    <p className="text-body-sm text-muted-foreground">
                      D'après : {draft.task.sourceHints.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {acceptError && (
        <p className="mt-3 text-body-sm text-danger-fg" role="alert">
          {acceptError}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={accepting}>
          Annuler
        </Button>
        <Button
          disabled={retained.length === 0 || accepting}
          onClick={() => onConfirm(retained)}
        >
          {accepting
            ? "Création…"
            : `Créer ${retained.length} étape${retained.length > 1 ? "s" : ""}`}
        </Button>
      </div>
    </>
  );
}
