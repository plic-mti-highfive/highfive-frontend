import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search, ShieldOff, ShieldCheck, Trash2 } from 'lucide-react'
import type { AdminUser, AdminUserStatus } from '../types'

const STATUS_CFG: Record<AdminUserStatus, { label: string; cls: string }> = {
  ACTIVE: { label: 'Actif', cls: 'bg-emerald-100 text-emerald-700' },
  PENDING: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  SUSPENDED: { label: 'Suspendu', cls: 'bg-red-100 text-red-600' },
}

interface UsersTableProps {
  users: AdminUser[]
  onStatusChange: (userId: string, status: AdminUserStatus) => void
  onDelete: (userId: string) => void
}

export function UsersTable({ users, onStatusChange, onDelete }: UsersTableProps) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<AdminUserStatus | 'ALL'>('ALL')

  const filtered = users.filter(u => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || u.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-background border border-input rounded-lg flex-1 min-w-48">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-1.5">
          {(['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'ALL' ? 'Tous' : STATUS_CFG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-sidebar">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-left">
                <th className="px-4 py-3 font-semibold text-muted-foreground">Utilisateur</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Statut</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Projets</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Abonnés</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Inscription</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">@{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CFG[user.status].cls}`}>
                        {STATUS_CFG[user.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{user.projectsCount}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{user.followersCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(user.joinedAt), 'd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {user.status === 'SUSPENDED' ? (
                          <button
                            onClick={() => onStatusChange(user.id, 'ACTIVE')}
                            title="Réactiver"
                            className="p-1.5 rounded-lg hover:bg-emerald-100 text-muted-foreground hover:text-emerald-600 transition-colors"
                          >
                            <ShieldCheck size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onStatusChange(user.id, 'SUSPENDED')}
                            title="Suspendre"
                            className="p-1.5 rounded-lg hover:bg-amber-100 text-muted-foreground hover:text-amber-600 transition-colors"
                          >
                            <ShieldOff size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(user.id)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">{filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  )
}
