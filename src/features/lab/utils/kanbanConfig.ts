import type { KanbanColumnId, KanbanPriority } from '../types'

export const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  planning: { bg: '#EAF7FD', color: '#0A6080' },
  design:   { bg: '#F3EAFF', color: '#7000B8' },
  dev:      { bg: '#FFF0E6', color: '#AA3A00' },
  qa:       { bg: '#FFF0F6', color: '#CC0055' },
  bug:      { bg: '#FFFBE0', color: '#6A4E00' },
  docs:     { bg: '#EDFCE8', color: '#1A7010' },
}

export const ALL_TAGS = Object.keys(TAG_STYLES)

export const PRIORITY_CONFIG: Record<KanbanPriority, { color: string; label: string }> = {
  high:   { color: '#E0305A', label: 'Haute'   },
  medium: { color: '#B85A00', label: 'Moyenne' },
  low:    { color: '#2A8C1E', label: 'Basse'   },
}

export const COLUMN_META: Record<KanbanColumnId, { label: string; accentColor: string; bgColor: string }> = {
  'todo':        { label: 'À faire',     accentColor: '#3EC6F5', bgColor: '#E5F8FF' },
  'in-progress': { label: 'En cours',    accentColor: '#FF6B1A', bgColor: '#FFF0E6' },
  'review':      { label: 'En révision', accentColor: '#C24BFF', bgColor: '#F5E8FF' },
  'done':        { label: 'Terminé',     accentColor: '#5ED651', bgColor: '#EDFCE8' },
}

const ASSIGNEE_COLORS = [
  { bg: '#FFE8F1', text: '#CC0055' },
  { bg: '#FFF0E6', text: '#AA3A00' },
  { bg: '#E5F8FF', text: '#0A6080' },
  { bg: '#F5E8FF', text: '#7000B8' },
  { bg: '#EDFCE8', text: '#1A7010' },
]

export function getTagStyle(tag: string) {
  return TAG_STYLES[tag.toLowerCase()] ?? { bg: '#EEEBE5', color: '#6A6460' }
}

export function getAssigneeColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31
  return ASSIGNEE_COLORS[Math.abs(hash) % ASSIGNEE_COLORS.length]
}

export function assigneeInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}
