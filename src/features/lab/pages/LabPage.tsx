import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, LayoutTemplate, Kanban, ArrowLeft, Sparkles } from 'lucide-react'
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
  const { tasks, addTask, moveTask, deleteTask, updateTask } = useKanban()
  const [canvaNotified, setCanvaNotified] = useState(false)
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
            <span className="text-[var(--color-ink)] font-semibold">Lab</span>
          </nav>

          {/* Project context bar */}
          <div className="flex items-center justify-between gap-6 mb-6 pb-6 border-b border-[var(--color-cream-mid)]">
            <div>
              <h1 className="text-heading-lg font-semibold text-[var(--color-ink)] mb-0.5">Lab</h1>
              <p className="text-body-sm text-[var(--color-ink-muted)]">
                Gérez les tâches de votre projet collaboratif.
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
          <div className="flex items-stretch gap-3 mb-8">
            {/* Kanban — active */}
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[var(--color-ink)] text-white shadow-md cursor-default select-none min-w-[200px]">
              <Kanban size={18} className="shrink-0" />
              <div>
                <div className="text-ui-md font-bold">Kanban</div>
                <div className="text-[11px] opacity-50 mt-0.5">Vue par colonnes</div>
              </div>
            </div>

            {/* Canva — future, highlighted as USP */}
            <div className="group flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 border-dashed border-[var(--color-rose-mid)] bg-[var(--color-rose-light)]/40 min-w-[200px]">
              <LayoutTemplate size={18} className="shrink-0 text-[var(--color-rose)]" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-ui-md font-bold text-[var(--color-ink)]">Canva</span>
                  <span className="inline-flex items-center gap-0.5 text-label uppercase px-1.5 py-0.5 rounded-full font-bold bg-[var(--color-cream-mid)] text-[var(--color-ink-muted)]">
                    <Sparkles size={8} />
                    bientôt
                  </span>
                </div>
                <div className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">
                  Collaboration visuelle en temps réel
                </div>
              </div>
              <button
                onClick={() => setCanvaNotified(true)}
                disabled={canvaNotified}
                className={`shrink-0 text-ui-sm font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)] ${
                  canvaNotified
                    ? 'bg-[var(--color-apple-light)] text-[var(--color-apple-dark)] cursor-default'
                    : 'bg-[var(--color-rose)] text-white hover:bg-[var(--color-rose-dark)] active:scale-[0.97]'
                }`}
              >
                {canvaNotified ? '✓ Notifié' : 'Me notifier'}
              </button>
            </div>
          </div>

          {/* Kanban board */}
          <KanbanBoard
            tasks={tasks}
            addTask={addTask}
            moveTask={moveTask}
            deleteTask={deleteTask}
            onOpenTask={(taskId, columnId) => setOpenTask({ taskId, columnId })}
          />

        </div>
      </main>
      <Footer />

      <TaskDrawer
        task={activeTask}
        columnId={openTask?.columnId ?? null}
        isOpen={openTask !== null}
        members={MOCK_MEMBERS}
        onClose={() => setOpenTask(null)}
        onUpdate={updateTask}
        onMoveColumn={handleDrawerMove}
        onDelete={(id, col) => { deleteTask(id, col); setOpenTask(null) }}
      />
    </>
  )
}

