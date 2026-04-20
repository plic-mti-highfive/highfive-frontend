import { useState, useEffect, useRef } from 'react'
import { X, Trash2, Plus, Check } from 'lucide-react'
import type { KanbanTask, KanbanColumnId, KanbanPriority, ChecklistItem, TaskComment } from '../types'
import {
  PRIORITY_CONFIG,
  COLUMN_META,
  ALL_TAGS,
  getTagStyle,
  getAssigneeColor,
  assigneeInitials,
} from '../utils/kanbanConfig'
import type { Member } from '../data/members'

interface TaskDrawerProps {
  task: KanbanTask | null
  columnId: KanbanColumnId | null
  isOpen: boolean
  members: Member[]
  onClose: () => void
  onUpdate: (taskId: string, columnId: KanbanColumnId, updates: Partial<KanbanTask>) => void
  onMoveColumn: (taskId: string, from: KanbanColumnId, to: KanbanColumnId) => void
  onDelete: (taskId: string, columnId: KanbanColumnId) => void
}

function Section({
  label,
  aside,
  children,
}: {
  label: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-label uppercase tracking-wider font-bold text-[var(--color-ink-muted)]">{label}</p>
        {aside}
      </div>
      {children}
    </div>
  )
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}

export function TaskDrawer({
  task,
  columnId,
  isOpen,
  members,
  onClose,
  onUpdate,
  onMoveColumn,
  onDelete,
}: TaskDrawerProps) {
  const [title, setTitle] = useState('')
  const [newChecklistText, setNewChecklistText] = useState('')
  const [newComment, setNewComment] = useState('')
  const titleRef = useRef<HTMLTextAreaElement>(null)

  // Sync title on task change
  useEffect(() => {
    setTitle(task?.title ?? '')
  }, [task?.id])

  // Auto-resize title textarea
  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [title])

  // Focus title on open
  useEffect(() => {
    if (isOpen) setTimeout(() => titleRef.current?.focus(), 80)
  }, [isOpen, task?.id])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!task || !columnId) return null

  const colMeta = COLUMN_META[columnId]
  const checklistDone = task.checklistItems?.filter(i => i.done).length ?? 0
  const checklistTotal = task.checklistItems?.length ?? 0
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0
  const commentsCount = task.taskComments?.length ?? 0

  function saveTitle() {
    const trimmed = title.trim()
    if (trimmed && trimmed !== task!.title) {
      onUpdate(task!.id, columnId!, { title: trimmed })
    } else {
      setTitle(task!.title)
    }
  }

  function togglePriority(p: KanbanPriority) {
    onUpdate(task!.id, columnId!, { priority: task!.priority === p ? undefined : p })
  }

  function toggleAssignee(name: string) {
    onUpdate(task!.id, columnId!, { assignee: task!.assignee === name ? undefined : name })
  }

  function toggleTag(tag: string) {
    const current = task!.tags ?? []
    onUpdate(task!.id, columnId!, {
      tags: current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag],
    })
  }

  function toggleChecklistItem(itemId: string) {
    onUpdate(task!.id, columnId!, {
      checklistItems: (task!.checklistItems ?? []).map(i =>
        i.id === itemId ? { ...i, done: !i.done } : i
      ),
    })
  }

  function deleteChecklistItem(itemId: string) {
    onUpdate(task!.id, columnId!, {
      checklistItems: (task!.checklistItems ?? []).filter(i => i.id !== itemId),
    })
  }

  function addChecklistItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newChecklistText.trim()) return
    const item: ChecklistItem = { id: crypto.randomUUID(), text: newChecklistText.trim(), done: false }
    onUpdate(task!.id, columnId!, { checklistItems: [...(task!.checklistItems ?? []), item] })
    setNewChecklistText('')
  }

  function addComment(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return
    const comment: TaskComment = {
      id: crypto.randomUUID(),
      author: 'Alice M.',
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    }
    onUpdate(task!.id, columnId!, { taskComments: [...(task!.taskComments ?? []), comment] })
    setNewComment('')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/25 backdrop-blur-[2px] transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 h-full z-[101] bg-white flex flex-col
          shadow-[−8px_0_40px_rgba(0,0,0,0.12)]
          transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{ width: '440px', maxWidth: '100vw' }}
      >
        {/* ── Header ── */}
        <div className="flex-none px-6 pt-5 pb-5 border-b border-[var(--color-cream-mid)]">
          {/* Column badge + close */}
          <div className="flex items-center justify-between mb-4">
            <span
              className="inline-flex items-center gap-1.5 text-ui-sm font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: colMeta.accentColor + '22', color: colMeta.accentColor }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colMeta.accentColor }} />
              {colMeta.label}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-cream-dark)] transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Editable title */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveTitle(); titleRef.current?.blur() } }}
            placeholder="Titre de la tâche"
            rows={1}
            className="w-full resize-none overflow-hidden text-heading-md font-semibold text-[var(--color-ink)] bg-transparent outline-none placeholder:text-[var(--color-ink-muted)] leading-snug hover:bg-[var(--color-cream)] focus:bg-[var(--color-cream)] rounded-lg px-2.5 py-1.5 -mx-2.5 transition-colors"
          />
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Column move */}
          <Section label="Colonne">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(COLUMN_META) as KanbanColumnId[]).map(cid => {
                const meta = COLUMN_META[cid]
                const isActive = cid === columnId
                return (
                  <button
                    key={cid}
                    onClick={() => !isActive && onMoveColumn(task.id, columnId!, cid)}
                    disabled={isActive}
                    className={`text-ui-sm px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      isActive ? 'cursor-default' : 'cursor-pointer hover:opacity-90 active:scale-[0.97]'
                    }`}
                    style={{
                      backgroundColor: isActive ? meta.accentColor : meta.accentColor + '20',
                      color: isActive ? 'white' : meta.accentColor,
                    }}
                  >
                    {meta.label}
                  </button>
                )
              })}
            </div>
          </Section>

          {/* Priority */}
          <Section label="Priorité">
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as KanbanPriority[]).map(p => {
                const cfg = PRIORITY_CONFIG[p]
                const isActive = task.priority === p
                return (
                  <button
                    key={p}
                    onClick={() => togglePriority(p)}
                    className={`flex-1 text-ui-sm font-semibold py-2 rounded-xl transition-all cursor-pointer active:scale-[0.97] border ${
                      isActive ? 'shadow-sm' : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: isActive ? cfg.color + '18' : 'transparent',
                      color: isActive ? cfg.color : 'var(--color-ink-muted)',
                      borderColor: isActive ? cfg.color + '60' : 'var(--color-cream-mid)',
                    }}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </Section>

          {/* Assignee */}
          <Section label="Responsable">
            <div className="flex flex-wrap gap-2">
              {members.map(m => {
                const c = getAssigneeColor(m.name)
                const isActive = task.assignee === m.name
                return (
                  <button
                    key={m.name}
                    onClick={() => toggleAssignee(m.name)}
                    title={m.name}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-ui-sm font-semibold cursor-pointer transition-all active:scale-[0.97] border ${
                      isActive ? 'border-current' : 'border-transparent opacity-55 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.bg, color: c.text }}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ backgroundColor: c.text + '25', color: c.text }}
                    >
                      {assigneeInitials(m.name)}
                    </span>
                    {m.name}
                    {isActive && <Check size={11} strokeWidth={2.5} />}
                  </button>
                )
              })}
            </div>
          </Section>

          {/* Tags */}
          <Section label="Tags">
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.map(tag => {
                const style = getTagStyle(tag)
                const isActive = task.tags?.includes(tag) ?? false
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1 text-label uppercase font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all active:scale-[0.97] border ${
                      isActive ? 'border-current' : 'border-transparent opacity-40 hover:opacity-75'
                    }`}
                    style={{ backgroundColor: style.bg, color: style.color }}
                  >
                    {isActive && <Check size={8} strokeWidth={3} />}
                    {tag}
                  </button>
                )
              })}
            </div>
          </Section>

          {/* Divider */}
          <div className="border-t border-[var(--color-cream-mid)]" />

          {/* Checklist */}
          <Section
            label={`Checklist${checklistTotal > 0 ? ` · ${checklistDone}/${checklistTotal}` : ''}`}
            aside={
              checklistTotal > 0 ? (
                <span
                  className="text-body-sm font-bold tabular-nums"
                  style={{ color: checklistDone === checklistTotal ? '#2A8C1E' : 'var(--color-ink-muted)' }}
                >
                  {checklistPct}%
                </span>
              ) : undefined
            }
          >
            {checklistTotal > 0 && (
              <div className="h-1.5 bg-[var(--color-cream-mid)] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${checklistPct}%`,
                    backgroundColor: checklistDone === checklistTotal ? '#5ED651' : '#3EC6F5',
                  }}
                />
              </div>
            )}
            <div className="space-y-1">
              {task.checklistItems?.map(item => (
                <div key={item.id} className="group flex items-center gap-2.5 py-1 px-1 rounded-lg hover:bg-[var(--color-cream)] transition-colors">
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                      item.done
                        ? 'bg-[#5ED651] border-[#5ED651]'
                        : 'border-[var(--color-cream-mid)] hover:border-[var(--color-ink-muted)]'
                    }`}
                  >
                    {item.done && <Check size={9} strokeWidth={3} className="text-white" />}
                  </button>
                  <span className={`flex-1 text-body-sm ${item.done ? 'line-through text-[var(--color-ink-muted)]' : 'text-[var(--color-ink)]'}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--color-ink-muted)] hover:text-red-500 cursor-pointer transition-opacity"
                    aria-label="Supprimer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Add item */}
              <form onSubmit={addChecklistItem} className="flex items-center gap-2.5 py-1 px-1">
                <div className="shrink-0 w-4 h-4 rounded border-2 border-dashed border-[var(--color-cream-mid)]" />
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={e => setNewChecklistText(e.target.value)}
                  placeholder="Ajouter un élément…"
                  className="flex-1 text-body-sm text-[var(--color-ink)] bg-transparent outline-none placeholder:text-[var(--color-ink-muted)]"
                />
                {newChecklistText.trim() && (
                  <button
                    type="submit"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-ink)] text-white cursor-pointer hover:opacity-80"
                  >
                    ↵
                  </button>
                )}
              </form>
            </div>
          </Section>

          {/* Divider */}
          <div className="border-t border-[var(--color-cream-mid)]" />

          {/* Comments */}
          <Section label={`Commentaires${commentsCount > 0 ? ` · ${commentsCount}` : ''}`}>
            {task.taskComments && task.taskComments.length > 0 && (
              <div className="space-y-4 mb-4">
                {task.taskComments.map(comment => {
                  const c = getAssigneeColor(comment.author)
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <span
                        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {assigneeInitials(comment.author)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-ui-sm text-[var(--color-ink)]">
                          {comment.author}
                          <span className="text-[var(--color-ink-muted)] font-normal ml-2">{formatRelative(comment.createdAt)}</span>
                        </p>
                        <p className="text-body-sm text-[var(--color-ink)] mt-1 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <form onSubmit={addComment} className="space-y-2">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Écrire un commentaire…"
                rows={2}
                className="w-full resize-none text-body-sm text-[var(--color-ink)] bg-[var(--color-cream)] rounded-xl px-3.5 py-2.5 outline-none placeholder:text-[var(--color-ink-muted)] focus:bg-[var(--color-cream-dark)] transition-colors"
              />
              {newComment.trim() && (
                <button
                  type="submit"
                  className="text-ui-sm font-bold px-4 py-1.5 rounded-lg bg-[var(--color-ink)] text-white cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all"
                >
                  Envoyer
                </button>
              )}
            </form>
          </Section>

        </div>

        {/* ── Footer ── */}
        <div className="flex-none px-6 py-4 border-t border-[var(--color-cream-mid)]">
          <button
            onClick={() => { onDelete(task.id, columnId!); onClose() }}
            className="flex items-center gap-2 text-body-sm text-red-500 hover:text-red-600 cursor-pointer transition-colors"
          >
            <Trash2 size={14} />
            Supprimer la tâche
          </button>
        </div>
      </div>
    </>
  )
}
