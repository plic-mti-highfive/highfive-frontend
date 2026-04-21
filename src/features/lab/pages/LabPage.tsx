import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, LayoutTemplate, Kanban, ArrowLeft } from 'lucide-react'
import { Header } from '@features/layout'
import { Footer } from '@features/layout'
import { KanbanBoard } from '../components/KanbanBoard'
import { TaskDrawer } from '../components/TaskDrawer'
import { useKanban } from '../hooks/useKanban'
import { MOCK_MEMBERS } from '../data/members'
import { getAssigneeColor, assigneeInitials } from '../utils/kanbanConfig'
import type { KanbanColumnId } from '../types'

export default function LabPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { tasks, columns, customTags, addTask, moveTask, deleteTask, updateTask, addColumn, deleteColumn, addCustomTag } = useKanban()
  const [openTask, setOpenTask] = useState<{ taskId: string; columnId: KanbanColumnId } | null>(null)

  const { total, done } = useMemo(() => {
    const all = Object.values(tasks).flat()
    return { total: all.length, done: tasks.done.length }
  }, [tasks])

  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0

  const activeTask = openTask
    ? (tasks[openTask.columnId]?.find(t => t.id === openTask.taskId) ?? null)
    : null

  function handleDrawerMove(taskId: string, from: KanbanColumnId, to: KanbanColumnId) {
    moveTask(taskId, from, to)
    setOpenTask({ taskId, columnId: to })
  }

  return (
    <>
      <Header />
      <div className="bg-[var(--color-cream)]" style={{ height: '2.75rem' }} />
      <main className="relative z-0 min-h-screen bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-24">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-body-sm text-[var(--color-ink-muted)] mb-5">
            <Link
              to={`/project/${projectId}`}
              className="flex items-center gap-1 hover:text-[var(--color-ink)] transition-colors cursor-pointer"
            >
              <ArrowLeft size={12} />
              <span>Projet #{projectId}</span>
            </Link>
            <ChevronRight size={11} className="opacity-50" />
            <span className="text-[var(--color-ink)] font-semibold">Tableau de bord</span>
          </nav>

          {/* Project context bar */}
          <div className="flex items-center justify-between gap-6 mb-6 pb-6 border-b border-[var(--color-cream-mid)]">
            <div>
              <h1 className="text-heading-lg font-semibold text-[var(--color-ink)] mb-0.5">Tableau de bord</h1>
              <p className="text-body-sm text-[var(--color-ink-muted)]">
                Organisez les tâches de votre projet à votre façon.
              </p>
            </div>

            <div className="flex items-center gap-5">
              {/* Members */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {MOCK_MEMBERS.map(m => {
                    const c = getAssigneeColor(m.name)
                    return (
                      <span
                        key={m.name}
                        title={m.name}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-[var(--color-cream)]"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {assigneeInitials(m.name)}
                      </span>
                    )
                  })}
                </div>
                <span className="text-body-sm text-[var(--color-ink-muted)]">{MOCK_MEMBERS.length} membres</span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2.5 min-w-[120px]">
                <div className="flex-1 h-1.5 bg-[var(--color-cream-mid)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, backgroundColor: 'var(--color-apple)' }}
                  />
                </div>
                <span className="text-body-sm font-semibold text-[var(--color-ink)] tabular-nums">
                  {done}/{total}
                </span>
              </div>

              {/* Status */}
              <span className="px-3 py-1 rounded-full text-ui-sm font-bold bg-[var(--color-orange-light)] text-[var(--color-orange-dark)]">
                En cours
              </span>
            </div>
          </div>

          {/* Tool switcher */}
          <div className="flex items-center gap-2 mb-8">
            {/* Kanban — active */}
            <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[var(--color-ink)] text-white shadow-sm cursor-default select-none">
              <Kanban size={16} className="shrink-0" />
              <span className="text-ui-md font-bold">Kanban</span>
            </div>

            {/* Moodboard — inactive */}
            <Link
              to={`/project/${projectId}/moodboard`}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[var(--color-cream-mid)] text-[var(--color-ink-muted)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--color-ink)] transition-colors select-none"
            >
              <LayoutTemplate size={16} className="shrink-0" />
              <span className="text-ui-md font-bold">Moodboard</span>
            </Link>
          </div>

          {/* Kanban board */}
          <KanbanBoard
            columns={columns}
            tasks={tasks}
            customTags={customTags}
            addTask={addTask}
            moveTask={moveTask}
            deleteTask={deleteTask}
            onOpenTask={(taskId, columnId) => setOpenTask({ taskId, columnId })}
            onAddColumn={addColumn}
            onDeleteColumn={deleteColumn}
          />

        </div>
      </main>
      <Footer />

      <TaskDrawer
        task={activeTask}
        columnId={openTask?.columnId ?? null}
        isOpen={openTask !== null}
        members={MOCK_MEMBERS}
        columns={columns}
        customTags={customTags}
        onClose={() => setOpenTask(null)}
        onUpdate={updateTask}
        onMoveColumn={handleDrawerMove}
        onDelete={(id, col) => { deleteTask(id, col); setOpenTask(null) }}
        onAddTag={addCustomTag}
      />
    </>
  )
}

