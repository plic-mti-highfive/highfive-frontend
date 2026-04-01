import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '@shared/types'
import { Thumbnail } from './Thumbnail'
import { AuthorChip } from './AuthorChip'
import { DaysLeftBadge } from './DaysLeftBadge'
import { ProgressBar } from './ProgressBar'
import { TagPill } from './TagPill'

export function SmallCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()

  return (
    <article
      className="cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className={`relative overflow-hidden rounded-xl mb-3 transition-shadow duration-300 ${hovered ? 'shadow-lg' : 'shadow-sm'}`}>
        <div className={`transition-transform duration-500 ${hovered ? 'scale-[1.03]' : 'scale-100'}`}>
          <Thumbnail
            id={project.id}
            name={project.name}
            thumbnailUrl={project.thumbnailUrl}
            className="w-full aspect-video rounded-xl"
          />
        </div>
        <div className={`absolute inset-0 rounded-xl bg-gray-900/80 backdrop-blur-[3px] flex flex-col justify-end p-3 gap-2 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <p className="text-white/85 text-xs leading-relaxed line-clamp-3">{project.description}</p>
          <button
            className="self-start mt-0.5 bg-white text-gray-900 text-[11px] font-bold px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
            onClick={e => { e.stopPropagation(); navigate(`/projects/${project.id}`) }}
          >
            Voir le projet →
          </button>
        </div>
      </div>

      <div className="space-y-2 px-0.5">
        <div className="flex items-center justify-between">
          <AuthorChip author={project.author} />
          <DaysLeftBadge days={project.daysLeft} />
        </div>
        <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-1">{project.name}</h3>
        <ProgressBar value={project.successRate} />
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${project.successRate >= 100 ? 'text-emerald-600' : 'text-gray-700'}`}>
            {project.successRate}%
          </span>
          <span className="text-[11px] text-gray-400">{project.contributorsCount} contributeurs</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {project.tags.slice(0, 2).map(t => <TagPill key={t} tag={t} size="xs" />)}
        </div>
      </div>
    </article>
  )
}
