import { useRef, useState } from "react";
import { ArrowRightLeft, CalendarDays, MoreVertical } from "lucide-react";
import type { Column, Task } from "@/domain";
import type { TeamMember } from "@/api/memberships";
import {
  Avatar,
  AvatarGroup,
  Card,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuTrigger,
  IconButton,
} from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { getAccent } from "@shared/lib/accent";
import { formatAbsoluteDate, formatExactDateTime } from "@shared/lib/dates";

export interface TaskCardProps {
  task: Task;
  column: Column;
  columns: Column[];
  members: TeamMember[];
  readOnly: boolean;
  onOpen: () => void;
  onMoveTo: (columnId: string) => void;
}

/**
 * Carte d'une étape (doc 04 §11) : le titre d'abord, le reste seulement s'il
 * existe (échéance, assignés) pour que la colonne reste calme. Le domaine ne
 * modélise aucun niveau d'urgence, et l'échéance (R-K6) est affichée neutre,
 * sans alerte même dépassée. Le menu ⋮ porte l'alternative clavier au
 * glisser-déposer ("Déplacer vers…"), révélé au survol/focus et toujours
 * visible au tactile.
 */
export function TaskCard({
  task,
  column,
  columns,
  members,
  readOnly,
  onOpen,
  onMoveTo,
}: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const didDragRef = useRef(false);
  const assignees = members.filter((m) => task.assigneeIds.includes(m.userId));
  const otherColumns = columns.filter((c) => c.id !== column.id);
  const canMove = !readOnly && otherColumns.length > 0;

  return (
    <Card
      variant="interactive"
      data-accent={column.color ?? getAccent(column.id)}
      draggable={!readOnly}
      tabIndex={0}
      onDragStart={(e) => {
        if (readOnly) return;
        didDragRef.current = true;
        setIsDragging(true);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.id);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setTimeout(() => {
          didDragRef.current = false;
        }, 50);
      }}
      onClick={() => {
        if (!didDragRef.current) onOpen();
      }}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && e.key === "Enter") onOpen();
      }}
      className={cn(
        "group select-none px-4 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-body-md font-medium leading-snug text-foreground">
          {task.title}
        </p>
        {canMove && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <IconButton
                  aria-label={`Actions sur « ${task.title} »`}
                  size="xs"
                  className="-mr-1.5 -mt-0.5 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                />
              }
            >
              <MoreVertical size={15} />
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuPositioner>
                {/* Les clics d'un portail remontent à la carte (arbre React) : on les coupe. */}
                <DropdownMenuPopup onClick={(e) => e.stopPropagation()}>
                  {otherColumns.map((c) => (
                    <DropdownMenuItem key={c.id} onClick={() => onMoveTo(c.id)}>
                      <ArrowRightLeft size={14} aria-hidden />
                      Déplacer vers « {c.label} »
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuPopup>
              </DropdownMenuPositioner>
            </DropdownMenuPortal>
          </DropdownMenu>
        )}
      </div>

      {(task.dueDate || assignees.length > 0) && (
        <div className="mt-3 flex items-center justify-between gap-3 text-body-sm text-muted-foreground">
          {task.dueDate ? (
            <span
              className="flex items-center gap-1.5"
              title={formatExactDateTime(task.dueDate)}
            >
              <CalendarDays size={14} aria-hidden />
              {formatAbsoluteDate(task.dueDate)}
            </span>
          ) : (
            <span />
          )}
          {assignees.length > 0 && (
            <AvatarGroup max={3}>
              {assignees.map((m) => (
                <Avatar
                  key={m.userId}
                  name={m.user.displayName ?? m.user.username}
                  src={m.user.avatar}
                  size="sm"
                />
              ))}
            </AvatarGroup>
          )}
        </div>
      )}
    </Card>
  );
}
