import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Column, Task } from "@/domain";
import type { TeamMember } from "@/api/memberships";
import { Button, IconButton, Input } from "@shared/ui";
import { cn } from "@shared/lib/cn";
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
 * Une colonne des Étapes (doc 04 §11) : en-tête sobre (nom, compteur), cartes
 * espacées, ajout en bas. Le glisser-déposer ne cible que la colonne (pas une position précise) — le contrat `TaskMoveInput`
 * (R-K5) ne modélise que la colonne + un ordre, sans réindexer les étapes
 * voisines côté handler ; une dépose place donc l'étape en fin de colonne
 * cible, et l'alternative clavier (menu ⋮ de `TaskCard`) fait exactement la
 * même chose.
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
    <section
      data-accent={accent}
      aria-label={column.label}
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
      className={cn(
        "group/column flex flex-col gap-5 rounded-2xl bg-muted/50 p-5 transition-shadow md:w-80 md:shrink-0 lg:flex-1 lg:basis-72",
        isOver && "ring-2 ring-[var(--accent-base)]",
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate font-display text-heading-md font-semibold text-foreground">
            {column.label}
          </h2>
          <span className="shrink-0 text-body-sm text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        {canManageColumns && columns.length > 1 && (
          <IconButton
            aria-label={`Supprimer la colonne ${column.label}`}
            size="xs"
            className="opacity-0 transition-opacity focus-visible:opacity-100 group-focus-within/column:opacity-100 group-hover/column:opacity-100 max-md:opacity-100"
            onClick={onRequestDeleteColumn}
          >
            <Trash2 size={14} />
          </IconButton>
        )}
      </header>

      {tasks.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                column={column}
                columns={columns}
                members={members}
                readOnly={readOnly}
                onOpen={() => onOpenTask(task.id)}
                onMoveTo={(columnId) => onMoveTask(task.id, columnId)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-body-sm text-muted-foreground">
          {readOnly
            ? "Aucune étape ici."
            : "Rien ici pour l'instant. Ajoute une étape ou glisses-en une."}
        </p>
      )}

      {!readOnly &&
        (adding ? (
          <div className="flex flex-col gap-3 rounded-xl bg-card p-3 shadow-rest">
            <Input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Titre de l'étape…"
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
            className="flex items-center gap-2 self-start rounded-md px-2 py-1.5 text-body-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus size={14} />
            Ajouter une étape
          </button>
        ))}
    </section>
  );
}
