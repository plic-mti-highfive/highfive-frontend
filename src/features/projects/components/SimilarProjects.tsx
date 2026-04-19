import { Section } from '@features/home'
import type { ProjectDto } from '@/api/types'
import type { Project } from '@shared/types'

interface SimilarProjectsProps {
  projects: ProjectDto[]
}

export function SimilarProjects({ projects }: SimilarProjectsProps) {
  if (projects.length === 0) return null

  const convertToProject = (dto: ProjectDto): Project => ({
    id: Number(dto.id),
    name: dto.name,
    description: dto.description || '',
    author: 'Équipe',
    successRate: 0,
    contributorsCount: 0,
    daysLeft: null,
    tags: ['Open Source'],
    thumbnailUrl: undefined,
  })

  const projectsForSection = projects.map(convertToProject)

  return (
    <div className="max-w-[1400px] mx-auto px-6">
      <Section
        title="Projets similaires"
        projects={projectsForSection}
        cols={4}
        showViewAll={false}
      />
    </div>
  )
}
