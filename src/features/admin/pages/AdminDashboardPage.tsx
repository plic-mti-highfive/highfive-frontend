import { useState } from 'react'
import { Header, Footer } from '@features/layout'
import { LayoutDashboard, Users, FolderOpen } from 'lucide-react'
import { OverviewTab } from '../components/OverviewTab'
import { UsersTable } from '../components/UsersTable'
import { ProjectsTable } from '../components/ProjectsTable'
import type { AdminUser, AdminProject, AdminUserStatus } from '../types'
import {
  mockAdminUsers,
  mockAdminProjects,
  mockAdminStats,
  mockDailyRegistrations,
  mockRecentlyClosedProjects,
} from '@/api/services/mock/data/mockAdmin'

type Tab = 'overview' | 'users' | 'projects'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: <LayoutDashboard size={16} /> },
  { id: 'users', label: 'Utilisateurs', icon: <Users size={16} /> },
  { id: 'projects', label: 'Projets', icon: <FolderOpen size={16} /> },
]

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers)
  const [projects, setProjects] = useState<AdminProject[]>(mockAdminProjects)

  const handleUserStatusChange = (userId: string, status: AdminUserStatus) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status } : u)))
  }

  const handleUserDelete = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleProjectArchive = (projectId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, status: p.status === 'active' ? 'archived' : 'active' }
          : p
      )
    )
  }

  const handleProjectDelete = (projectId: string) => {
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
          {activeTab === 'overview' && (
            <OverviewTab
              stats={mockAdminStats}
              dailyRegistrations={mockDailyRegistrations}
              recentlyClosedProjects={mockRecentlyClosedProjects}
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
