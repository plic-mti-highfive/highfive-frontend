export type KanbanColumnId = 'todo' | 'in-progress' | 'review' | 'done'
export type KanbanPriority = 'high' | 'medium' | 'low'

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface TaskComment {
  id: string
  author: string
  text: string
  createdAt: string
}

export interface KanbanTask {
  id: string
  title: string
  tags?: string[]
  assignee?: string
  priority?: KanbanPriority
  checklistItems?: ChecklistItem[]
  taskComments?: TaskComment[]
}

export interface KanbanColumnDef {
  id: KanbanColumnId
  label: string
  accentColor: string
  bgColor: string
}
