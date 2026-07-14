import {
  Bell,
  User,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Menu } from "@base-ui/react/menu";

import { Logo } from "@features/layout";
import { Button } from "@shared/components/ui/button";
import { SearchBar } from "@features/search";
import { useAuth } from "@shared/contexts";
import { NotificationItem } from "@features/notifications";
import { mockNotifications } from "@/api/services/mock/data/mockNotifications";

const popupCls =
  "bg-background border border-border rounded-xl shadow-lg py-1.5 w-80 origin-[var(--transform-origin)] transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0";

const itemCls =
  "flex items-center gap-3 w-full px-3 py-2 text-body-lg text-foreground rounded-lg cursor-pointer hover:bg-muted outline-none select-none transition-colors";

const separatorCls = "border-t border-border my-1.5 mx-2";

function NotificationsMenu() {
  const navigate = useNavigate();
  const recent = mockNotifications.slice(0, 4);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <Menu.Root>
      <Menu.Trigger
        className="relative flex items-center justify-center w-12 h-12 rounded-full text-foreground hover:bg-muted transition-all outline-none cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        )}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-[10000]"
        >
          <Menu.Popup className={popupCls}>
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <span className="text-sm font-semibold text-foreground">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Recent notifications */}
            {recent.length > 0 ? (
              <div className="py-1">
                {recent.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-body-md text-muted-foreground">
                  Aucune notification pour l'instant.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-border px-3 py-2">
              <Menu.Item
                className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 py-1.5 rounded-lg hover:bg-muted outline-none cursor-pointer transition-colors"
                onClick={() => navigate("/notifications")}
              >
                Voir tout
              </Menu.Item>
            </div>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

type UserMenuProps = {
  username: string;
  avatar: string;
  profilePath: string;
  onLogout: () => void;
  navigate: (to: string) => void;
};

function UserMenu({
  username,
  avatar,
  profilePath,
  onLogout,
  navigate,
}: UserMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-light text-rose-dark text-body-md font-bold hover:bg-rose-mid transition-colors outline-none select-none"
        aria-label="Mon compte"
      >
        <img
          src={avatar}
          alt={username}
          className="w-12 h-12 rounded-full shrink-0 object-cover"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-[10000]"
        >
          <Menu.Popup className={popupCls}>
            <div className="flex items-center gap-3 px-3 py-2.5 mb-0.5">
              <div className="w-10 h-10 rounded-full bg-rose-light text-rose-dark text-ui-md font-bold flex items-center justify-center shrink-0">
                <img
                  src={avatar}
                  alt={username}
                  className="w-12 h-12 rounded-full shrink-0 object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-body-lg font-semibold text-foreground truncate">
                  @{username}
                </p>
                <p className="text-body-md text-muted-foreground truncate">
                  Membre
                </p>
              </div>
            </div>

            <div className={separatorCls} />

            <Menu.Item
              className={itemCls}
              onClick={() => navigate(profilePath)}
            >
              <User size={18} className="text-muted-foreground shrink-0" />
              Mon profil
            </Menu.Item>
            <Menu.Item
              className={itemCls}
              onClick={() => navigate("/messages")}
            >
              <MessageSquare
                size={18}
                className="text-muted-foreground shrink-0"
              />
              Messages
            </Menu.Item>
            <Menu.Item
              className={itemCls}
              onClick={() => navigate("/settings")}
            >
              <Settings size={18} className="text-muted-foreground shrink-0" />
              Paramètres
            </Menu.Item>

            <div className={separatorCls} />

            <Menu.Item
              className={`${itemCls} text-rose hover:bg-rose-light hover:text-rose-dark`}
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

// --- Header -------------------------------------------------------------------

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  console.log(user);
  const username = user?.email.split("@")[0] ?? "";

  return (
    <header className="sticky top-0 z-[9999] w-full bg-sidebar border-b border-sidebar-border px-8 h-14 flex items-center gap-8">
      {/* Logo */}
      <div className="shrink-0">
        <Logo className="text-2xl" textColor="text-foreground" />
      </div>

      {/* Barre de recherche centrée absolument */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
        <SearchBar navigate={navigate} />
      </div>

      {/* Actions droite */}
      <div className="shrink-0 flex items-center gap-3 ml-auto">
        {isAuthenticated ? (
          <>
            <Button
              onClick={() => navigate("/create-project")}
              size="sm"
              className="flex items-center gap-1.5 bg-transparent text-foreground hover:bg-muted border border-transparent hover:border-border"
            >
              <Plus className="w-5 h-5" />
              <span className="text-body-md font-bold">Créer un projet</span>
            </Button>
            <NotificationsMenu />
            <UserMenu
              username={username}
              avatar={
                user?.profile?.avatarPath ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`
              }
              profilePath={user ? `/user/${user.id}` : "/"}
              onLogout={() => {
                logout().then(() => navigate("/"));
              }}
              navigate={navigate}
            />
          </>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            size="lg"
          >
            Connexion
          </Button>
        )}
      </div>
    </header>
  );
}
