import { useState, useEffect } from 'react'
import { userService } from '@/api'
import type { User } from '@shared/types/user'
import type { UserProfileResponse } from '@/api/types/user.types'

// Adapter la réponse API vers le format User attendu par les composants
const adaptUserProfile = (profile: UserProfileResponse): User => ({
  username: profile.email.split('@')[0], // Temporaire: utiliser email comme username
  displayName: profile.email.split('@')[0],
  avatar: profile.avatarPath || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.userId}`,
  bio: profile.bio || '',
  createdAt: profile.createdAt,
  tags: [], // TODO: implémenter quand le backend supporte les tags
  stats: {
    projectsCreated: 0, // TODO: récupérer depuis API
    projectsContributed: 0, // TODO: récupérer depuis API
    followers: 0, // TODO: récupérer depuis API
    following: 0, // TODO: récupérer depuis API
  },
  projects: {
    created: [], // TODO: récupérer depuis API
    collaborations: [], // TODO: récupérer depuis API
    liked: [], // TODO: récupérer depuis API
  },
  followers: [], // TODO: récupérer depuis API
  following: [], // TODO: récupérer depuis API
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
        const profile = await userService.getUserProfile(userId)
        const adaptedUser = adaptUserProfile(profile)
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
