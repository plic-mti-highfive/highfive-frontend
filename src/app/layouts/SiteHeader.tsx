import {
  Bell,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Search,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu } from "@base-ui/react/menu";

import { cn } from "@shared/lib/cn";
import { useAuth, useTheme } from "@shared/contexts";
import { Avatar, Button, IconButton } from "@shared/ui";
// Import direct (pas via le barrel @features/search) : le barrel reexporte
// aussi SearchPage, ce qui annulait son lazy loading dans le routeur
// (avertissement rollup INEFFECTIVE_DYNAMIC_IMPORT).
import { SearchBar } from "@features/search/components/SearchBar";
import { useUnreadNotificationsCount } from "@/api/queries/notifications";
import { Logo } from "./Logo";

const popupCls =
  "z-dropdown w-72 origin-[var(--transform-origin)] rounded-xl border border-border bg-background py-1.5 shadow-overlay transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0";
const itemCls =
  "flex w-full cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2 text-body-md text-foreground outline-none transition-colors hover:bg-muted";
const separatorCls = "my-1.5 mx-2 border-t border-border";

/** Nav principale (Decouvrir / Mes projets), signalee autrement que par la seule couleur (R-NAV1). */
function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          "relative flex h-full items-center text-ui-md font-semibold transition-colors",
          isActive
            ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground"
            : "text-muted-foreground hover:text-foreground",
        )
      }
    >
      {children}
    </NavLink>
  );
}

function NotificationsBell() {
  const navigate = useNavigate();
  const unreadCount = useUnreadNotificationsCount();

  return (
    <IconButton
      aria-label="Notifications"
      onClick={() => navigate("/notifications")}
      className="relative"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span
          aria-hidden
          className="absolute right-2.5 top-2.5 size-2 rounded-full bg-rose"
        />
      )}
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

/** Menu du compte : ordre doc 06 §3.4 (pseudo, Mon profil, Mes projets, theme, Administration, Se deconnecter). */
function AccountMenu({
  username,
  displayName,
  avatar,
  isAdmin,
  onLogout,
}: {
  username: string;
  displayName?: string;
  avatar: string;
  isAdmin: boolean;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar name={displayName ?? username} src={avatar} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-body-md font-semibold text-foreground">
                  {displayName ?? username}
                </p>
                <p className="truncate text-body-sm text-muted-foreground">
                  @{username}
                </p>
              </div>
            </div>

            <div className={separatorCls} />

            <Menu.Item
              className={itemCls}
              onClick={() => navigate(`/u/${username}`)}
            >
              <User size={18} className="shrink-0 text-muted-foreground" />
              Mon profil
            </Menu.Item>
            <Menu.Item
              className={itemCls}
              onClick={() => navigate(`/u/${username}`)}
            >
              <User size={18} className="shrink-0 text-muted-foreground" />
              Mes projets
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
              className={cn(
                itemCls,
                "text-rose hover:bg-rose-light hover:text-rose-dark",
              )}
              onClick={onLogout}
            >
              <LogOut size={18} className="shrink-0" />
              Se déconnecter
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

/**
 * En-tete de la coquille site (doc 06 §3) : 56px, collant, fond opaque.
 */
export function SiteHeader() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-sticky flex h-14 w-full items-center gap-8 border-b border-sidebar-border bg-sidebar px-6">
      <div className="flex h-full shrink-0 items-center gap-6">
        <Logo className="text-2xl" />
        {isAuthenticated && (
          <nav className="hidden h-full items-center gap-6 md:flex">
            <NavItem to="/">Découvrir</NavItem>
            <NavItem to={`/u/${user?.username ?? ""}`}>Mes projets</NavItem>
          </nav>
        )}
      </div>

      <div className="hidden flex-1 justify-center md:flex">
        <SearchBar navigate={navigate} />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        {/* Tablette/mobile (doc 06 §3.2) : le champ de recherche devient un
            bouton — le panneau de recherche plein ecran n'est pas dans ce
            lot, on ouvre directement /recherche. */}
        <IconButton
          aria-label="Rechercher"
          className="md:hidden"
          onClick={() => navigate("/recherche")}
        >
          <Search size={20} />
        </IconButton>
        {isLoading ? null : isAuthenticated && user ? (
          <>
            <Button
              onClick={() => navigate("/projets/nouveau")}
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
              onLogout={() => {
                logout().then(() => navigate("/"));
              }}
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
