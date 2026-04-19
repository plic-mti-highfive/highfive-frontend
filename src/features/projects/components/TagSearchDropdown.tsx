import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'

const ALL_TAGS = [
  'C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Rust', 'Go', 'Swift',
  'Kotlin', 'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Django', 'Rails',
  'Docker', 'Kubernetes', 'AWS', 'Design UI/UX', 'Figma', 'Data Science',
  'Machine Learning', 'DevOps', 'Cybersécurité', 'Blockchain', 'Embarqué',
  'Robotique', 'Rigoureux', 'Créatif', 'Leader', 'Pédagogue', 'TensorFlow',
  'Débutant', 'Illustration',
]

interface TagSearchDropdownProps {
  selected: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  tags?: string[]
}

export function TagSearchDropdown({
  selected,
  onChange,
  maxTags = 8,
  tags = ALL_TAGS,
}: TagSearchDropdownProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = tags.filter(t =>
    t.toLowerCase().includes(query.toLowerCase())
  )

  const toggle = (tag: string) => {
    onChange(
      selected.includes(tag)
        ? selected.filter(t => t !== tag)
        : selected.length < maxTags ? [...selected, tag] : selected
    )
  }

  const remove = (tag: string) => onChange(selected.filter(t => t !== tag))

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={selected.length >= maxTags ? `Maximum ${maxTags} tags atteint` : 'Rechercher un tag…'}
          disabled={selected.length >= maxTags}
          className="
            w-full rounded-xl border border-cream-mid bg-white pl-9 pr-4 py-3
            text-sm text-ink placeholder-ink-muted
            focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent
            transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
          "
        />
        {open && (
          <button type="button" onClick={() => { setOpen(false); setQuery('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink text-lg leading-none">
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 top-full mt-1 w-full bg-white border border-cream-mid rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0
            ? <p className="text-sm text-ink-muted px-4 py-3">Aucun tag trouvé.</p>
            : filtered.map(tag => {
                const active = selected.includes(tag)
                return (
                  <button key={tag} type="button" onClick={() => toggle(tag)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                      ${active ? 'bg-cream text-ink font-medium' : 'text-ink-soft hover:bg-cream'}`}
                  >
                    <span>{tag}</span>
                    {active && <span className="text-ink font-bold text-xs">[x]</span>}
                  </button>
                )
              })
          }
        </div>
      )}

      {/* Selected pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map(tag => (
            <span key={tag}
              className="flex items-center gap-1 px-3 py-1 bg-ink text-cream text-xs font-medium rounded-full">
              {tag}
              <button type="button" onClick={() => remove(tag)}
                className="opacity-60 hover:opacity-100 transition-opacity ml-0.5 text-sm leading-none"
                aria-label={`Retirer ${tag}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-ink-muted mt-1.5">
        {selected.length} / {maxTags} tags
        {selected.length >= maxTags && <span className="text-orange"> — maximum atteint</span>}
      </p>
    </div>
  )
}
