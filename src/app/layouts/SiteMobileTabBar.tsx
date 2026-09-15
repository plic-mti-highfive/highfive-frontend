import { Bell, Compass, MessageSquare, Plus, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@shared/lib/cn";
import { useAuth } from "@shared/contexts";

const itemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex flex-1 flex-col items-center gap-1 py-2 text-label transition-colors",
    isActive ? "text-foreground" : "text-muted-foreground",
  );

/**
 * Barre basse mobile (doc 06 §3.3), 5 entrées icône + libellé. `Créer` est
 * une action directe vers `/projets/nouveau`, pas un onglet. Visible
 * uniquement sous 640px (breakpoint `sm`).
 *
 * V2, retour util. 4 : l'ancienne entrée "Mes projets" menait au meme
 * endroit que "Profil" (`/u/:pseudo`), doublon retire au profit de
 * Notifications — pas encore accessible sur mobile (pas de cloche dans
 * l'en-tete en dessous de `md`, voir `SiteHeader`).
 */
export function SiteMobileTabBar() {
  const { isAuthenticated, user } = useAuth();
  const profilePath =
    isAuthenticated && user ? `/u/${user.username}` : "/connexion";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-sticky flex border-t border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="Navigation principale"
    >
      <NavLink to="/" end className={itemClass}>
        <Compass size={20} />
        Découvrir
      </NavLink>
      <NavLink to="/notifications" className={itemClass}>
        <Bell size={20} />
        Notifications
      </NavLink>
      <NavLink to="/projets/nouveau" className={itemClass}>
        <Plus size={20} />
        Créer
      </NavLink>
      <NavLink to="/messages" className={itemClass}>
        <MessageSquare size={20} />
        Messages
      </NavLink>
      <NavLink to={profilePath} className={itemClass}>
        <User size={20} />
        Profil
      </NavLink>
    </nav>
  );
}
