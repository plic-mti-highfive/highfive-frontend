import { useState } from 'react'
import type { KanbanColumnId, KanbanTicket, KanbanColumnDef, CustomTag } from '../types'
import { DEFAULT_COLUMNS } from '../utils/kanbanConfig'

const INITIAL_COLUMNS: KanbanColumnDef[] = DEFAULT_COLUMNS.map(c => ({ ...c, bgColor: c.bgColor }))

const INITIAL_TAGS: CustomTag[] = [
  { id: 'tag-1', label: 'Idée',       color: '#3EC6F5' },
  { id: 'tag-2', label: 'Urgent',     color: '#E0305A' },
  { id: 'tag-3', label: 'Recherche',  color: '#C24BFF' },
  { id: 'tag-4', label: 'Créatif',    color: '#FF6B1A' },
]

const INITIAL_TICKETS: Record<KanbanColumnId, KanbanTicket[]> = {
  todo: [
    {
      id: '1',
      title: 'Définir le périmètre du projet',
      tags: ['tag-1', 'tag-3'],
      assignee: 'Alice M.',
      priority: 'high',
      checklistItems: [
        { id: 'c1-1', text: 'Définir les objectifs', done: true },
        { id: 'c1-2', text: 'Identifier les parties prenantes', done: true },
        { id: 'c1-3', text: 'Rédiger le cahier des charges', done: false },
        { id: 'c1-4', text: 'Valider le budget', done: false },
        { id: 'c1-5', text: 'Planifier les jalons', done: false },
      ],
      ticketComments: [],
    },
    {
      id: '2',
      title: 'Préparer les visuels',
      tags: ['tag-4'],
      assignee: 'Lucas T.',
      priority: 'medium',
      checklistItems: [],
      ticketComments: [
        { id: 'cm2-1', author: 'Alice M.', text: 'Penser à inclure les contraintes de format.', createdAt: '2026-04-18T10:00:00Z' },
        { id: 'cm2-2', author: 'Lucas T.', text: 'Noté, je commence par les formats mobiles.', createdAt: '2026-04-18T11:30:00Z' },
        { id: 'cm2-3', author: 'Sara K.',  text: 'Prévoir aussi la version print.', createdAt: '2026-04-19T09:15:00Z' },
      ],
    },
  ],
  'in-progress': [
    {
      id: '3',
      title: 'Rédiger le contenu principal',
      tags: ['tag-3'],
      assignee: 'Alice M.',
      priority: 'high',
      checklistItems: [
        { id: 'c3-1', text: 'Introduction', done: true },
        { id: 'c3-2', text: 'Section 1', done: false },
        { id: 'c3-3', text: 'Section 2', done: false },
        { id: 'c3-4', text: 'Conclusion', done: false },
      ],
      ticketComments: [
        { id: 'cm3-1', author: 'Lucas T.', text: 'Est-ce qu\'on a validé le ton éditorial ?', createdAt: '2026-04-19T14:00:00Z' },
        { id: 'cm3-2', author: 'Alice M.', text: 'Oui, on part sur quelque chose de chaleureux.', createdAt: '2026-04-19T15:00:00Z' },
      ],
    },
  ],
  done: [
    {
      id: '4',
      title: 'Réunion de lancement',
      tags: ['tag-2'],
      assignee: 'Lucas T.',
      priority: 'low',
      checklistItems: [
        { id: 'c4-1', text: 'Préparer l\'ordre du jour', done: true },
        { id: 'c4-2', text: 'Envoyer les invitations', done: true },
        { id: 'c4-3', text: 'Rédiger le compte-rendu', done: true },
      ],
      ticketComments: [
        { id: 'cm4-1', author: 'Sara K.', text: 'Très bonne réunion, tout était clair !', createdAt: '2026-04-20T08:00:00Z' },
      ],
    },
  ],
}

export function useKanban() {
  const [columns, setColumns] = useState<KanbanColumnDef[]>(INITIAL_COLUMNS)
  const [customTags, setCustomTags] = useState<CustomTag[]>(INITIAL_TAGS)
  const [tickets, setTickets] = useState<Record<KanbanColumnId, KanbanTicket[]>>(INITIAL_TICKETS)

  function addTicket(columnId: KanbanColumnId, title: string) {
    if (!title.trim()) return
    const newTicket: KanbanTicket = {
      id: crypto.randomUUID(),
      title: title.trim(),
      checklistItems: [],
      ticketComments: [],
    }
    setTickets(prev => ({
      ...prev,
      [columnId]: [...(prev[columnId] ?? []), newTicket],
    }))
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
