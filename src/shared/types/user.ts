import type { Project } from './project'

export interface UserProfile {
  username: string
  displayName: string
  avatar: string
}

export interface User {
  username: string
  displayName: string
  avatar: string
  bio: string
  createdAt: string
  tags: string[]
  stats: {
    projectsCreated: number
    projectsContributed: number
    followers: number
    following: number
  }
  projects: {
    created: Project[]
    collaborations: Project[]
    liked: Project[]
  }
  followers: UserProfile[]
  following: UserProfile[]
}

export interface UserProfileFormData {
  displayName: string
  bio: string
  avatar: string
  tags: string[]
}
