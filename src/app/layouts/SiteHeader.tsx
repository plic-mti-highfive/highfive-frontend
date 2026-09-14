import { useState } from "react";
import {
  Bell,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  Plus,
  Search,
  Shield,
  Sun,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "@base-ui/react/menu";

import { cn } from "@shared/lib/cn";
import { useAuth, useTheme } from "@shared/contexts";
import { Avatar, Button, IconButton } from "@shared/ui";
// Import direct (pas via le barrel @features/search) : le barrel reexporte
// aussi SearchPage, ce qui annulait son lazy loading dans le routeur
// (avertissement rollup INEFFECTIVE_DYNAMIC_IMPORT).
import { SearchBar } from "@features/search/components/SearchBar";
import { useUnreadNotificationsCount } from "@/api/queries/notifications";
import { useConversations } from "@/api/queries/conversations";
import {
  preloadCreateProject,
  preloadMessages,
  preloadNotifications,
  preloadUserProfile,
} from "../preload";
import { Logo } from "./Logo";

const popupCls =
  "z-dropdown w-72 origin-[var(--transform-origin)] rounded-xl border border-border bg-background py-1.5 shadow-overlay transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0";
const itemCls =
  "flex w-full cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2 text-body-md text-foreground outline-none transition-colors hover:bg-muted";
const separatorCls = "my-1.5 mx-2 border-t border-border";

/**
 * Compteur de messages non lus pour le menu du compte : derive de
 * `useConversations` (deja utilise par la messagerie, `unreadCount` par
 * conversation), pas d'un hook dedie qui n'existe pas encore — reste dans
 * le perimetre "en-tete" plutot que de toucher `src/api/queries/**`.
 */
function useUnreadMessagesCount(): number {
  const { data } = useConversations();
  return (data ?? []).reduce((sum, c) => sum + c.unreadCount, 0);
}

function NotificationsBell() {
  const navigate = useNavigate();
  const unreadCount = useUnreadNotificationsCount();

  return (
    <IconButton
      aria-label="Notifications"
      size="lg"
      onClick={() => navigate("/notifications")}
      onMouseEnter={() => void preloadNotifications()}
      onFocus={() => void preloadNotifications()}
    >
      <span className="relative inline-flex items-center justify-center">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-rose ring-2 ring-sidebar"
          />
        )}
      </span>
    </IconButton>
  );
}

