import { useNavigate } from 'react-router-dom'
import type { Project } from '@shared/types'
import { SmallCard } from '@shared/components/projects'

interface SectionProps {
  label: string
  title: string
  projects: Project[]
  cols?: 3 | 4
}

export function Section({ label, title, projects, cols = 4 }: SectionProps) {
  const navigate = useNavigate()
  if (projects.length === 0) return null

  const displayed = projects.slice(0, cols === 3 ? 6 : 8)
  const gridClass = cols === 3
    ? 'grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'

  return (
    <section className="py-14 border-t border-border">
      <div className="flex items-end justify-between mb-8">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground">{label}</p>
          <h2 className="text-2xl font-black text-foreground tracking-tight">{title}</h2>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="group text-xs font-semibold text-foreground hover:text-muted-foreground transition-colors flex items-center gap-1.5"
        >
          Voir tout
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>
      <div className={`grid ${gridClass} gap-x-7 gap-y-10`}>
        {displayed.map(p => <SmallCard key={p.id} project={p} />)}
      </div>
    </section>
  )
}
