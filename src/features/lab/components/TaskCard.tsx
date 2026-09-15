import { useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import type { Column, Task } from "@/domain";
import type { TeamMember } from "@/api/memberships";
import { Avatar, AvatarGroup, Badge, Card } from "@shared/ui";
import { getAccent } from "@shared/lib/accent";
import { formatAbsoluteDate, formatExactDateTime } from "@shared/lib/dates";

export interface TaskCardProps {
  task: Task;
  column: Column;
  columns: Column[];
  members: TeamMember[];
  readOnly: boolean;
  onOpen: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMoveTo: (columnId: string) => void;
}

/**
 * Carte d'une tâche (doc 04 §11) : le domaine ne modélise aucun niveau
 * d'urgence, et le vocabulaire reste celui du doc 03 (V2-8). L'échéance
 * (R-K6) est affichée neutre, sans alerte même dépassée — le doc ne prévoit
 * aucune relance automatique sur Étapes.
 */
export function TaskCard({
  task,
  column,
  columns,
  members,
  readOnly,
  onOpen,
  onDragStart,
  onDragEnd,
  onMoveTo,
}: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const didDragRef = useRef(false);
  const assignees = members.filter((m) => task.assigneeIds.includes(m.userId));
  const otherColumns = columns.filter((c) => c.id !== column.id);

  return (
    <Card
      variant="interactive"
      data-accent={column.color ?? getAccent(column.id)}
      draggable={!readOnly}
      onDragStart={(e) => {
        if (readOnly) return;
        didDragRef.current = true;
        setIsDragging(true);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart();
      }}
      onDragEnd={() => {
        setIsDragging(false);
        onDragEnd();
        setTimeout(() => {
          didDragRef.current = false;
        }, 50);
      }}
      onClick={() => {
        if (!didDragRef.current) onOpen();
      }}
      className={`group select-none px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        {!readOnly && (
          <GripVertical
            className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-40"
            size={14}
            aria-hidden
          />
        )}
        <p className="min-w-0 flex-1 text-body-md font-medium leading-snug text-foreground">
          {task.title}
        </p>
      </div>

      {(task.dueDate || assignees.length > 0 || otherColumns.length > 0) && (
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <Badge tone="neutral" title={formatExactDateTime(task.dueDate)}>
                {formatAbsoluteDate(task.dueDate)}
              </Badge>
            )}
            {!readOnly && otherColumns.length > 0 && (
              <label className="sr-only" htmlFor={`move-${task.id}`}>
                Déplacer « {task.title} » vers…
              </label>
            )}
            {!readOnly && otherColumns.length > 0 && (
              <select
                id={`move-${task.id}`}
                aria-label={`Déplacer « ${task.title} » vers…`}
                value=""
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  if (e.target.value) onMoveTo(e.target.value);
                  e.target.value = "";
                }}
                className="rounded-md border border-transparent bg-transparent text-body-sm text-muted-foreground outline-none hover:border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Déplacer vers…</option>
                {otherColumns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {assignees.length > 0 && (
            <AvatarGroup max={4}>
              {assignees.map((m) => (
                <Avatar
                  key={m.userId}
                  name={m.user.displayName ?? m.user.username}
                  src={m.user.avatar}
                  size="xs"
                />
              ))}
            </AvatarGroup>
          )}
        </div>
      )}
    </Card>
  );
}
