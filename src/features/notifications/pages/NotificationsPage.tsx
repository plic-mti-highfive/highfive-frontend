import { useEffect, useState } from "react";
import { Header, Footer } from "@features/layout";
import { Bell, CheckCheck } from "lucide-react";
import { notificationService } from "@/api/services";
import { NotificationItem } from "../components/NotificationItem";
import type { Notification } from "../types";

export function NotificationsPage() {
  // Les notifications etaient importees en dur depuis les donnees mock : elles
  // passent par la couche API, comme le reste.
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    notificationService
      .getNotifications()
      .then(setNotifications)
      .catch((err) =>
        console.error("Erreur lors du chargement des notifications:", err),
      );
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    // Mise a jour optimiste : « Tout marquer comme lu » ne changeait qu'un etat
    // local et n'etait jamais persiste.
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error("Erreur lors du marquage des notifications:", err);
      setNotifications(previous);
    }
  };

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-3.5rem)] bg-background">
        <div className="px-8 py-8">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell size={22} className="text-foreground" />
              <h1 className="text-2xl font-bold text-foreground">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-6 h-6 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck size={16} />
                Tout marquer comme lu
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <Bell size={40} strokeWidth={1.5} />
              <p className="text-base">Aucune notification pour l'instant.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden bg-sidebar divide-y divide-border">
              {unread.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-muted/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Nouvelles
                    </p>
                  </div>
                  {unread.map((notif) => (
                    <NotificationItem key={notif.id} notification={notif} />
                  ))}
                </>
              )}

              {read.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-muted/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Précédentes
                    </p>
                  </div>
                  {read.map((notif) => (
                    <NotificationItem key={notif.id} notification={notif} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
