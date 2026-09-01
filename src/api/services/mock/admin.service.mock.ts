import type { IAdminService } from "../interfaces";
import type {
  AdminProject,
  AdminStats,
  AdminUser,
  AdminUserStatus,
  DailyRegistration,
  RecentlyClosedProject,
} from "@features/admin/types";
import { delay } from "./utils";
import {
  mockAdminProjects,
  mockAdminStats,
  mockAdminUsers,
  mockDailyRegistrations,
  mockRecentlyClosedProjects,
} from "./data/mockAdmin";

/**
 * Mock du dashboard admin.
 *
 * Il n'en existait aucun : la factory instanciait toujours l'implementation
 * HTTP, si bien qu'en mode mock le dashboard appelait le vrai backend et se
 * heurtait a des 401 — alors que les donnees de demonstration existaient deja
 * dans data/mockAdmin.ts sans jamais etre utilisees.
 *
 * L'etat est tenu en memoire pour que les actions (suspendre, archiver,
 * supprimer) aient un effet visible, comme en mode HTTP.
 */
export class AdminServiceMock implements IAdminService {
  private users: AdminUser[] = mockAdminUsers.map((u) => ({ ...u }));
  private projects: AdminProject[] = mockAdminProjects.map((p) => ({ ...p }));

  async getUsers(): Promise<AdminUser[]> {
    await delay(200);
    return this.users.map((u) => ({ ...u }));
  }

  async updateUserStatus(
    userId: string,
    status: AdminUserStatus,
  ): Promise<AdminUser> {
    await delay(200);
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    user.status = status;
    return { ...user };
  }

  async deleteUser(userId: string): Promise<void> {
    await delay(200);
    this.users = this.users.filter((u) => u.id !== userId);
  }

  async getProjects(): Promise<AdminProject[]> {
    await delay(200);
    return this.projects.map((p) => ({ ...p }));
  }

  async updateProject(
    projectId: string,
    data: Partial<AdminProject>,
  ): Promise<AdminProject> {
    await delay(200);
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) throw new Error("Project not found");
    Object.assign(project, data);
    return { ...project };
  }

  async deleteProject(projectId: string): Promise<void> {
    await delay(200);
    this.projects = this.projects.filter((p) => p.id !== projectId);
  }

  async getStats(): Promise<AdminStats> {
    await delay(200);
    // Recalcule depuis l'etat courant : les KPIs doivent suivre les actions
    // faites dans le dashboard plutot que rester figes.
    return {
      ...mockAdminStats,
      totalUsers: this.users.length,
      activeUsers: this.users.filter((u) => u.status === "ACTIVE").length,
      pendingUsers: this.users.filter((u) => u.status === "PENDING").length,
      suspendedUsers: this.users.filter((u) => u.status === "SUSPENDED").length,
      totalProjects: this.projects.length,
      activeProjects: this.projects.filter((p) => p.status === "active").length,
    };
  }

  async getDailyRegistrations(): Promise<DailyRegistration[]> {
    await delay(200);
    return mockDailyRegistrations.map((d) => ({ ...d }));
  }

  async getRecentlyClosedProjects(): Promise<RecentlyClosedProject[]> {
    await delay(200);
    return mockRecentlyClosedProjects.map((p) => ({ ...p }));
  }
}
