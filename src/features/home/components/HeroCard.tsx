import { useNavigate } from 'react-router-dom'
import type { Project } from '@shared/types'
import { Thumbnail } from './Thumbnail'
import { AuthorChip } from './AuthorChip'
import { DaysLeftBadge } from './DaysLeftBadge'
import { ProgressBar } from './ProgressBar'
import { TagPill } from './TagPill'

export function HeroCard({ project }: { project: Project }) {
  const navigate = useNavigate()
  return (
    <article className="cursor-pointer group" onClick={() => navigate(`/projects/${project.id}`)}>
      <div className="relative overflow-hidden rounded-2xl mb-5 shadow-xl group-hover:shadow-xl transition-shadow duration-300">
        <div className="transition-transform duration-500 group-hover:scale-[1.02]">
          <Thumbnail
            id={project.id}
            name={project.name}
            thumbnailUrl={project.thumbnailUrl}
            className="w-full aspect-[16/9] rounded-2xl"
          />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-4">
          <DaysLeftBadge days={project.daysLeft} />
        </div>
      </div>

      <div className="space-y-3 px-0.5">
        <AuthorChip author={project.author} />
        <h2 className="text-2xl font-black text-ink leading-tight tracking-tight">{project.name}</h2>
        <p className="text-sm text-ink leading-relaxed line-clamp-2">{project.description}</p>
        <ProgressBar value={project.successRate} />
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${project.successRate >= 100 ? 'text-emerald-600' : 'text-ink'}`}>
            {project.successRate}%
          </span>
          <span className="text-xs text-ink">·</span>
          <span className="text-xs text-ink">{project.contributorsCount} contributeurs</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1.5 flex-wrap">
            {project.tags.map(t => <TagPill key={t} tag={t} />)}
          </div>
          <button
            className="shrink-0 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            onClick={e => { e.stopPropagation(); navigate(`/projects/${project.id}`) }}
          >
            Contribuer <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>
      </div>
    </article>
  )
}
