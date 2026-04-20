import { useState, useEffect } from 'react'
import { projectService, ProjectStatus } from '@/api'
import { getAllTags } from '@/api/services/mock/data'
import { mockUsers } from '@shared/data/mockUsers'

export interface SearchTag {
  name: string
  count: number
}

export interface SearchProgress {
  id: string
  title: string
  projectName: string
  description: string
}

export function useSearch(query: string) {
  const [projects, setProjects] = useState<Array<{ id: string | number; name: string; description: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Charger les projets depuis l'API
  useEffect(() => {
    const fetchProjects = async () => {
      if (!query) {
        setProjects([])
        return
      }

      try {
        setIsLoading(true)
        // TODO: Ajouter un paramètre de recherche query quand le backend le supporte
        const response = await projectService.getProjects({
          status: ProjectStatus.ACTIVE,
          limit: 50,
        })
        setProjects(
          response.data.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
          }))
        )
      } catch (error) {
        console.error('Failed to fetch projects for search:', error)
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [query])

  // Filter results
  const queryLower = query.toLowerCase()
  const filteredProjects = projects
    .filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower)
    )
    .slice(0, 3)

  // TODO: Remplacer par API call quand endpoint disponible
  const allUsers = Object.values(mockUsers)
  const filteredUsers = allUsers
    .filter(
      (u) =>
        u.username.toLowerCase().includes(queryLower) ||
        u.displayName.toLowerCase().includes(queryLower) ||
        (u.bio && u.bio.toLowerCase().includes(queryLower))
    )
    .slice(0, 3)

  // Utiliser les tags centralisés
  const allTags = getAllTags()
  const tagsWithCounts: SearchTag[] = allTags.map((tag) => ({
    name: tag,
    count: Math.floor(Math.random() * 30) + 5, // Mock count for now
  }))
  const filteredTags = tagsWithCounts.filter(t => t.name.toLowerCase().includes(queryLower)).slice(0, 3)

  const mockProgress: SearchProgress[] = [
    {
      id: '1',
      title: 'Refactoring de la page login',
      projectName: 'Highfive Frontend',
      description: 'Amélioration de la structure et simplification du code de connexion...',
    },
    {
      id: '2',
      title: 'Implémentation du dark mode',
      projectName: 'Design System',
      description: 'Ajout complet du support du thème sombre dans tous les composants...',
    },
    {
      id: '3',
      title: 'Optimisation des performances',
      projectName: 'API Backend',
      description: 'Réduction du temps de réponse des requêtes critiques...',
    },
  ]

  const filteredProgress = mockProgress
    .filter(p => p.title.toLowerCase().includes(queryLower) || p.projectName.toLowerCase().includes(queryLower))
    .slice(0, 3)

  return {
    filteredProjects,
    filteredUsers,
    filteredTags,
    filteredProgress,
    isEmpty:
      filteredProjects.length === 0 &&
      filteredUsers.length === 0 &&
      filteredTags.length === 0 &&
      filteredProgress.length === 0,
    isLoading,
  }
}
