import type { TaskDto } from '@/api/types'
import { TaskStatus } from '@/api/types'

interface TaskCardProps {
  task: TaskDto
  assigneeName?: string
}

export function TaskCard({ task, assigneeName }: TaskCardProps) {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case TaskStatus.IN_REVIEW:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case TaskStatus.DONE:
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'À faire'
      case TaskStatus.IN_PROGRESS:
        return 'En cours'
      case TaskStatus.IN_REVIEW:
        return 'En révision'
      case TaskStatus.DONE:
        return 'Terminé'
      default:
        return status
    }
  }

  return (
    <div className="p-4 bg-card border border-border rounded-lg hover:border-border/60 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-medium text-foreground flex-1">{task.title}</h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(task.status)}`}
        >
          {getStatusLabel(task.status)}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {assigneeName && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Assigné à</span>
          <span className="font-medium text-foreground">{assigneeName}</span>
        </div>
      )}
    </div>
  )
}
