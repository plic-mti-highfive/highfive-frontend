import { Bell, User, FolderOpen, MessageSquare, Settings, LogOut, Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Menu } from '@base-ui/react/menu'
import { useState } from 'react'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'


const popupCls =
  'bg-cream border border-cream-mid rounded-xl shadow-lg py-1.5 min-w-56 z-50 origin-[var(--transform-origin)] transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0'

const itemCls =
  'flex items-center gap-3 w-full px-3 py-2 text-body-md text-ink rounded-lg cursor-pointer hover:bg-cream-dark outline-none select-none transition-colors'

const separatorCls = 'border-t border-cream-mid my-1.5 mx-2'


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
    <header className="sticky top-0 z-50 w-full bg-ink-soft border-b border-ink-muted px-8 h-16 flex items-center gap-8">

      {/* Logo */}
      <div className="shrink-0">
        <Logo className="text-2xl" />
      </div>

      {/* Barre de recherche centrée absolument */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-dark pointer-events-none" />
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