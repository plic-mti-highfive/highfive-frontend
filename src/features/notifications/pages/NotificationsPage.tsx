import { Bell, CheckCheck } from "lucide-react";
import { ApiError } from "@/api/client";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/api/queries/notifications";
import {
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from "@shared/ui";
import { NotificationItem } from "../components/NotificationItem";

export function NotificationsPage() {
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = notifications.data?.items ?? [];
  const unread = items.filter((n) => !n.read);
  const previous = items.filter((n) => n.read);
  const unreadCount = unread.length;

  return (
    <>
      <main className="bg-background">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <PageHeader
            title="Notifications"
            actions={
              unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                >
                  <CheckCheck size={16} />
                  Tout marquer comme lu
                </Button>
              )
            }
          />

          <div className="mt-4">
            {notifications.isLoading ? (
              <div className="flex flex-col gap-3 py-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : notifications.isError ? (
              <ErrorState
                message={
                  notifications.error instanceof ApiError
                    ? notifications.error.message
                    : "Impossible de charger tes notifications."
                }
                onRetry={() => notifications.refetch()}
              />
            ) : items.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="Aucune notification pour l'instant"
                description="Les highfives, commentaires et invitations que tu reçois apparaîtront ici."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {unread.length > 0 && (
                  <>
                    <p className="px-2 py-1.5 text-label uppercase text-muted-foreground">
                      Nouvelles
                    </p>
                    {unread.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={(id) => markRead.mutate(id)}
                      />
                    ))}
                  </>
                )}
                {previous.length > 0 && (
                  <>
                    <p className="px-2 pt-3 text-label uppercase text-muted-foreground">
                      Précédentes
                    </p>
                    {previous.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={(id) => markRead.mutate(id)}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
