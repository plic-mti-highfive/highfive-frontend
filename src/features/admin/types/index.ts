export type AdminUserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED'

export interface AdminUser {
  id: string
  email: string
  username: string
  status: AdminUserStatus
  projectsCount: number
  followersCount: number
  joinedAt: Date
}

export interface AdminProject {
  id: string
  name: string
  description: string
  ownerUsername: string
  membersCount: number
  highfiveCount: number
  createdAt: Date
  status: 'active' | 'archived'
}

export interface AdminTenant {
  id: string
  name: string
  domain: string
  usersCount: number
  projectsCount: number
  createdAt: Date
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  suspendedUsers: number
  totalProjects: number
  activeProjects: number
  totalTenants: number
  newUsersThisWeek: number
  newProjectsThisWeek: number
  onlineUsers: number
}

export interface DailyRegistration {
  date: string // 'dd MMM'
  inscriptions: number
}

export interface RecentlyClosedProject {
  id: string
  name: string
  ownerUsername: string
  closedAt: Date
  membersCount: number
  highfiveCount: number
}
