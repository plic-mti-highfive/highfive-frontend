import { useState, useEffect } from 'react'
import { userService, projectService, type ProjectDto } from '@/api'
import type { User } from '@shared/types/user'
import type { Project } from '@shared/types/project'
import type { UserProfileResponse } from '@/api/types/user.types'

const adaptProjectDto = (dto: ProjectDto): Project => ({
  id: dto.id,
  name: dto.name,
  description: dto.description || '',
  tags: dto.tags || [],
  author: 'unknown',
  contributorsCount: 0,
  highfiveCount: dto.highfiveCount || 0,
  successRate: 100,
  daysLeft: null,
})

// Adapter la réponse API vers le format User attendu par les composants
const adaptUserProfile = (profile: UserProfileResponse, createdProjects: Project[]): User => ({
  username: profile.userId,
  displayName: profile.userId,
  avatar: profile.avatarPath || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.userId}`,
  bio: profile.bio || '',
  createdAt: '',
  tags: [],
  stats: {
    projectsCreated: createdProjects.length,
    projectsContributed: 0,
    followers: 0,
    following: 0,
  },
  projects: {
    created: createdProjects,
    collaborations: [],
    liked: [],
  },
  followers: [],
  following: [],
})

export function useUserProfile(userId: string | undefined) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const [profile, projectsResponse] = await Promise.all([
          userService.getUserProfile(userId),
          projectService.getProjects({ userId, limit: 50 }),
        ])
        const createdProjects = projectsResponse.data.map(adaptProjectDto)
        const adaptedUser = adaptUserProfile(profile, createdProjects)
        setUser(adaptedUser)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user profile'))
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId])

  return { user, isLoading, error }
}
