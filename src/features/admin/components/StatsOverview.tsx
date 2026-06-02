import type { AdminStats } from '../types'
import { Users, FolderOpen, Building2, TrendingUp } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  sub?: string
  icon: React.ReactNode
  accent?: string
}

function StatCard({ label, value, sub, icon, accent = 'bg-muted' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-sidebar p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground">{value.toLocaleString('fr-FR')}</p>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function StatsOverview({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Utilisateurs"
        value={stats.totalUsers}
        sub={`+${stats.newUsersThisWeek} cette semaine`}
        icon={<Users size={20} className="text-violet-600" />}
        accent="bg-violet-100"
      />
      <StatCard
        label="Projets"
        value={stats.totalProjects}
        sub={`+${stats.newProjectsThisWeek} cette semaine`}
        icon={<FolderOpen size={20} className="text-sky-600" />}
        accent="bg-sky-100"
      />
      <StatCard
        label="Tenants"
        value={stats.totalTenants}
        sub="organisations actives"
        icon={<Building2 size={20} className="text-emerald-600" />}
        accent="bg-emerald-100"
      />
      <StatCard
        label="Taux d'activation"
        value={Math.round((stats.activeUsers / stats.totalUsers) * 100)}
        sub={`${stats.suspendedUsers} suspendus · ${stats.pendingUsers} en attente`}
        icon={<TrendingUp size={20} className="text-amber-600" />}
        accent="bg-amber-100"
      />
    </div>
  )
}
