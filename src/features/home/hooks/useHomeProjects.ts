import { useState, useEffect } from 'react'
import { projectService, type ProjectDto } from '@/api'
import type { Project } from '@shared/types'

// Adapter ProjectDto vers l'ancien format Project pour compatibilité
const adaptProjectDto = (dto: ProjectDto): Project => ({
  id: dto.id,
  name: dto.name,
  description: dto.description || '',
  tags: dto.tags || [], // Tags disponibles depuis backend
  author: 'unknown', // TODO: récupérer l'auteur via les membres
  contributorsCount: 0, // TODO: calculer depuis les membres
  highfiveCount: dto.highfiveCount || 0,
  successRate: 100, // TODO: calculer selon la logique métier
  daysLeft: null, // TODO: calculer depuis une date de fin si disponible
})

export function useHomeProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await projectService.getProjects({
          limit: 50,
        })

        const adaptedProjects = response.data.map(adaptProjectDto)
        setProjects(adaptedProjects)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erreur inconnue lors du chargement des projets'

        // Ajouter plus de contexte à l'erreur
        const enhancedError = new Error(errorMessage)
        enhancedError.stack = err instanceof Error ? err.stack : undefined
        setError(enhancedError)

        // En cas d'erreur, garder les projets vides plutôt que de crasher
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Pour l'instant, on retourne tous les projets
  // TODO: implémenter la logique de catégorisation quand le backend supportera les catégories
  const featured = projects[0] || null
  const recommended = projects.slice(0, 4)
  const trending = projects.slice(4, 8)
  const endingSoon = projects.slice(8, 12)
  const successful = projects.slice(12, 16)
  const recent = projects.slice(16, 20)

  return {
    featured,
    recommended,
    trending,
    endingSoon,
    successful,
    recent,
    isLoading,
    error,
  }
}
