import { useState, useEffect } from 'react'
import { Header, Footer } from '@features/layout'
import { LayoutDashboard, Users, FolderOpen } from 'lucide-react'
import { OverviewTab } from '../components/OverviewTab'
import { UsersTable } from '../components/UsersTable'
import { ProjectsTable } from '../components/ProjectsTable'
import type { AdminUser, AdminProject, AdminUserStatus, AdminStats, DailyRegistration, RecentlyClosedProject } from '../types'
import { adminService } from '@/api/services'

type Tab = 'overview' | 'users' | 'projects'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: <LayoutDashboard size={16} /> },
  { id: 'users', label: 'Utilisateurs', icon: <Users size={16} /> },
  { id: 'projects', label: 'Projets', icon: <FolderOpen size={16} /> },
]

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [dailyRegistrations, setDailyRegistrations] = useState<DailyRegistration[]>([])
  const [recentlyClosedProjects, setRecentlyClosedProjects] = useState<RecentlyClosedProject[]>([])

  useEffect(() => {
    adminService.getUsers().then(setUsers)
    adminService.getProjects().then(setProjects)
    adminService.getStats().then(setStats)
    adminService.getDailyRegistrations().then(setDailyRegistrations)
    adminService.getRecentlyClosedProjects().then(setRecentlyClosedProjects)
  }, [])

  const handleUserStatusChange = async (userId: string, status: AdminUserStatus) => {
    const updated = await adminService.updateUserStatus(userId, status)
    setUsers(prev => prev.map(u => (u.id === userId ? updated : u)))
  }

  const handleUserDelete = async (userId: string) => {
    await adminService.deleteUser(userId)
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleProjectArchive = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    const newStatus = project.status === 'active' ? 'archived' : 'active'
    const updated = await adminService.updateProject(projectId, { status: newStatus })
    setProjects(prev => prev.map(p => (p.id === projectId ? updated : p)))
  }

  const handleProjectDelete = async (projectId: string) => {
    await adminService.deleteProject(projectId)
    setProjects(prev => prev.filter(p => p.id !== projectId))
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-3.5rem)] bg-background">
        <div className="px-8 py-8">

          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestion des utilisateurs et des projets
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && stats && (
            <OverviewTab
              stats={stats}
              dailyRegistrations={dailyRegistrations}
              recentlyClosedProjects={recentlyClosedProjects}
            />
          )}

          {activeTab === 'users' && (
            <UsersTable
              users={users}
              onStatusChange={handleUserStatusChange}
              onDelete={handleUserDelete}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsTable
              projects={projects}
              onArchive={handleProjectArchive}
              onDelete={handleProjectDelete}
            />
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
