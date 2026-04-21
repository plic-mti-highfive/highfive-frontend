export type KanbanColumnId = string
export type KanbanPriority = 'high' | 'medium' | 'low'

export interface CustomTag {
  id: string
  label: string
  color: string // hex, e.g. '#FF6B1A'
}

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
  tags?: string[] // tag ids
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
