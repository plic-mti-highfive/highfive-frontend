import { Bell, User, FolderOpen, MessageSquare, Settings, LogOut, Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Menu } from '@base-ui/react/menu'
import { useState } from 'react'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { mockUsers } from '@/data/mockUsers'


const popupCls =
  'bg-cream border border-cream-mid rounded-xl shadow-lg py-1.5 w-[600px] z-50 origin-[var(--transform-origin)] transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0'

const itemCls =
  'flex items-center gap-3 w-full px-3 py-2 text-body-md text-ink rounded-lg cursor-pointer hover:bg-cream-dark outline-none select-none transition-colors'

const separatorCls = 'border-t border-cream-mid my-1.5 mx-2'

const sectionTitleCls = 'px-3 py-2 text-body-sm font-semibold text-ink-muted uppercase tracking-wider'


function NotificationsMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger
        className="flex items-center justify-center w-12 h-12 rounded-full text-white hover:bg-rose-light/20 transition-all outline-none cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={24} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8}>
          <Menu.Popup className={popupCls}>
            <div className="px-4 py-6 text-center">
              <p className="text-body-sm text-ink-muted">Aucune notification pour l'instant.</p>
            </div>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

type UserMenuProps = {
  username: string
  initials: string
  onLogout: () => void
  navigate: (to: string) => void
}

type SearchResultsDropdownProps = {
  query: string
  navigate: (to: string) => void
}

function SearchResultsDropdown({ query, navigate }: SearchResultsDropdownProps) {

  // Get all projects from mock data
  const allProjects: Array<{ id: string; name: string; description: string }> = []
  Object.values(mockUsers).forEach((user) => {
    allProjects.push(...user.projects.created, ...user.projects.collaborations, ...user.projects.liked)
  })

  // Filter results
  const queryLower = query.toLowerCase()
  const filteredProjects = allProjects.filter(p =>
    p.name.toLowerCase().includes(queryLower) || p.description.toLowerCase().includes(queryLower)
  ).slice(0, 3)

  const filteredUsers = Object.values(mockUsers)
    .filter((user) =>
      user.displayName.toLowerCase().includes(queryLower) || user.username.toLowerCase().includes(queryLower)
    )
    .slice(0, 3)

  const mockTags = [
    { name: 'React', count: 24 },
    { name: 'Design', count: 18 },
    { name: 'Python', count: 15 },
    { name: 'DevOps', count: 9 },
    { name: 'Machine Learning', count: 12 },
  ]
  const filteredTags = mockTags.filter(t => t.name.toLowerCase().includes(queryLower)).slice(0, 3)

  const mockProgress = [
    {
      id: '1',
      title: 'Refactoring de la page login',
      projectName: 'Highfive Frontend',
      description: 'Amélioration de la structure et simplification du code de connexion...',
    },
    {
      id: '2',
      title: 'Implémentation du dark mode',
      projectName: 'Design System',
      description: 'Ajout complet du support du thème sombre dans tous les composants...',
    },
    {
      id: '3',
      title: 'Optimisation des performances',
      projectName: 'API Backend',
      description: 'Réduction du temps de réponse des requêtes critiques...',
    },
  ]

  const filteredProgress = mockProgress
    .filter(p => p.title.toLowerCase().includes(queryLower) || p.projectName.toLowerCase().includes(queryLower))
    .slice(0, 3)

  const resultItemCls = 'flex items-center gap-3 w-full px-3 py-2 text-body-md text-ink cursor-pointer hover:bg-cream-dark outline-none select-none transition-colors text-left'

  return (
    <div className="py-1.5">
      {/* Projets Section */}
      {filteredProjects.length > 0 && (
        <>
          <div className={sectionTitleCls}>Projets</div>
          {filteredProjects.map((project) => (
            <button
              key={project.id}
              className={resultItemCls}
              onClick={() => navigate(`/project/${project.id}`)}
              type="button"
            >
              <div className="min-w-0 flex-1">
                <p className="text-body-md text-ink truncate font-medium">{project.name}</p>
                <p className="text-body-sm text-ink-muted truncate">{project.description}</p>
              </div>
            </button>
          ))}
          <div className={separatorCls} />
        </>
      )}

      {/* Utilisateurs Section */}
      {filteredUsers.length > 0 && (
        <>
          <div className={sectionTitleCls}>Utilisateurs</div>
          {filteredUsers.map((user) => (
            <button
              key={user.username}
              className={resultItemCls}
              onClick={() => navigate(`/user/${user.username}`)}
              type="button"
            >
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-6 h-6 rounded-full shrink-0"
              />
              <div className="min-w-0">
                <p className="text-body-md text-ink truncate font-medium">{user.displayName}</p>
                <p className="text-body-sm text-ink-muted truncate">@{user.username}</p>
              </div>
            </button>
          ))}
          <div className={separatorCls} />
        </>
      )}

      {/* Tags Section */}
      {filteredTags.length > 0 && (
        <>
          <div className={sectionTitleCls}>Tags</div>
          {filteredTags.map((tag) => (
            <button
              key={tag.name}
              className={resultItemCls}
              onClick={() => navigate(`/tag/${tag.name.toLowerCase()}`)}
              type="button"
            >
              <div className="flex-1 min-w-0">
                <p className="text-body-md text-ink truncate font-medium">{tag.name}</p>
              </div>
              <span className="text-body-sm text-ink-muted shrink-0">({tag.count})</span>
            </button>
          ))}
          <div className={separatorCls} />
        </>
      )}

      {/* Progrès Section */}
      {filteredProgress.length > 0 && (
        <>
          <div className={sectionTitleCls}>Progrès</div>
          {filteredProgress.map((progress) => (
            <button
              key={progress.id}
              className="flex flex-col gap-1 w-full px-3 py-2.5 text-ink cursor-pointer hover:bg-cream-dark outline-none select-none transition-colors"
              onClick={() => console.log(`Navigate to progress ${progress.id}`)}
              type="button"
            >
              <p className="text-body-md font-medium text-ink text-left">{progress.title}</p>
              <p className="text-body-sm text-ink-muted text-left">{progress.projectName}</p>
              <p className="text-body-sm text-ink-muted text-left line-clamp-2">{progress.description}</p>
            </button>
          ))}
          <div className={separatorCls} />
        </>
      )}

      {filteredProjects.length === 0 && filteredUsers.length === 0 && filteredTags.length === 0 && filteredProgress.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-body-md text-ink-muted">Aucun résultat trouvé pour "{query}"</p>
        </div>
      )}
    </div>
  )
}

