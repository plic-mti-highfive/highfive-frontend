import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, ErrorState, Input, Skeleton } from "@shared/ui";
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
 * Étapes (`/projets/:slug/lab/etapes`, doc 04 §11) : colonnes de 1 à 6
 * (R-K2), suppression avec choix de destination (R-K3), glisser-déposer
 * entre colonnes + alternative clavier "Déplacer vers…" (voir TaskCard).
 * Vocabulaire du doc 03 uniquement (étape, colonne, Fait) — pas de
 * vocabulaire emprunté aux outils de support/suivi logiciel, ni de niveau
 * d'urgence.
 *
 * Mise en page : la page défile (verticalement, dans la coquille du Lab) dans
 * un conteneur de largeur de site ; les colonnes se répartissent la largeur,
 * se déroulent en liste sur mobile et ne défilent à l'horizontale qu'au-delà
 * de ce que l'écran peut contenir.
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
      <div className="mx-auto flex max-w-content flex-col gap-6 px-6 py-8 md:flex-row">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-72 rounded-2xl md:flex-1" />
        ))}
      </div>
    );
  }

  if (columnsQuery.isError || tasksQuery.isError || !columnsQuery.data) {
    return (
      <div className="flex h-full items-center justify-center">
        <ErrorState
          message="Impossible de charger les Étapes pour le moment."
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

  const canAddColumn = canManageColumns && columns.length < MAX_COLUMNS;

  function cancelNewColumn() {
    setAddingColumn(false);
    setNewColumnLabel("");
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-heading-lg font-semibold text-foreground">
              Étapes
            </h1>
            <p className="text-body-md text-muted-foreground">
              {tasks.length === 0
                ? "Pas encore d'étape."
                : `${tasks.length} étape${tasks.length > 1 ? "s" : ""} sur ${columns.length} colonne${columns.length > 1 ? "s" : ""}`}
            </p>
          </div>

          {canAddColumn &&
            (addingColumn ? (
              <div className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={newColumnLabel}
                  maxLength={24}
                  onChange={(e) => setNewColumnLabel(e.target.value)}
                  placeholder="Nom de la colonne…"
                  aria-label="Nom de la nouvelle colonne"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitNewColumn();
                    if (e.key === "Escape") cancelNewColumn();
                  }}
                />
                <Button
                  size="sm"
                  onClick={submitNewColumn}
                  disabled={!newColumnLabel.trim()}
                >
                  Ajouter
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelNewColumn}>
                  Annuler
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddingColumn(true)}
              >
                <Plus size={14} />
                Nouvelle colonne
              </Button>
            ))}
        </header>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:overflow-x-auto md:pb-4">
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
