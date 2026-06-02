import type {
  AdminUser,
  AdminUserStatus,
  AdminProject,
  AdminStats,
  DailyRegistration,
  RecentlyClosedProject,
} from '@features/admin/types'

export interface IAdminService {
  getUsers(): Promise<AdminUser[]>
  updateUserStatus(userId: string, status: AdminUserStatus): Promise<AdminUser>
  deleteUser(userId: string): Promise<void>

  getProjects(): Promise<AdminProject[]>
  updateProject(projectId: string, data: Partial<AdminProject>): Promise<AdminProject>
  deleteProject(projectId: string): Promise<void>

  getStats(): Promise<AdminStats>
  getDailyRegistrations(): Promise<DailyRegistration[]>
  getRecentlyClosedProjects(): Promise<RecentlyClosedProject[]>
}
