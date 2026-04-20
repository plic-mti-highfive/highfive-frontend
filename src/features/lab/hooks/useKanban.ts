import { useState } from 'react'
import type { KanbanColumnId, KanbanTask } from '../types'

const INITIAL_TASKS: Record<KanbanColumnId, KanbanTask[]> = {
  todo: [
    {
      id: '1',
      title: 'Définir le périmètre du projet',
      tags: ['planning'],
      assignee: 'Alice M.',
      priority: 'high',
      checklistItems: [
        { id: 'c1-1', text: 'Définir les objectifs', done: true },
        { id: 'c1-2', text: 'Identifier les parties prenantes', done: true },
        { id: 'c1-3', text: 'Rédiger le cahier des charges', done: false },
        { id: 'c1-4', text: 'Valider le budget', done: false },
        { id: 'c1-5', text: 'Planifier les jalons', done: false },
      ],
      taskComments: [],
    },
    {
      id: '2',
      title: 'Créer les maquettes UI',
      tags: ['design'],
      assignee: 'Lucas T.',
      priority: 'medium',
      checklistItems: [],
      taskComments: [
        { id: 'cm2-1', author: 'Alice M.', text: 'Utiliser les composants du Design System !', createdAt: '2026-04-18T10:00:00Z' },
        { id: 'cm2-2', author: 'Lucas T.', text: 'Bien noté, je commence par le dashboard.', createdAt: '2026-04-18T11:30:00Z' },
        { id: 'cm2-3', author: 'Sara K.',  text: 'Prévoir la vue mobile aussi.', createdAt: '2026-04-19T09:15:00Z' },
      ],
    },
  ],
  'in-progress': [
    {
      id: '3',
      title: 'Développer le backend API',
      tags: ['dev'],
      assignee: 'Alice M.',
      priority: 'high',
      checklistItems: [
        { id: 'c3-1', text: 'Setup Express + TypeScript', done: true },
        { id: 'c3-2', text: 'Endpoints authentification', done: false },
        { id: 'c3-3', text: 'Endpoints projets', done: false },
        { id: 'c3-4', text: 'Tests unitaires', done: false },
      ],
      taskComments: [
        { id: 'cm3-1', author: 'Lucas T.', text: 'Est-ce que tu peux documenter les routes ?', createdAt: '2026-04-19T14:00:00Z' },
        { id: 'cm3-2', author: 'Alice M.', text: 'Oui, je vais utiliser Swagger.', createdAt: '2026-04-19T15:00:00Z' },
      ],
    },
  ],
  review: [
    {
      id: '4',
      title: 'Tester les formulaires',
      tags: ['QA'],
      assignee: 'Lucas T.',
      priority: 'low',
      checklistItems: [],
      taskComments: [
        { id: 'cm4-1', author: 'Sara K.', text: "J'ai trouvé un bug sur le formulaire de contact.", createdAt: '2026-04-20T08:00:00Z' },
      ],
    },
  ],
  done: [
    {
      id: '5',
      title: 'Setup du projet',
      tags: ['dev'],
      assignee: 'Alice M.',
      priority: 'medium',
      checklistItems: [
        { id: 'c5-1', text: 'Initialiser le repo Git', done: true },
        { id: 'c5-2', text: 'Setup CI/CD', done: true },
        { id: 'c5-3', text: 'Configurer ESLint + Prettier', done: true },
      ],
      taskComments: [],
    },
  ],
}

export function useKanban() {
  const [tasks, setTasks] = useState<Record<KanbanColumnId, KanbanTask[]>>(INITIAL_TASKS)

  function addTask(columnId: KanbanColumnId, title: string) {
    if (!title.trim()) return
    const newTask: KanbanTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      checklistItems: [],
      taskComments: [],
    }
    setTasks(prev => ({
      ...prev,
      [columnId]: [...prev[columnId], newTask],
    }))
  }

  function moveTask(taskId: string, from: KanbanColumnId, to: KanbanColumnId) {
    if (from === to) return
    setTasks(prev => {
      const task = prev[from].find(t => t.id === taskId)
      if (!task) return prev
      return {
        ...prev,
        [from]: prev[from].filter(t => t.id !== taskId),
        [to]: [...prev[to], task],
      }
    })
  }

  function deleteTask(taskId: string, columnId: KanbanColumnId) {
    setTasks(prev => ({
      ...prev,
      [columnId]: prev[columnId].filter(t => t.id !== taskId),
    }))
  }

  function updateTask(taskId: string, columnId: KanbanColumnId, updates: Partial<KanbanTask>) {
    setTasks(prev => ({
      ...prev,
      [columnId]: prev[columnId].map(t => t.id === taskId ? { ...t, ...updates } : t),
    }))
  }

  return { tasks, addTask, moveTask, deleteTask, updateTask }
}

