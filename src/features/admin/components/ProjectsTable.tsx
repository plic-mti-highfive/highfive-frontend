import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search, Archive, Trash2 } from 'lucide-react'
import type { AdminProject } from '../types'

interface ProjectsTableProps {
  projects: AdminProject[]
  onArchive: (projectId: string) => void
  onDelete: (projectId: string) => void
}

export function ProjectsTable({ projects, onArchive, onDelete }: ProjectsTableProps) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all')

  const filtered = projects.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerUsername.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
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
            placeholder="Rechercher par nom ou propriétaire..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'active', 'archived'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'Tous' : s === 'active' ? 'Actifs' : 'Archivés'}
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
                <th className="px-4 py-3 font-semibold text-muted-foreground">Projet</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Propriétaire</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Statut</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Membres</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Highfives</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Créé le</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    Aucun projet trouvé
                  </td>
                </tr>
              ) : (
                filtered.map(proj => (
                  <tr key={proj.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{proj.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-56">{proj.description}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">@{proj.ownerUsername}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        proj.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {proj.status === 'active' ? 'Actif' : 'Archivé'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{proj.membersCount}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{proj.highfiveCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(proj.createdAt), 'd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onArchive(proj.id)}
                          title={proj.status === 'active' ? 'Archiver' : 'Désarchiver'}
                          className="p-1.5 rounded-lg hover:bg-amber-100 text-muted-foreground hover:text-amber-600 transition-colors"
                        >
                          <Archive size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(proj.id)}
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
          <p className="text-xs text-muted-foreground">{filtered.length} projet{filtered.length > 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  )
}
