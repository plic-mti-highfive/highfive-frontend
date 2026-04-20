import { useRef } from 'react'
import { KanbanColumn } from './KanbanColumn'
import type { KanbanColumnDef, KanbanColumnId, KanbanTask } from '../types'

interface KanbanBoardProps {
  tasks: Record<KanbanColumnId, KanbanTask[]>
  addTask: (columnId: KanbanColumnId, title: string) => void
  moveTask: (taskId: string, from: KanbanColumnId, to: KanbanColumnId) => void
  deleteTask: (taskId: string, columnId: KanbanColumnId) => void
  onOpenTask: (taskId: string, columnId: KanbanColumnId) => void
}

const COLUMNS: (KanbanColumnDef & { emptyHint: string })[] = [
  {
    id: 'todo',
    label: 'À faire',
    accentColor: '#3EC6F5',
    bgColor: '#E5F8FF',
    emptyHint: 'Ajoutez les prochaines tâches à traiter.',
  },
  {
    id: 'in-progress',
    label: 'En cours',
    accentColor: '#FF6B1A',
    bgColor: '#FFF0E6',
    emptyHint: 'Glissez une tâche ici pour la démarrer.',
  },
  {
    id: 'review',
    label: 'En révision',
    accentColor: '#C24BFF',
    bgColor: '#F5E8FF',
    emptyHint: 'Les tâches terminées en attente de validation apparaîtront ici.',
  },
  {
    id: 'done',
    label: 'Terminé',
    accentColor: '#5ED651',
    bgColor: '#EDFCE8',
    emptyHint: 'Vos tâches validées s\'accumuleront ici.',
  },
]

export function KanbanBoard({ tasks, addTask, moveTask, deleteTask, onOpenTask }: KanbanBoardProps) {
  const dragRef = useRef<{ taskId: string; fromColumnId: KanbanColumnId } | null>(null)

  const handleDragStart = (taskId: string, columnId: KanbanColumnId) => {
    dragRef.current = { taskId, fromColumnId: columnId }
  }

  const handleDrop = (targetColumnId: KanbanColumnId) => {
    if (!dragRef.current) return
    const { taskId, fromColumnId } = dragRef.current
    moveTask(taskId, fromColumnId, targetColumnId)
    dragRef.current = null
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4" style={{ minWidth: '1100px' }}>
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            accentColor={col.accentColor}
            bgColor={col.bgColor}
            emptyHint={col.emptyHint}
            tasks={tasks[col.id]}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>
    </div>
  )
}