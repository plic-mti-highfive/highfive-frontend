import {
  LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Users, FolderOpen, Wifi, TrendingUp } from 'lucide-react'
import type { AdminStats, DailyRegistration, RecentlyClosedProject } from '../types'

// ── KPI cards ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  accent: string
}

function KpiCard({ label, value, sub, icon, accent }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-sidebar p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground">{typeof value === 'number' ? value.toLocaleString('fr-FR') : value}</p>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Chart wrapper ────────────────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-sidebar p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  )
}

// ── Donut chart: user status breakdown ───────────────────────────────────────

const USER_STATUS_COLORS = ['#10b981', '#f59e0b', '#ef4444']

function UserStatusDonut({ stats }: { stats: AdminStats }) {
  const data = [
    { name: 'Actifs', value: stats.activeUsers },
    { name: 'En attente', value: stats.pendingUsers },
    { name: 'Suspendus', value: stats.suspendedUsers },
  ]
  return (
    <ChartCard title="Répartition des utilisateurs">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={USER_STATUS_COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [typeof value === 'number' ? value.toLocaleString('fr-FR') : value, '']}
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ── Bar chart: active vs archived projects ───────────────────────────────────

function ProjectsStatusBar({ stats }: { stats: AdminStats }) {
  const data = [
    { name: 'Actifs', count: stats.activeProjects },
    { name: 'Archivés', count: stats.totalProjects - stats.activeProjects },
  ]
  return (
    <ChartCard title="Statut des projets">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={48}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [value, 'Projets']}
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            <Cell fill="#10b981" />
            <Cell fill="#94a3b8" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ── Area chart: daily registrations ─────────────────────────────────────────

function RegistrationsChart({ data }: { data: DailyRegistration[] }) {
  // show every 5th label to avoid crowding
  const tickFormatter = (_: string, index: number) =>
    index % 5 === 0 ? data[index]?.date ?? '' : ''

  return (
    <ChartCard title="Inscriptions — 30 derniers jours">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={tickFormatter}
          />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            formatter={(value) => [value, 'Inscriptions']}
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
          />
          <Area type="monotone" dataKey="inscriptions" stroke="#8b5cf6" strokeWidth={2} fill="url(#regGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ── Recently closed list ────────────────────────────────────────────────────

function RecentlyClosedList({ projects }: { projects: RecentlyClosedProject[] }) {
  return (
    <ChartCard title="Projets récemment clos">
      <div className="flex flex-col divide-y divide-border -mx-5 px-5">
        {projects.map(p => (
          <div key={p.id} className="flex items-center justify-between py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">@{p.ownerUsername} · {p.membersCount} membres · {p.highfiveCount} ⭐</p>
            </div>
            <span className="ml-4 shrink-0 text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(p.closedAt), { addSuffix: true, locale: fr })}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

interface OverviewTabProps {
  stats: AdminStats
  dailyRegistrations: DailyRegistration[]
  recentlyClosedProjects: RecentlyClosedProject[]
}

export function OverviewTab({ stats, dailyRegistrations, recentlyClosedProjects }: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-6">

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Utilisateurs inscrits"
          value={stats.totalUsers}
          sub={`+${stats.newUsersThisWeek} cette semaine`}
          icon={<Users size={20} className="text-violet-600" />}
          accent="bg-violet-100"
        />
        <KpiCard
          label="Utilisateurs en ligne"
          value={stats.onlineUsers}
          sub="en ce moment"
          icon={<Wifi size={20} className="text-emerald-600" />}
          accent="bg-emerald-100"
        />
        <KpiCard
          label="Projets actifs"
          value={stats.activeProjects}
          sub={`+${stats.newProjectsThisWeek} cette semaine`}
          icon={<FolderOpen size={20} className="text-sky-600" />}
          accent="bg-sky-100"
        />
        <KpiCard
          label="Taux d'activation"
          value={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)} %`}
          sub={`${stats.suspendedUsers} suspendus · ${stats.pendingUsers} en attente`}
          icon={<TrendingUp size={20} className="text-amber-600" />}
          accent="bg-amber-100"
        />
      </div>

      {/* Registrations chart — full width */}
      <RegistrationsChart data={dailyRegistrations} />

      {/* Second row: donut + bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserStatusDonut stats={stats} />
        <ProjectsStatusBar stats={stats} />
      </div>

      {/* Recently closed */}
      <RecentlyClosedList projects={recentlyClosedProjects} />

    </div>
  )
}
