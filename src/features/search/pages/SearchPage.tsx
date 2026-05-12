import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FolderOpen, Users, Tag } from 'lucide-react'
import { Header } from '@features/layout'
import { Footer } from '@features/layout'
import { SmallCard } from '@shared/components/projects'
import { ProjectFiltersBar } from '@features/projects/components/ProjectFilters'
import { projectService } from '@/api'
import type { Project } from '@shared/types'
import type { ProjectDto } from '@/api/types'

function adaptProject(p: ProjectDto): Project {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    tags: p.tags ?? [],
    author: '',
    contributorsCount: 0,
    highfiveCount: p.highfiveCount,
    successRate: 0,
    daysLeft: null,
  }
}

type ResultType = 'projects' | 'users' | 'tags'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const searchQuery = searchParams.get('q') || ''
  const tagFilter = searchParams.get('tag')

  const resultType: ResultType = location.pathname.includes('/users')
    ? 'users'
    : location.pathname.includes('/tags')
      ? 'tags'
      : 'projects'

  const [, setActiveSort] = useState<'name' | 'date' | 'popularity'>('date')
  const [, setActiveFilters] = useState<string[]>([])

  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true)
        const response = await projectService.getProjects({ limit: 100 })
        setAllProjects(response.data.map(adaptProject))
      } catch (e) {
        console.error('Failed to fetch projects:', e)
        setAllProjects([])
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [])

  const queryLower = (tagFilter || searchQuery).toLowerCase()
  const displayedProjects = allProjects.filter((p) => {
    if (tagFilter) {
      return p.tags.some((t) => t.toLowerCase() === tagFilter.toLowerCase())
    }
    if (!searchQuery) return true
    return (
      p.name.toLowerCase().includes(queryLower) ||
      p.description.toLowerCase().includes(queryLower) ||
      p.tags.some((t) => t.toLowerCase().includes(queryLower))
    )
  })

  const resultsCount = resultType === 'projects' ? displayedProjects.length : 0
  const resultsLabel =
    resultType === 'projects' ? 'projet' : resultType === 'users' ? 'utilisateur' : 'tag'

  const handleTypeChange = (type: ResultType) => {
    const currentParams = searchParams.toString()
    const path =
      type === 'projects'
        ? '/search/projects'
        : type === 'users'
          ? '/search/users'
          : '/search/tags'
    navigate(currentParams ? `${path}?${currentParams}` : path)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Résultats pour : <span className="text-muted-foreground">{tagFilter || searchQuery}</span>
          </h1>
          <p className="mt-3 text-body-lg text-muted-foreground">
            {resultsCount} {resultsLabel}{resultsCount > 1 ? 's' : ''} trouvé{resultsCount > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex gap-3">
            <button
              onClick={() => handleTypeChange('projects')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-body-md font-semibold
                transition-all outline-none
                ${resultType === 'projects'
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }
              `}
            >
              <FolderOpen size={18} />
              Projets
            </button>
            <button
              onClick={() => handleTypeChange('users')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-body-md font-semibold
                transition-all outline-none
                ${resultType === 'users'
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }
              `}
            >
              <Users size={18} />
              Utilisateurs
            </button>
            <button
              onClick={() => handleTypeChange('tags')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-body-md font-semibold
                transition-all outline-none
                ${resultType === 'tags'
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }
              `}
            >
              <Tag size={18} />
              Tags
            </button>
          </div>

          <div className="flex-shrink-0 h-[42px]">
            {resultType === 'projects' && (
              <ProjectFiltersBar
                onSortChange={(sort) => setActiveSort(sort)}
                onFilterChange={(filters) => setActiveFilters(filters)}
              />
            )}
          </div>
        </div>

        {resultType === 'projects' ? (
          isLoading ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">Chargement...</p>
            </div>
          ) : displayedProjects.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-7 gap-y-10">
              {displayedProjects.map((project) => (
                <SmallCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                Aucun projet trouvé{(tagFilter || searchQuery) ? ` pour "${tagFilter || searchQuery}"` : ''}
              </p>
              <p className="mt-2 text-body-md text-muted-foreground">
                Essayez avec d'autres mots-clés
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              {resultType === 'users'
                ? 'La recherche d\'utilisateurs n\'est pas encore disponible.'
                : 'La recherche par tags n\'est pas encore disponible.'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
