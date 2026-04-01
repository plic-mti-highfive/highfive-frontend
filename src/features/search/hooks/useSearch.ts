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
  // Get all projects from mock data
  const allProjects: Array<{ id: string | number; name: string; description: string }> = []
  Object.values(mockUsers).forEach((user) => {
    allProjects.push(...user.projects.created, ...user.projects.collaborations, ...user.projects.liked)
  })

  // Filter results
  const queryLower = query.toLowerCase()
  const filteredProjects = allProjects.filter(p =>
    p.name.toLowerCase().includes(queryLower) || p.description.toLowerCase().includes(queryLower)
  ).slice(0, 3)

  const filteredUsers = Object.values(mockUsers)
    .filter((user) =>
      user.displayName.toLowerCase().includes(queryLower) || user.username.toLowerCase().includes(queryLower)
    )
    .slice(0, 3)

  const mockTags: SearchTag[] = [
    { name: 'React', count: 24 },
    { name: 'Design', count: 18 },
    { name: 'Python', count: 15 },
    { name: 'DevOps', count: 9 },
    { name: 'Machine Learning', count: 12 },
  ]
  const filteredTags = mockTags.filter(t => t.name.toLowerCase().includes(queryLower)).slice(0, 3)

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
    isEmpty: filteredProjects.length === 0 && filteredUsers.length === 0 && filteredTags.length === 0 && filteredProgress.length === 0,
  }
}
