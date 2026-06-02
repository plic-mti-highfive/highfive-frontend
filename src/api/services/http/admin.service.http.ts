import type { IAdminService } from '../interfaces'
import type {
  AdminUser,
  AdminUserStatus,
  AdminProject,
  AdminStats,
  DailyRegistration,
  RecentlyClosedProject,
} from '@features/admin/types'
import { httpClient } from '../../http-client'

export class AdminServiceHttp implements IAdminService {
  async getUsers(): Promise<AdminUser[]> {
    return httpClient.get<AdminUser[]>('/admin/users')
  }

  async updateUserStatus(userId: string, status: AdminUserStatus): Promise<AdminUser> {
    return httpClient.patch<AdminUser>(`/admin/users/${userId}/status`, { status })
  }

  async deleteUser(userId: string): Promise<void> {
    return httpClient.delete(`/admin/users/${userId}`)
  }

  async getProjects(): Promise<AdminProject[]> {
    return httpClient.get<AdminProject[]>('/admin/projects')
  }

  async updateProject(projectId: string, data: Partial<AdminProject>): Promise<AdminProject> {
    return httpClient.patch<AdminProject>(`/admin/projects/${projectId}`, data)
  }

  async deleteProject(projectId: string): Promise<void> {
    return httpClient.delete(`/admin/projects/${projectId}`)
  }

  async getStats(): Promise<AdminStats> {
    return httpClient.get<AdminStats>('/admin/stats')
  }

  async getDailyRegistrations(): Promise<DailyRegistration[]> {
    return httpClient.get<DailyRegistration[]>('/admin/stats/registrations')
  }

  async getRecentlyClosedProjects(): Promise<RecentlyClosedProject[]> {
    return httpClient.get<RecentlyClosedProject[]>('/admin/projects/recently-closed')
  }
}
