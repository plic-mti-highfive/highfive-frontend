import { useState, useEffect } from 'react'
import type { KanbanColumnId, KanbanTicket, KanbanColumnDef, CustomTag } from '../types'
import { DEFAULT_COLUMNS } from '../utils/kanbanConfig'
import { projectService } from '@/api'
import { TicketStatus } from '@plic-mti-highfive/shared-types'
import type { TicketDto } from '@/api/types'

const INITIAL_COLUMNS: KanbanColumnDef[] = DEFAULT_COLUMNS.map(c => ({ ...c, bgColor: c.bgColor }))

const INITIAL_TAGS: CustomTag[] = [
  { id: 'tag-1', label: 'Idée',       color: '#3EC6F5' },
  { id: 'tag-2', label: 'Urgent',     color: '#E0305A' },
  { id: 'tag-3', label: 'Recherche',  color: '#C24BFF' },
  { id: 'tag-4', label: 'Créatif',    color: '#FF6B1A' },
]

function ticketStatusToColumnId(status: TicketStatus): KanbanColumnId {
  switch (status) {
    case TicketStatus.TODO: return 'todo'
    case TicketStatus.IN_PROGRESS: return 'in-progress'
    case TicketStatus.IN_REVIEW: return 'in-progress'
    case TicketStatus.DONE: return 'done'
    default: return 'todo'
  }
}

function columnIdToTicketStatus(columnId: KanbanColumnId): TicketStatus {
  switch (columnId) {
    case 'todo': return TicketStatus.TODO
    case 'in-progress': return TicketStatus.IN_PROGRESS
    case 'done': return TicketStatus.DONE
    default: return TicketStatus.TODO
  }
}

function adaptTicket(dto: TicketDto): KanbanTicket {
  return {
    id: dto.id,
    title: dto.title,
    checklistItems: [],
    ticketComments: [],
  }
}

const EMPTY_TICKETS: Record<KanbanColumnId, KanbanTicket[]> = {
  todo: [],
  'in-progress': [],
  done: [],
}

export function useKanban(projectId?: string) {
  const [columns, setColumns] = useState<KanbanColumnDef[]>(INITIAL_COLUMNS)
  const [customTags, setCustomTags] = useState<CustomTag[]>(INITIAL_TAGS)
  const [tickets, setTickets] = useState<Record<KanbanColumnId, KanbanTicket[]>>(EMPTY_TICKETS)
  const [isLoading, setIsLoading] = useState(!!projectId)

  useEffect(() => {
    if (!projectId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    projectService.getProjectTickets(projectId)
      .then(apiTickets => {
        const grouped: Record<KanbanColumnId, KanbanTicket[]> = { todo: [], 'in-progress': [], done: [] }
        for (const dto of apiTickets) {
          const colId = ticketStatusToColumnId(dto.status)
          if (!grouped[colId]) grouped[colId] = []
          grouped[colId].push(adaptTicket(dto))
        }
        setTickets(grouped)
      })
      .catch(err => console.error('Failed to load tickets:', err))
      .finally(() => setIsLoading(false))
  }, [projectId])

  async function addTicket(columnId: KanbanColumnId, title: string) {
    if (!title.trim()) return
    if (projectId) {
      try {
        const created = await projectService.createTicket(projectId, { title: title.trim() })
        if (columnId !== 'todo') {
          await projectService.updateTicket(projectId, created.id, {
            status: columnIdToTicketStatus(columnId),
          })
        }
        setTickets(prev => ({
          ...prev,
          [columnId]: [...(prev[columnId] ?? []), adaptTicket(created)],
        }))
      } catch (err) {
        console.error('Failed to create ticket:', err)
      }
      return
    }
    const newTicket: KanbanTicket = { id: crypto.randomUUID(), title: title.trim(), checklistItems: [], ticketComments: [] }
    setTickets(prev => ({ ...prev, [columnId]: [...(prev[columnId] ?? []), newTicket] }))
  }

  function moveTicket(ticketId: string, from: KanbanColumnId, to: KanbanColumnId, toIndex?: number) {
    setTickets(prev => {
      const ticket = prev[from]?.find(t => t.id === ticketId)
      if (!ticket) return prev

      if (from === to) {
        const newList = [...prev[from]]
        const currentIndex = newList.findIndex(t => t.id === ticketId)
        if (currentIndex === -1) return prev
        newList.splice(currentIndex, 1)
        const insertIndex = toIndex !== undefined ? toIndex : newList.length
        newList.splice(insertIndex, 0, ticket)
        return { ...prev, [from]: newList }
      }

      const targetList = [...(prev[to] ?? [])]
      const insertIndex = toIndex !== undefined ? toIndex : targetList.length
      targetList.splice(insertIndex, 0, ticket)

      if (projectId && from !== to) {
        projectService.updateTicket(projectId, ticketId, {
          status: columnIdToTicketStatus(to),
        }).catch(err => console.error('Failed to update ticket status:', err))
      }

      return {
        ...prev,
        [from]: prev[from].filter(t => t.id !== ticketId),
        [to]: targetList,
      }
    })
  }

  function deleteTicket(ticketId: string, columnId: KanbanColumnId) {
    setTickets(prev => ({
      ...prev,
      [columnId]: prev[columnId].filter(t => t.id !== ticketId),
    }))
  }

  function updateTicket(ticketId: string, columnId: KanbanColumnId, updates: Partial<KanbanTicket>) {
    setTickets(prev => ({
      ...prev,
      [columnId]: prev[columnId].map(t => t.id === ticketId ? { ...t, ...updates } : t),
    }))
    if (projectId && updates.title !== undefined) {
      projectService.updateTicket(projectId, ticketId, {
        title: updates.title,
      }).catch(err => console.error('Failed to update ticket:', err))
    }
  }

  function addColumn(label: string) {
    const id = crypto.randomUUID()
    const colors = ['#A78BFA', '#34D399', '#F472B6', '#60A5FA', '#FBBF24']
    const accentColor = colors[columns.length % colors.length]
    const newCol: KanbanColumnDef = {
      id,
      label: label.trim(),
      accentColor,
      bgColor: accentColor + '18',
    }
    setColumns(prev => [...prev, newCol])
    setTickets(prev => ({ ...prev, [id]: [] }))
  }

  function deleteColumn(columnId: KanbanColumnId) {
    setColumns(prev => prev.filter(c => c.id !== columnId))
    setTickets(prev => {
      const updated = { ...prev }
      delete updated[columnId]
      return updated
    })
  }

  function addCustomTag(label: string, color: string) {
    const id = crypto.randomUUID()
    setCustomTags(prev => [...prev, { id, label: label.trim(), color }])
  }

  function deleteCustomTag(tagId: string) {
    setCustomTags(prev => prev.filter(t => t.id !== tagId))
    setTickets(prev => {
      const updated = { ...prev }
      for (const colId of Object.keys(updated)) {
        updated[colId] = updated[colId].map(t => ({
          ...t,
          tags: t.tags?.filter(id => id !== tagId),
        }))
      }
      return updated
    })
  }

  return {
    columns,
    customTags,
    tickets,
    isLoading,
    addTicket,
    moveTicket,
    deleteTicket,
    updateTicket,
    addColumn,
    deleteColumn,
    addCustomTag,
    deleteCustomTag,
  }
}
