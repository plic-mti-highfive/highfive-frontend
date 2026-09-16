import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Column, Task } from "@/domain";
import type { TeamMember } from "@/api/memberships";
import { Button, IconButton, Input } from "@shared/ui";
import { getAccent } from "@shared/lib/accent";
import { TaskCard } from "./TaskCard";

export interface TaskColumnProps {
  column: Column;
  columns: Column[];
  tasks: Task[];
  members: TeamMember[];
  readOnly: boolean;
  canManageColumns: boolean;
  onOpenTask: (taskId: string) => void;
  onAddTask: (title: string) => void;
  onMoveTask: (taskId: string, columnId: string) => void;
  onRequestDeleteColumn: () => void;
}

/**
 * Une colonne des Tâches (doc 04 §11) : le libellé visible reste celui du
 * doc 03 (colonne, tâche), jamais un emprunt aux outils de suivi logiciel.
 * Le glisser-déposer ne cible que la colonne (pas une
 * position précise) — le contrat `TaskMoveInput` (R-K5) ne modélise que la
 * colonne + un ordre, sans réindexer Étapes voisines côté handler ; une
 * dépose place donc la tâche en fin de colonne cible, et l'alternative
 * clavier (`TaskCard`, "Déplacer vers…") fait exactement la même chose.
 */
export function TaskColumn({
  column,
  columns,
  tasks,
  members,
  readOnly,
  canManageColumns,
  onOpenTask,
  onAddTask,
  onMoveTask,
  onRequestDeleteColumn,
}: TaskColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const accent = column.color ?? getAccent(column.id);

  function submit() {
    if (draft.trim()) onAddTask(draft.trim());
    setDraft("");
    setAdding(false);
  }

  return (
    <div
      data-accent={accent}
      onDragOver={(e) => {
        if (readOnly) return;
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setIsOver(false);
      }}
      onDrop={(e) => {
        if (readOnly) return;
        e.preventDefault();
        setIsOver(false);
        const taskId = e.dataTransfer.getData("text/plain");
        if (taskId) onMoveTask(taskId, column.id);
      }}
      className={`flex w-70 shrink-0 flex-col gap-2.5 rounded-xl bg-[var(--accent-light)]/40 p-3 transition-shadow ${
        isOver ? "ring-2 ring-[var(--accent-base)]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full bg-[var(--accent-base)]"
            aria-hidden
          />
          <h2 className="truncate text-ui-md text-foreground">
            {column.label}
          </h2>
          <span className="shrink-0 rounded-pill bg-[var(--accent-light)] px-1.5 py-0.5 text-label font-bold text-[var(--accent-dark)]">
            {tasks.length}
          </span>
        </div>
        {canManageColumns && columns.length > 1 && (
          <IconButton
            aria-label={`Supprimer la colonne ${column.label}`}
            size="xs"
            onClick={onRequestDeleteColumn}
          >
            <Trash2 size={13} />
          </IconButton>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            column={column}
            columns={columns}
            members={members}
            readOnly={readOnly}
            onOpen={() => onOpenTask(task.id)}
            onDragStart={() => {}}
            onDragEnd={() => {}}
            onMoveTo={(columnId) => onMoveTask(task.id, columnId)}
          />
        ))}
      </div>

      {!readOnly &&
        (adding ? (
          <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-2">
            <Input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Titre de la tâche…"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") {
                  setAdding(false);
                  setDraft("");
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={submit} disabled={!draft.trim()}>
                Ajouter
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAdding(false);
                  setDraft("");
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-body-sm text-muted-foreground transition-colors hover:bg-[var(--accent-light)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus size={13} />
            Ajouter une tâche
          </button>
        ))}
    </div>
  );
}
