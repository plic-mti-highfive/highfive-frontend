import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LayoutTemplate, Kanban } from 'lucide-react'
import { Header } from '@features/layout'
import { Footer } from '@features/layout'
import { KanbanBoard } from '../components/KanbanBoard'
import { TaskDrawer } from '../components/TaskDrawer'
import { useKanban } from '../hooks/useKanban'
import { MOCK_MEMBERS } from '../data/members'
import { getAssigneeColor, assigneeInitials } from '../utils/kanbanConfig'
import type { KanbanColumnId } from '../types'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

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
      <div className="bg-background" style={{ height: '2.75rem' }} />
      <main className="relative z-0 flex flex-col min-h-screen bg-background">
        <div className="flex-1 max-w-7xl w-full mx-auto px-6 pb-12">

          {/* Breadcrumb */}
          <Breadcrumb className="mb-5">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={(props) => (
                  <Link {...props} to={`/projects/${projectId}`}>
                    Projet #{projectId}
                  </Link>
                )} />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Tableau de bord</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Project context bar */}
          <div className="flex items-center justify-between gap-6 mb-6 pb-6 border-b border-border">
            <div>
              <h1 className="text-heading-lg font-semibold text-foreground">Tableau de bord</h1>
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
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-background"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {assigneeInitials(m.name)}
                      </span>
                    )
                  })}
                </div>
                <span className="text-body-sm text-muted-foreground">{MOCK_MEMBERS.length} membres</span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2.5 min-w-[120px]">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, backgroundColor: 'var(--color-apple)' }}
                  />
                </div>
                <span className="text-body-sm font-semibold text-foreground tabular-nums">
                  {done}/{total}
                </span>
              </div>

              {/* Status */}
              <span className="px-3 py-1 rounded-full text-ui-sm font-bold bg-[var(--color-orange-light)] text-[var(--color-orange-dark)] dark:bg-orange-500/20 dark:text-orange-400">
                En cours
              </span>
            </div>
          </div>

          {/* Tool switcher */}
          <div className="flex items-center gap-2 mb-8">
            {/* Kanban — active */}
            <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-foreground text-background shadow-sm cursor-default select-none">
              <Kanban size={16} className="shrink-0" />
              <span className="text-ui-md font-bold">Kanban</span>
            </div>

            {/* Moodboard — inactive */}
            <Link
              to={`/projects/${projectId}/moodboard`}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors select-none"
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

