import { Search, Bell, User, FolderOpen, MessageSquare, Settings, LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu } from '@base-ui/react/menu'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ─── Styles partagés ─────────────────────────────────────────────────────────

const popupCls =
  'bg-cream border border-cream-mid rounded-xl shadow-lg py-1.5 min-w-56 z-50 origin-[var(--transform-origin)] transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0'

const itemCls =
  'flex items-center gap-3 w-full px-3 py-2 text-body-md text-ink rounded-lg cursor-pointer hover:bg-cream-dark outline-none select-none transition-colors'

const separatorCls = 'border-t border-cream-mid my-1.5 mx-2'

// ─── Menu notifications ───────────────────────────────────────────────────────

function NotificationsMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger
        className="flex items-center justify-center w-9 h-9 rounded-lg text-ink-muted hover:bg-cream-dark hover:text-ink transition-colors outline-none"
        aria-label="Notifications"
      >
        <Bell size={18} />
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

// ─── Menu utilisateur ─────────────────────────────────────────────────────────

type UserMenuProps = {
  username: string
  initials: string
  onLogout: () => void
  navigate: (to: string) => void
}

function UserMenu({ username, initials, onLogout, navigate }: UserMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className="flex items-center justify-center w-9 h-9 rounded-full bg-rose-light text-rose-dark text-ui-sm font-bold hover:bg-rose-mid transition-colors outline-none select-none"
        aria-label="Mon compte"
      >
        {initials}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8}>
          <Menu.Popup className={popupCls}>

            {/* Infos compte */}
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

            <Menu.Item className={itemCls} onClick={() => navigate('/profile')}>
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
  const navigate  = useNavigate()
  useLocation() // re-lit localStorage à chaque navigation

  const isAuthenticated = localStorage.getItem('authenticated') === 'true'
  const username        = localStorage.getItem('username') ?? 'Utilisateur'
  const initials        = username.slice(0, 2).toUpperCase()

  function handleCreateProject() {
    navigate(isAuthenticated ? '/create-project' : '/login')
  }

  function handleLogout() {
    localStorage.removeItem('authenticated')
    localStorage.removeItem('username')
    navigate('/')
  }

  return (
    <header className="w-full bg-cream border-b border-cream-mid px-6 h-16 flex items-center gap-4">

      {/* Logo */}
      <div className="shrink-0">
        <Logo className="text-xl" />
      </div>

      {/* Barre de recherche */}
      <div className="flex-1 flex justify-center px-4">
        <div className="relative w-full max-w-3xl">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-10 h-9 bg-cream-dark border-cream-mid placeholder:text-ink-muted text-body-md focus-visible:border-ink focus-visible:ring-ink/20"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-3">
        <Button
          className="h-9 px-4 text-ui-md text-cream border-0"
          onClick={handleCreateProject}
        >
          Créer un projet
        </Button>

        {isAuthenticated ? (
          <>
            <NotificationsMenu />
            <UserMenu
              username={username}
              initials={initials}
              onLogout={handleLogout}
              navigate={navigate}
            />
          </>
        ) : (
          <Button variant="outline" onClick={() => navigate('/login')}>
            Connexion
          </Button>
        )}
      </div>

    </header>
  )
}
