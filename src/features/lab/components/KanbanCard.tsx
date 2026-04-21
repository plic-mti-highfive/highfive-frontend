import { useRef, useState } from 'react'
import { Trash2, GripVertical, ArrowUp, Minus, ArrowDown, MessageCircle, CheckSquare } from 'lucide-react'
import type { KanbanTask, KanbanColumnId, CustomTag } from '../types'
import { getAssigneeColor, assigneeInitials, PRIORITY_CONFIG, tagBg } from '../utils/kanbanConfig'

interface KanbanCardProps {
  task: KanbanTask
  columnId: KanbanColumnId
  customTags: CustomTag[]
  onDelete: (taskId: string, columnId: KanbanColumnId) => void
  onDragStart: (taskId: string, columnId: KanbanColumnId) => void
  onOpen: (taskId: string, columnId: KanbanColumnId) => void
}

const PRIORITY_ICONS = {
  high:   ArrowUp,
  medium: Minus,
  low:    ArrowDown,
}

export function KanbanCard({ task, columnId, customTags, onDelete, onDragStart, onOpen }: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const didDragRef = useRef(false)

  const priorityCfg = task.priority ? PRIORITY_CONFIG[task.priority] : null
  const PriorityIcon = task.priority ? PRIORITY_ICONS[task.priority] : null
  const checklistDone = task.checklistItems?.filter(i => i.done).length ?? 0
  const checklistTotal = task.checklistItems?.length ?? 0
  const checklistComplete = checklistTotal > 0 && checklistDone === checklistTotal
  const commentsCount = task.taskComments?.length ?? 0

  const hasFooter = checklistTotal > 0 || commentsCount > 0 || !!task.assignee

  return (
    <div
      draggable
      onDragStart={(e) => {
        didDragRef.current = true
        setIsDragging(true)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(task.id, columnId)
      }}
      onDragEnd={() => {
        setIsDragging(false)
        // reset drag flag after the click event that follows dragend
        setTimeout(() => { didDragRef.current = false }, 50)
      }}
      onClick={() => {
        if (!didDragRef.current) onOpen(task.id, columnId)
      }}
      className={`group relative bg-card rounded-xl px-3.5 py-3 border transition-all duration-150 cursor-pointer select-none
        border-border
        shadow-sm hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:border-muted-foreground
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]
        ${isDragging ? 'opacity-40 scale-[0.97] shadow-none' : ''}
      `}
    >
      {/* Top row: grip + title + delete */}
      <div className="flex items-start gap-2">
        <GripVertical
          className="shrink-0 mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-40 transition-opacity"
          size={14}
        />
        <div className="flex-1 min-w-0">
          {/* Priority icon + title */}
          <div className="flex items-start gap-1.5">
            {priorityCfg && PriorityIcon && (
              <span
                title={`Priorité ${priorityCfg.label}`}
                className="shrink-0 mt-1 inline-flex items-center justify-center"
              >
                <PriorityIcon size={11} strokeWidth={2.5} style={{ color: priorityCfg.color }} />
              </span>
            )}
            <p className="text-body-md font-medium text-foreground leading-snug">{task.title}</p>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(task.id, columnId) }}
          className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 cursor-pointer p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          aria-label="Supprimer la tâche"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Tags row */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-5">
          {task.tags.map(tagId => {
            const tag = customTags.find(t => t.id === tagId)
            if (!tag) return null
            return (
              <span
                key={tagId}
                className="text-label uppercase px-2 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: tagBg(tag.color), color: tag.color }}
              >
                {tag.label}
              </span>
            )
          })}
        </div>
      )}

      {/* Footer: checklist + comments + assignee */}
      {hasFooter && (
        <div className="flex items-center justify-between gap-2 mt-2.5 ml-5">
          <div className="flex items-center gap-2.5">
            {checklistTotal > 0 && (
              <span
                className={`inline-flex items-center gap-1 text-body-sm ${checklistComplete ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                title={`Checklist : ${checklistDone}/${checklistTotal}`}
              >
                <CheckSquare size={12} />
                <span className="tabular-nums">{checklistDone}/{checklistTotal}</span>
              </span>
            )}
            {commentsCount > 0 && (
              <span
                className="inline-flex items-center gap-1 text-body-sm text-muted-foreground"
                title={`${commentsCount} commentaire${commentsCount > 1 ? 's' : ''}`}
              >
                <MessageCircle size={12} />
                <span className="tabular-nums">{commentsCount}</span>
              </span>
            )}
          </div>
          {task.assignee && (() => {
            const c = getAssigneeColor(task.assignee)
            return (
              <span
                title={task.assignee}
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: c.bg, color: c.text }}
              >
                {assigneeInitials(task.assignee)}
              </span>
            )
          })()}
        </div>
      )}
    </div>
  )
}