function ThemeOption({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-label transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * Menu du compte (doc 06 §3.4) : en-tete nom + @pseudo (lien profil, evite
 * la redondance "Mon profil"/"Mes projets" qui menaient toutes deux a
 * `/u/:pseudo`), Messages (nouveau, avec compteur non lu), theme, puis
 * Administration si admin. Pas d'entree "Notifications" (deja visible via
 * la cloche de l'en-tete) ni "Reglages" (aucune page correspondante).
 */
function AccountMenu({
  username,
  displayName,
  avatar,
  isAdmin,
  isLoggingOut,
  onLogout,
}: {
  username: string;
  displayName?: string;
  avatar: string;
  isAdmin: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const unreadMessages = useUnreadMessagesCount();

  return (
    <Menu.Root>
      <Menu.Trigger
        className="flex size-10 items-center justify-center rounded-pill outline-none"
        aria-label="Mon compte"
      >
        <Avatar name={displayName ?? username} src={avatar} size="md" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-dropdown"
        >
          <Menu.Popup className={popupCls}>
            <Menu.Item
              render={<Link to={`/u/${username}`} />}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 outline-none transition-colors hover:bg-muted"
              onMouseEnter={() => void preloadUserProfile()}
              onFocus={() => void preloadUserProfile()}
            >
              <Avatar name={displayName ?? username} src={avatar} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-body-md font-semibold text-foreground">
                  {displayName ?? username}
                </p>
                <p className="truncate text-body-sm text-muted-foreground">
                  @{username}
                </p>
              </div>
            </Menu.Item>

            <div className={separatorCls} />

            <Menu.Item
              render={<Link to="/messages" />}
              className={itemCls}
              onMouseEnter={() => void preloadMessages()}
              onFocus={() => void preloadMessages()}
            >
              <MessageSquare
                size={18}
                className="shrink-0 text-muted-foreground"
              />
              <span className="flex-1">Messages</span>
              {unreadMessages > 0 && (
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-label text-white tabular-nums"
                  aria-label={`${unreadMessages} message${unreadMessages > 1 ? "s" : ""} non lu${unreadMessages > 1 ? "s" : ""}`}
                >
                  {unreadMessages}
                </span>
              )}
            </Menu.Item>

            <div className={separatorCls} />

            <div className="flex gap-1 px-3 py-1">
              <ThemeOption
                label="Clair"
                icon={<Sun size={16} />}
                active={theme === "light"}
                onClick={() => setTheme("light")}
              />
              <ThemeOption
                label="Sombre"
                icon={<Moon size={16} />}
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
              />
              <ThemeOption
                label="Système"
                icon={<Monitor size={16} />}
                active={theme === "system"}
                onClick={() => setTheme("system")}
              />
            </div>

            {isAdmin && (
              <>
                <div className={separatorCls} />
                <Menu.Item
                  className={itemCls}
                  onClick={() => navigate("/admin")}
                >
                  <Shield
                    size={18}
                    className="shrink-0 text-muted-foreground"
                  />
                  Administration
                </Menu.Item>
              </>
            )}

            <div className={separatorCls} />

            <Menu.Item
              closeOnClick={false}
              onClick={onLogout}
              render={
                <Button
                  // Menu.Item gere deja son propre role="menuitem" et son
                  // clavier (Entree/Espace, navigation flechee) : un <button>
                  // natif imbrique double ce comportement (avertissement
                  // base-ui). `render={<span/>}` fait rendre un hote non
                  // natif par la primitive (nativeButton se deduit a `false`
                  // des que `render` est fourni, voir button.tsx), sur lequel
                  // Menu.Item fusionne ses propres attributs/gestionnaires.
                  render={<span />}
                  variant="ghost"
                  loading={isLoggingOut}
                  className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-body-md font-normal text-rose hover:bg-rose-light hover:text-rose-dark"
                >
                  <LogOut size={18} className="shrink-0" />
                  Se déconnecter
                </Button>
              }
            />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

/**
 * En-tete de la coquille site (doc 06 §3) : 56px, collant, fond opaque.
 * Nav principale reduite a "Decouvrir" (V2, retour util. 4) : "Mes projets"
 * menait au meme endroit que le profil (`/u/:pseudo`), retire de la barre
 * et du menu du compte plutot que duplique.
 */
export function SiteHeader() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function handleLogout() {
    setIsLoggingOut(true);
    logout()
      .then(() => navigate("/"))
      .finally(() => setIsLoggingOut(false));
  }

  return (
    <header className="sticky top-0 z-[21] grid h-14 w-full grid-cols-[1fr_auto_1fr] items-center border-b border-sidebar-border bg-sidebar px-6">
      {/* Colonne 1 : Gauche */}
      <div className="flex items-center justify-start gap-6">
        <Logo className="text-2xl" />
      </div>

      {/* Colonne 2 : Centre (parfaitement au milieu) */}
      <div className="hidden md:flex md:justify-center">
        <SearchBar navigate={navigate} />
      </div>

      {/* Colonne 3 : Droite */}
      <div className="flex items-center justify-end gap-3">
        {/* Tablette/mobile */}
        <IconButton
          aria-label="Rechercher"
          size="lg"
          className="md:hidden"
          onClick={() => navigate("/recherche")}
        >
          <Search size={22} />
        </IconButton>

        {isLoading ? null : isAuthenticated && user ? (
          <>
            <Button
              onClick={() => navigate("/projets/nouveau")}
              onMouseEnter={() => void preloadCreateProject()}
              onFocus={() => void preloadCreateProject()}
              size="sm"
              variant="ghost"
              className="hidden items-center gap-1.5 sm:flex"
            >
              <Plus className="size-4" />
              Créer un projet
            </Button>
            <NotificationsBell />
            <AccountMenu
              username={user.username}
              displayName={user.displayName}
              avatar={user.avatar}
              isAdmin={user.platformRole === "admin"}
              isLoggingOut={isLoggingOut}
              onLogout={handleLogout}
            />
          </>
        ) : (
          <Button variant="outline" onClick={() => navigate("/connexion")}>
            Connexion
          </Button>
        )}
      </div>
    </header>
  );
}
