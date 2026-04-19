export interface Project {
  id: number | string
  name: string
  description: string
  tags: string[]
  author: string
  authorAvatar?: string
  contributorsCount: number
  successRate: number
  daysLeft: number | null
  thumbnailUrl?: string
}

export type Direction = 'left' | 'right'