function UserMenu({ username, initials, onLogout, navigate }: UserMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-light text-rose-dark text-body-md font-bold hover:bg-rose-mid transition-colors outline-none select-none"
        aria-label="Mon compte"
      >
        {initials}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8}>
          <Menu.Popup className={popupCls}>

            <div className="flex items-center gap-3 px-3 py-2.5 mb-0.5">
              <div className="w-10 h-10 rounded-full bg-rose-light text-rose-dark text-ui-md font-bold flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-body-md font-semibold text-ink truncate">@{username}</p>
                <p className="text-body-sm text-ink-muted truncate">Membre</p>
              </div>
            </div>

            <div className={separatorCls} />

            <Menu.Item className={itemCls} onClick={() => navigate(`/user/${username}`)}>
              <User size={16} className="text-ink-muted shrink-0" />
              Mon profil
            </Menu.Item>
            <Menu.Item className={itemCls} onClick={() => navigate('/projects')}>
              <FolderOpen size={16} className="text-ink-muted shrink-0" />
              Mes projets
            </Menu.Item>
            <Menu.Item className={itemCls} onClick={() => navigate('/messages')}>
              <MessageSquare size={16} className="text-ink-muted shrink-0" />
              Messages
            </Menu.Item>
            <Menu.Item className={itemCls} onClick={() => navigate('/settings')}>
              <Settings size={16} className="text-ink-muted shrink-0" />
              Paramètres
            </Menu.Item>

            <div className={separatorCls} />

            <Menu.Item
              className={`${itemCls} text-rose hover:bg-rose-light hover:text-rose-dark`}
              onClick={onLogout}
            >
              <LogOut size={16} className="shrink-0" />
              Se déconnecter
            </Menu.Item>

          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const isAuthenticated = localStorage.getItem('authenticated') === 'true'
  const username = localStorage.getItem('username') ?? 'Utilisateur'
  const initials = username.slice(0, 2).toUpperCase()

  function handleLogout() {
    localStorage.removeItem('authenticated')
    localStorage.removeItem('username')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-ink-soft border-b border-ink-muted px-8 h-14 flex items-center gap-8">

        {/* Logo */}
        <div className="shrink-0">
          <Logo className="text-2xl" />
        </div>

        {/* Barre de recherche centrée absolument */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-dark pointer-events-none z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des projets, utilisateurs..."
              className="
                w-full rounded-lg border border-cream-mid bg-white pl-10 pr-6 py-2.5
                text-body-md text-ink placeholder-ink-muted
                focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent
                transition-all shadow-sm
              "
            />

            {/* Dropdown results */}
            {searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-cream border border-cream-mid rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                <SearchResultsDropdown query={searchQuery} navigate={navigate} />
              </div>
            )}
          </div>
        </div>

        {/* Actions droite */}
      <div className="shrink-0 flex items-center gap-3 ml-auto">
        {isAuthenticated ? (
          <>
            <Button
              onClick={() => navigate('/create-project')}
              size="sm"
              className="flex items-center gap-2 bg-transparent text-white hover:bg-rose-light/20 border border-transparent hover:border-cream"
            >
              <Plus className="w-6 h-6" />
              <span className="text-heading-md font-semibold">Créer un projet</span>
            </Button>
            <NotificationsMenu />
            <UserMenu
              username={username}
              initials={initials}
              onLogout={handleLogout}
              navigate={navigate}
            />
          </>
        ) : (
          <Button variant="outline" onClick={() => navigate('/login')} size="lg">
            Connexion
          </Button>
        )}
      </div>

    </header>
  )
}