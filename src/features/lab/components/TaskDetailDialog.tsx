import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Column, Task } from "@/domain";
import type { TeamMember } from "@/api/memberships";
import {
  Avatar,
  Button,
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  Field,
  Input,
  Textarea,
} from "@shared/ui";

export interface TaskDetailDialogProps {
  task: Task | null;
  column: Column | null;
  columns: Column[];
  members: TeamMember[];
  readOnly: boolean;
  onClose: () => void;
  onUpdate: (input: {
    title?: string;
    details?: string;
    assigneeIds?: string[];
    dueDate?: string | null;
  }) => void;
  onMove: (columnId: string) => void;
  onDelete: () => void;
}

/**
 * Panneau de détail d'une tâche (doc 04 §11) : titre, détails, assignés
 * multiples parmi les VRAIS membres (`useMembers`), échéance optionnelle —
 * jamais de niveau d'urgence (écart volontaire vs l'ancien composant).
 * R-K6 : l'échéance ne porte aucune alerte visuelle même dépassée.
 *
 * Le contenu éditable est délégué à `TaskDetailForm`, remonté via `key={task.id}`
 * à chaque changement de tâche : ses états locaux (brouillons de champs) se
 * réinitialisent ainsi à l'ouverture d'une autre tâche sans passer par un
 * effet (évite le set-state-in-effect, cascading renders).
 */
export function TaskDetailDialog({
  task,
  column,
  columns,
  members,
  readOnly,
  onClose,
  onUpdate,
  onMove,
  onDelete,
}: TaskDetailDialogProps) {
  return (
    <Dialog open={Boolean(task)} onOpenChange={(next) => !next && onClose()}>
      <DialogPopup className="max-w-lg">
        {task && column && (
          <TaskDetailForm
            key={task.id}
            task={task}
            column={column}
            columns={columns}
            members={members}
            readOnly={readOnly}
            onUpdate={onUpdate}
            onMove={onMove}
            onDelete={() => {
              onDelete();
              onClose();
            }}
          />
        )}
      </DialogPopup>
    </Dialog>
  );
}

interface TaskDetailFormProps {
  task: Task;
  column: Column;
  columns: Column[];
  members: TeamMember[];
  readOnly: boolean;
  onUpdate: TaskDetailDialogProps["onUpdate"];
  onMove: (columnId: string) => void;
  onDelete: () => void;
}

function TaskDetailForm({
  task,
  column,
  columns,
  members,
  readOnly,
  onUpdate,
  onMove,
  onDelete,
}: TaskDetailFormProps) {
  const [title, setTitle] = useState(task.title);
  const [details, setDetails] = useState(task.details ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function toggleAssignee(userId: string) {
    const current = task.assigneeIds;
    onUpdate({
      assigneeIds: current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    });
  }

  return (
    <>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          const trimmed = title.trim();
          if (trimmed && trimmed !== task.title) onUpdate({ title: trimmed });
          else setTitle(task.title);
        }}
        disabled={readOnly}
        aria-label="Titre de la tâche"
        className="border-none bg-transparent px-0 text-heading-md font-semibold shadow-none focus-visible:ring-0"
      />
      <DialogTitle className="sr-only">{task.title}</DialogTitle>
      <DialogDescription className="sr-only">
        Détail de la tâche dans la colonne {column.label}
      </DialogDescription>

      <div className="mt-4 flex flex-col gap-4">
        <Field label="Colonne">
          <select
            value={column.id}
            disabled={readOnly}
            onChange={(e) => onMove(e.target.value)}
            className="h-9 rounded-md border border-border bg-transparent px-2.5 text-body-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Détails">
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            onBlur={() => {
              if (details !== (task.details ?? "")) onUpdate({ details });
            }}
            disabled={readOnly}
            rows={3}
            placeholder="Ajoute des précisions…"
          />
        </Field>

        <Field label="Assignés">
          {members.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">
              Aucun membre dans ce projet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {members.map((m) => {
                const active = task.assigneeIds.includes(m.userId);
                return (
                  <button
                    key={m.userId}
                    type="button"
                    disabled={readOnly}
                    onClick={() => toggleAssignee(m.userId)}
                    aria-pressed={active}
                    className={`flex items-center gap-1.5 rounded-pill border px-2 py-1 text-body-sm transition-colors disabled:opacity-50 ${
                      active
                        ? "border-foreground bg-muted text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Avatar
                      name={m.user.displayName ?? m.user.username}
                      src={m.user.avatar}
                      size="xs"
                    />
                    {m.user.displayName ?? `@${m.user.username}`}
                  </button>
                );
              })}
            </div>
          )}
        </Field>

        <Field
          label="Échéance"
          description="Facultative — aucune alerte même passée."
        >
          <Input
            type="date"
            value={dueDate}
            disabled={readOnly}
            onChange={(e) => setDueDate(e.target.value)}
            onBlur={() => {
              if (dueDate !== (task.dueDate ?? "")) {
                onUpdate({ dueDate: dueDate || null });
              }
            }}
          />
        </Field>
      </div>

      {!readOnly && (
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-foreground">
                Supprimer définitivement ?
              </span>
              <Button variant="destructive" size="sm" onClick={onDelete}>
                Supprimer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                Annuler
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-body-sm text-muted-foreground hover:text-danger-fg"
            >
              <Trash2 size={13} />
              Supprimer la tâche
            </button>
          )}
        </div>
      )}
    </>
  );
}
