import { useState } from 'react'
import { Plus, MousePointerClick, Trash2 } from 'lucide-react'
import { KanbanCard } from './KanbanCard'
import type { KanbanTask, KanbanColumnId, CustomTag } from '../types'

interface KanbanColumnProps {
  id: KanbanColumnId
  label: string
  accentColor: string
  bgColor: string
  tasks: KanbanTask[]
  customTags: CustomTag[]
  onAddTask: (columnId: KanbanColumnId, title: string) => void
  onDeleteTask: (taskId: string, columnId: KanbanColumnId) => void
  onDragStart: (taskId: string, columnId: KanbanColumnId) => void
  onDrop: (targetColumnId: KanbanColumnId) => void
  onOpenTask: (taskId: string, columnId: KanbanColumnId) => void
  onDeleteColumn: (columnId: KanbanColumnId) => void
}

export function KanbanColumn({
  id,
  label,
  accentColor,
  bgColor,
  tasks,
  customTags,
  onAddTask,
  onDeleteTask,
  onDragStart,
  onDrop,
  onOpenTask,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSubmit = () => {
    if (newTitle.trim()) {
      onAddTask(id, newTitle)
      setNewTitle('')
    }
    setAdding(false)
  }

  const isEmpty = tasks.length === 0 && !adding

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsOver(false)
        }
      }}
      onDrop={() => {
        setIsOver(false)
        onDrop(id)
      }}
      className={`flex flex-col rounded-2xl transition-all duration-150 ${
        isOver ? 'ring-2 ring-[var(--color-rose)] ring-offset-2 ring-offset-[var(--color-cream)]' : ''
      }`}
      style={{ backgroundColor: bgColor, minWidth: '260px', minHeight: '220px' }}
    >
      {/* Column header */}
      <div className="group/header flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-ui-md text-[var(--color-ink)]">{label}</span>
          <span
            className="text-label font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
            style={{ backgroundColor: accentColor + '28', color: accentColor }}
          >
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Delete column button — hover reveal */}
          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-body-sm text-[var(--color-ink-muted)]">Supprimer ?</span>
              <button
                onClick={() => onDeleteColumn(id)}
                className="text-ui-sm font-semibold px-2 py-0.5 rounded-lg bg-red-500 text-white cursor-pointer hover:bg-red-600 transition-colors"
              >
                Oui
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-ui-sm font-semibold px-2 py-0.5 rounded-lg border border-[var(--color-cream-mid)] text-[var(--color-ink-muted)] cursor-pointer hover:bg-[var(--color-cream)] transition-colors"
              >
                Non
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="opacity-0 group-hover/header:opacity-100 p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-red-500 hover:bg-red-50 cursor-pointer transition-all"
              aria-label={`Supprimer la colonne ${label}`}
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-ui-sm font-bold transition-all cursor-pointer hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]"
            style={{ backgroundColor: accentColor + '22', color: accentColor }}
            aria-label={`Ajouter une tâche dans ${label}`}
          >
            <Plus size={12} strokeWidth={2.5} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 flex flex-col gap-2.5 px-3 pb-3">

        {/* Empty state */}
        {isEmpty && (
          <div
            className="flex flex-col items-center justify-center py-7 px-4 rounded-xl border-2 border-dashed text-center transition-colors"
            style={{ borderColor: accentColor + '50' }}
          >
            <MousePointerClick size={20} className="mb-2 opacity-40" style={{ color: accentColor }} />
            <p className="text-body-sm font-medium text-[var(--color-ink)] mb-1">Aucune tâche</p>
            <p className="text-body-sm text-[var(--color-ink-muted)] mb-3 leading-snug">Ajoutez une tâche pour démarrer !</p>
            <button
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 text-ui-sm font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ backgroundColor: accentColor + '20', color: accentColor }}
            >
              <Plus size={12} />
              Ajouter une tâche
            </button>
          </div>
        )}

        {tasks.map(task => (
          <KanbanCard
            key={task.id}
            task={task}
            columnId={id}
            customTags={customTags}
            onDelete={onDeleteTask}
            onDragStart={onDragStart}
            onOpen={onOpenTask}
          />
        ))}

        {/* Inline add form */}
        {adding ? (
          <div className="bg-white rounded-xl border border-[var(--color-cream-mid)] p-3 shadow-sm">
            <textarea
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
                if (e.key === 'Escape') {
                  setAdding(false)
                  setNewTitle('')
                }
              }}
              placeholder="Titre de la tâche…"
              rows={2}
              className="w-full resize-none text-body-md text-[var(--color-ink)] bg-transparent outline-none placeholder:text-[var(--color-ink-muted)] focus-visible:outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSubmit}
                className="flex-1 text-ui-md py-1.5 rounded-lg text-white bg-[var(--color-ink)] hover:opacity-80 active:opacity-70 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)]"
              >
                Ajouter
              </button>
              <button
                onClick={() => {
                  setAdding(false)
                  setNewTitle('')
                }}
                className="px-3 py-1.5 rounded-lg text-ui-md text-[var(--color-ink-muted)] hover:bg-black/8 hover:text-[var(--color-ink)] active:bg-black/12 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink-muted)]"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          !isEmpty && (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] text-body-sm py-2 px-2 rounded-lg hover:bg-black/6 active:bg-black/10 transition-colors w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]"
            >
              <Plus size={13} />
              Ajouter une tâche
            </button>
          )
        )}
      </div>
    </div>
  )
}

