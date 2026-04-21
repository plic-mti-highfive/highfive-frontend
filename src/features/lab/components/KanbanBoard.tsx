import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { KanbanColumn } from './KanbanColumn'
import type { KanbanColumnDef, KanbanColumnId, KanbanTask } from '../types'

interface KanbanBoardProps {
  columns: KanbanColumnDef[]
  tasks: Record<KanbanColumnId, KanbanTask[]>
  customTags: import('../types').CustomTag[]
  addTask: (columnId: KanbanColumnId, title: string) => void
  moveTask: (taskId: string, from: KanbanColumnId, to: KanbanColumnId) => void
  deleteTask: (taskId: string, columnId: KanbanColumnId) => void
  onOpenTask: (taskId: string, columnId: KanbanColumnId) => void
  onAddColumn: (label: string) => void
  onDeleteColumn: (columnId: KanbanColumnId) => void
}

export function KanbanBoard({ columns, tasks, customTags, addTask, moveTask, deleteTask, onOpenTask, onAddColumn, onDeleteColumn }: KanbanBoardProps) {
  const dragRef = useRef<{ taskId: string; fromColumnId: KanbanColumnId } | null>(null)
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColLabel, setNewColLabel] = useState('')

  const handleDragStart = (taskId: string, columnId: KanbanColumnId) => {
    dragRef.current = { taskId, fromColumnId: columnId }
  }

  const handleDrop = (targetColumnId: KanbanColumnId) => {
    if (!dragRef.current) return
    const { taskId, fromColumnId } = dragRef.current
    moveTask(taskId, fromColumnId, targetColumnId)
    dragRef.current = null
  }

  function submitNewColumn() {
    if (newColLabel.trim()) {
      onAddColumn(newColLabel.trim())
    }
    setNewColLabel('')
    setAddingColumn(false)
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 items-start" style={{ minWidth: 'max-content' }}>
        {columns.map(col => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            accentColor={col.accentColor}
            bgColor={col.bgColor}
            customTags={customTags}
            tasks={tasks[col.id] ?? []}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onOpenTask={onOpenTask}
            onDeleteColumn={onDeleteColumn}
          />
        ))}

        {/* Add column */}
        <div className="shrink-0" style={{ minWidth: '220px' }}>
          {addingColumn ? (
            <div className="bg-white/70 rounded-2xl border-2 border-dashed border-[var(--color-cream-mid)] p-4 space-y-2">
              <input
                autoFocus
                type="text"
                value={newColLabel}
                onChange={e => setNewColLabel(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') submitNewColumn()
                  if (e.key === 'Escape') { setAddingColumn(false); setNewColLabel('') }
                }}
                placeholder="Nom de la colonne…"
                className="w-full text-body-md text-[var(--color-ink)] bg-transparent outline-none placeholder:text-[var(--color-ink-muted)]"
              />
              <div className="flex gap-2">
                <button
                  onClick={submitNewColumn}
                  className="flex-1 py-1.5 rounded-lg text-ui-sm font-semibold bg-[var(--color-ink)] text-white cursor-pointer hover:opacity-80"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => { setAddingColumn(false); setNewColLabel('') }}
                  className="px-3 py-1.5 rounded-lg text-ui-sm text-[var(--color-ink-muted)] hover:bg-black/8 cursor-pointer transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl border-2 border-dashed border-[var(--color-cream-mid)] text-body-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-muted)] transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Nouvelle colonne
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
