import { useState, useEffect, useRef } from 'react'
import { X, Trash2, Plus, Check } from 'lucide-react'
import type { KanbanTask, KanbanColumnId, KanbanPriority, KanbanColumnDef, CustomTag, ChecklistItem, TaskComment } from '../types'
import {
  PRIORITY_CONFIG,
  TAG_COLOR_PALETTE,
  getAssigneeColor,
  assigneeInitials,
  tagBg,
} from '../utils/kanbanConfig'
import type { Member } from '../data/members'

interface TaskDrawerProps {
  task: KanbanTask | null
  columnId: KanbanColumnId | null
  isOpen: boolean
  members: Member[]
  columns: KanbanColumnDef[]
  customTags: CustomTag[]
  onClose: () => void
  onUpdate: (taskId: string, columnId: KanbanColumnId, updates: Partial<KanbanTask>) => void
  onMoveColumn: (taskId: string, from: KanbanColumnId, to: KanbanColumnId) => void
  onDelete: (taskId: string, columnId: KanbanColumnId) => void
  onAddTag: (label: string, color: string) => void
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
      <div className="flex items-center justify-between mb-1.5">
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
  columns,
  customTags,
  onClose,
  onUpdate,
  onMoveColumn,
  onDelete,
  onAddTag,
}: TaskDrawerProps) {
  const [title, setTitle] = useState('')
  const [newChecklistText, setNewChecklistText] = useState('')
  const [newComment, setNewComment] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [newTagLabel, setNewTagLabel] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLOR_PALETTE[0])
  const [showTagForm, setShowTagForm] = useState(false)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  // Keep last known task/column so the panel content stays visible during close animation
  const lastTaskRef = useRef<KanbanTask | null>(null)
  const lastColumnIdRef = useRef<KanbanColumnId | null>(null)
  if (task) lastTaskRef.current = task
  if (columnId) lastColumnIdRef.current = columnId
  const visibleTask = lastTaskRef.current
  const visibleColumnId = lastColumnIdRef.current

  // Sync title on task change, reset confirmation state
  useEffect(() => {
    setTitle(task?.title ?? '')
    setDeleteConfirm(false)
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

  const colMeta = columns.find(c => c.id === visibleColumnId) ?? columns[0]
  const checklistDone = visibleTask?.checklistItems?.filter(i => i.done).length ?? 0
  const checklistTotal = visibleTask?.checklistItems?.length ?? 0
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0
  const commentsCount = visibleTask?.taskComments?.length ?? 0

  function saveTitle() {
    if (!visibleTask || !visibleColumnId) return
    const trimmed = title.trim()
    if (trimmed && trimmed !== visibleTask.title) {
      onUpdate(visibleTask.id, visibleColumnId, { title: trimmed })
    } else {
      setTitle(visibleTask.title)
    }
  }

  function togglePriority(p: KanbanPriority) {
    if (!visibleTask || !visibleColumnId) return
    onUpdate(visibleTask.id, visibleColumnId, { priority: visibleTask.priority === p ? undefined : p })
  }

  function toggleAssignee(name: string) {
    if (!visibleTask || !visibleColumnId) return
    onUpdate(visibleTask.id, visibleColumnId, { assignee: visibleTask.assignee === name ? undefined : name })
  }

  function toggleChecklistItem(itemId: string) {
    if (!visibleTask || !visibleColumnId) return
    onUpdate(visibleTask.id, visibleColumnId, {
      checklistItems: (visibleTask.checklistItems ?? []).map(i =>
        i.id === itemId ? { ...i, done: !i.done } : i
      ),
    })
  }

  function deleteChecklistItem(itemId: string) {
    if (!visibleTask || !visibleColumnId) return
    onUpdate(visibleTask.id, visibleColumnId, {
      checklistItems: (visibleTask.checklistItems ?? []).filter(i => i.id !== itemId),
    })
  }

  function addChecklistItem(e: React.FormEvent) {
    e.preventDefault()
    if (!visibleTask || !visibleColumnId || !newChecklistText.trim()) return
    const item: ChecklistItem = { id: crypto.randomUUID(), text: newChecklistText.trim(), done: false }
    onUpdate(visibleTask.id, visibleColumnId, { checklistItems: [...(visibleTask.checklistItems ?? []), item] })
    setNewChecklistText('')
  }

  function addComment(e: React.FormEvent) {
    e.preventDefault()
    if (!visibleTask || !visibleColumnId || !newComment.trim()) return
    const comment: TaskComment = {
      id: crypto.randomUUID(),
      author: 'Alice M.',
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    }
    onUpdate(visibleTask.id, visibleColumnId, { taskComments: [...(visibleTask.taskComments ?? []), comment] })
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
          shadow-[-8px_0_40px_rgba(0,0,0,0.12)]
          transition-[transform,opacity] duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[40px] opacity-0 pointer-events-none'}
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
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-cream)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-cream-dark)] transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X size={15} />
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
            spellCheck={false}
            rows={1}
            className="w-full resize-none overflow-hidden text-heading-md font-semibold text-[var(--color-ink)] bg-transparent outline-none placeholder:text-[var(--color-ink-muted)] leading-snug hover:bg-[var(--color-cream)] focus:bg-[var(--color-cream)] rounded-lg px-2.5 py-1.5 -mx-2.5 transition-colors"
          />
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Column move */}
          <Section label="Colonne">
            <div className="flex flex-wrap gap-1.5">
              {columns.map(col => {
                const isActive = col.id === visibleColumnId
                return (
                  <button
                    key={col.id}
                    onClick={() => !isActive && visibleTask && visibleColumnId && onMoveColumn(visibleTask.id, visibleColumnId, col.id)}
                    disabled={isActive}
                    className={`text-ui-sm px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      isActive ? 'cursor-default' : 'cursor-pointer hover:opacity-90 active:scale-[0.97]'
                    }`}
                    style={{
                      backgroundColor: isActive ? col.accentColor : col.accentColor + '20',
                      color: isActive ? 'white' : col.accentColor,
                    }}
                  >
                    {col.label}
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
                const isActive = visibleTask?.priority === p
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
                const isActive = visibleTask?.assignee === m.name
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
          <Section label="Étiquettes">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {customTags.map(tag => {
                const isActive = visibleTask?.tags?.includes(tag.id) ?? false
                return (
                  <button
                    key={tag.id}
                    onClick={() => {
                      if (!visibleTask || !visibleColumnId) return
                      const current = visibleTask.tags ?? []
                      onUpdate(visibleTask.id, visibleColumnId, {
                        tags: isActive ? current.filter(id => id !== tag.id) : [...current, tag.id],
                      })
                    }}
                    className={`inline-flex items-center gap-1 text-label font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all active:scale-[0.97] border ${
                      isActive ? 'border-current' : 'border-transparent opacity-40 hover:opacity-75'
                    }`}
                    style={{ backgroundColor: tagBg(tag.color), color: tag.color }}
                  >
                    {isActive && <Check size={8} strokeWidth={3} />}
                    {tag.label}
                  </button>
                )
              })}
            </div>
            {/* Create new tag */}
            {showTagForm ? (
              <div className="flex items-center gap-2 bg-[var(--color-cream)] rounded-xl px-3 py-2">
                <input
                  autoFocus
                  type="text"
                  value={newTagLabel}
                  onChange={e => setNewTagLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') { setShowTagForm(false); setNewTagLabel('') } }}
                  placeholder="Nom de l'étiquette…"
                  className="flex-1 text-body-sm text-[var(--color-ink)] bg-transparent outline-none placeholder:text-[var(--color-ink-muted)]"
                />
                {/* Color picker */}
                <div className="flex gap-1">
                  {TAG_COLOR_PALETTE.slice(0, 5).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTagColor(c)}
                      className={`w-4 h-4 rounded-full cursor-pointer transition-transform ${
                        newTagColor === c ? 'scale-125 ring-2 ring-offset-1 ring-current' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c, color: c }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!newTagLabel.trim()}
                  onClick={() => {
                    if (!newTagLabel.trim()) return
                    onAddTag(newTagLabel.trim(), newTagColor)
                    setNewTagLabel('')
                    setShowTagForm(false)
                  }}
                  className="text-ui-sm font-semibold px-2.5 py-1 rounded-lg border border-[var(--color-cream-mid)] text-[var(--color-ink)] bg-white cursor-pointer hover:bg-[var(--color-cream-dark)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Créer
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTagForm(true)}
                className="inline-flex items-center gap-1.5 text-body-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer transition-colors"
              >
                <Plus size={12} />
                Nouvelle étiquette
              </button>
            )}
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
              {visibleTask?.checklistItems?.map(item => (
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
              <form onSubmit={addChecklistItem} className="mt-1.5">
                <div className="flex items-center gap-2 bg-[var(--color-cream)] rounded-xl px-3 py-2 border border-transparent focus-within:border-[var(--color-cream-mid)] transition-colors">
                  <Plus size={13} className="shrink-0 text-[var(--color-ink-muted)]" />
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={e => setNewChecklistText(e.target.value)}
                    placeholder="Nouvel élément…"
                    className="flex-1 text-body-sm text-[var(--color-ink)] bg-transparent outline-none placeholder:text-[var(--color-ink-muted)]"
                  />
                  <button
                    type="submit"
                    disabled={!newChecklistText.trim()}
                    className="shrink-0 text-ui-sm font-semibold px-3 py-1 rounded-lg border border-[var(--color-cream-mid)] text-[var(--color-ink)] bg-white cursor-pointer transition-all hover:bg-[var(--color-cream-dark)] hover:border-[var(--color-ink-muted)] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </Section>

          {/* Divider */}
          <div className="border-t border-[var(--color-cream-mid)]" />

          {/* Comments */}
          <Section label={`Commentaires${commentsCount > 0 ? ` · ${commentsCount}` : ''}`}>
            {visibleTask?.taskComments && visibleTask.taskComments.length > 0 && (
              <div className="space-y-4 mb-4">
                {visibleTask.taskComments.map(comment => {
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

        {/* ── Footer / Danger zone ── */}
        <div className={`flex-none px-6 py-4 border-t transition-colors ${deleteConfirm ? 'border-red-200 bg-red-50/60' : 'border-[var(--color-cream-mid)]'}`}>
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 text-body-sm text-[var(--color-ink-muted)] hover:text-red-500 cursor-pointer transition-colors"
            >
              <Trash2 size={14} />
              Supprimer la tâche
            </button>
          ) : (
            <div className="space-y-2.5">
              <p className="text-body-sm font-semibold text-red-600">Supprimer définitivement cette tâche ?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 text-ui-sm font-semibold py-2 rounded-xl border border-[var(--color-cream-mid)] text-[var(--color-ink)] hover:bg-[var(--color-cream)] cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => { if (visibleTask && visibleColumnId) { onDelete(visibleTask.id, visibleColumnId); onClose() } }}
                  className="flex-1 text-ui-sm font-semibold py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-colors active:scale-[0.97]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
