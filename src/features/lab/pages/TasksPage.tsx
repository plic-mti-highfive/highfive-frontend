import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, ErrorState, Input, PageHeader, Skeleton } from "@shared/ui";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";
import {
  useColumns,
  useCreateColumn,
  useCreateTask,
  useDeleteColumn,
  useDeleteTask,
  useMoveTask,
  useTasks,
  useUpdateTask,
} from "@/api/queries/tasks";
import { useLabContext } from "../lib/context";
import { hasAtLeastRole } from "../lib/roles";
import { TaskColumn } from "../components/TaskColumn";
import { TaskDetailDialog } from "../components/TaskDetailDialog";
import { DeleteColumnDialog } from "../components/DeleteColumnDialog";

const MAX_COLUMNS = 6;

/**
 * Étapes (`/projets/:slug/lab/taches`, doc 04 §11) : colonnes de 1 à 6
 * (R-K2), suppression avec choix de destination (R-K3), glisser-déposer
 * entre colonnes + alternative clavier "Déplacer vers…" (voir TaskCard).
 * Vocabulaire du doc 03 uniquement (tâche, colonne, Fait) — pas de
 * vocabulaire emprunté aux outils de support/suivi logiciel, ni de niveau
 * d'urgence.
 */
export default function TasksPage() {
  const { slug, project, myRole, readOnly, members } = useLabContext();
  useDocumentTitle(`Étapes · ${project.title}`);

  const columnsQuery = useColumns(slug);
  const tasksQuery = useTasks(slug);
  const createColumn = useCreateColumn(slug);
  const deleteColumn = useDeleteColumn(slug);
  const createTask = useCreateTask(slug);
  const updateTask = useUpdateTask(slug);
  const moveTask = useMoveTask(slug);
  const deleteTask = useDeleteTask(slug);

  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [deletingColumnId, setDeletingColumnId] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnLabel, setNewColumnLabel] = useState("");

  const canManageColumns = !readOnly && hasAtLeastRole(myRole, "co_owner");

  if (columnsQuery.isLoading || tasksQuery.isLoading) {
    return (
      <div className="flex h-full gap-4 overflow-hidden p-6">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-full w-70 shrink-0" />
        ))}
      </div>
    );
  }

  if (columnsQuery.isError || tasksQuery.isError || !columnsQuery.data) {
    return (
      <div className="flex h-full items-center justify-center">
        <ErrorState
          message="Impossible de charger Étapes pour le moment."
          onRetry={() => {
            columnsQuery.refetch();
            tasksQuery.refetch();
          }}
        />
      </div>
    );
  }

  const columns = [...columnsQuery.data].sort((a, b) => a.order - b.order);
  const tasks = tasksQuery.data ?? [];
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null;
  const openTaskColumn = openTask
    ? (columns.find((c) => c.id === openTask.columnId) ?? null)
    : null;
  const deletingColumn = columns.find((c) => c.id === deletingColumnId) ?? null;
  const deletionDestinations = columns.filter((c) => c.id !== deletingColumnId);

  function tasksInColumn(columnId: string) {
    return tasks
      .filter((t) => t.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }

  function submitNewColumn() {
    const label = newColumnLabel.trim();
    if (label) createColumn.mutate({ label });
    setNewColumnLabel("");
    setAddingColumn(false);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-6 pt-6">
        <PageHeader
          title="Étapes"
          description={`${tasks.length} tâche${tasks.length > 1 ? "s" : ""} sur ${columns.length} colonne${columns.length > 1 ? "s" : ""}`}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-6 py-4">
        <div className="flex h-full items-start gap-4">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
              columns={columns}
              tasks={tasksInColumn(column.id)}
              members={members}
              readOnly={readOnly}
              canManageColumns={canManageColumns}
              onOpenTask={setOpenTaskId}
              onAddTask={(title) =>
                createTask.mutate({ columnId: column.id, title })
              }
              onMoveTask={(taskId, columnId) => {
                const order = tasksInColumn(columnId).length;
                moveTask.mutate({ taskId, input: { columnId, order } });
              }}
              onRequestDeleteColumn={() => setDeletingColumnId(column.id)}
            />
          ))}

          {canManageColumns && columns.length < MAX_COLUMNS && (
            <div className="w-70 shrink-0">
              {addingColumn ? (
                <div className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-border p-3">
                  <Input
                    autoFocus
                    value={newColumnLabel}
                    onChange={(e) => setNewColumnLabel(e.target.value)}
                    placeholder="Nom de la colonne…"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitNewColumn();
                      if (e.key === "Escape") {
                        setAddingColumn(false);
                        setNewColumnLabel("");
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={submitNewColumn}
                      disabled={!newColumnLabel.trim()}
                    >
                      Ajouter
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAddingColumn(false);
                        setNewColumnLabel("");
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingColumn(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-body-sm text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Plus size={14} />
                  Nouvelle colonne
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <TaskDetailDialog
        task={openTask}
        column={openTaskColumn}
        columns={columns}
        members={members}
        readOnly={readOnly}
        onClose={() => setOpenTaskId(null)}
        onUpdate={(input) => {
          if (!openTask) return;
          updateTask.mutate({ taskId: openTask.id, input });
        }}
        onMove={(columnId) => {
          if (!openTask) return;
          const order = tasksInColumn(columnId).length;
          moveTask.mutate({ taskId: openTask.id, input: { columnId, order } });
        }}
        onDelete={() => {
          if (!openTask) return;
          deleteTask.mutate(openTask.id);
        }}
      />

      <DeleteColumnDialog
        column={deletingColumn}
        destinations={deletionDestinations}
        pending={deleteColumn.isPending}
        onClose={() => setDeletingColumnId(null)}
        onConfirm={(moveTo) => {
          if (!deletingColumnId) return;
          deleteColumn.mutate(
            { columnId: deletingColumnId, moveTo },
            { onSuccess: () => setDeletingColumnId(null) },
          );
        }}
      />
    </div>
  );
}
