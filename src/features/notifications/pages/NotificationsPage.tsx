import { Bell, CheckCheck } from "lucide-react";
import { useState } from "react";
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
import { cn } from "@shared/lib/cn";
import { NotificationItem } from "../components/NotificationItem";
import {
  categoryLabel,
  groupNotificationsByDate,
  notificationCategory,
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
} from "../lib/notificationGroups";

export function NotificationsPage() {
  const [category, setCategory] = useState<NotificationCategory | "all">("all");
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const allItems = notifications.data?.items ?? [];
  const items =
    category === "all"
      ? allItems
      : allItems.filter((n) => notificationCategory(n.type) === category);
  const groups = groupNotificationsByDate(items);
  const unreadCount = allItems.filter((n) => !n.read).length;

  // Seules les familles reellement presentes meritent une pilule de filtre.
  const availableCategories = NOTIFICATION_CATEGORIES.filter((c) =>
    allItems.some((n) => notificationCategory(n.type) === c),
  );

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <PageHeader
          title="Notifications"
          actions={
            unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                <CheckCheck size={16} />
                Tout marquer comme lu
              </Button>
            )
          }
        />

        {availableCategories.length > 0 && (
          <div className="mt-4 -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterPill
              active={category === "all"}
              onClick={() => setCategory("all")}
            >
              Tout
            </FilterPill>
            {availableCategories.map((c) => (
              <FilterPill
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
              >
                {categoryLabel(c)}
              </FilterPill>
            ))}
          </div>
        )}

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
              title={
                category === "all"
                  ? "Aucune notification pour l'instant"
                  : "Aucune notification dans ce filtre"
              }
              description="Les highfives, commentaires et invitations que tu reçois apparaîtront ici."
            />
          ) : (
            <div className="flex flex-col gap-6">
              {groups.map((group) => (
                <section key={group.key} className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 px-2">
                    <p className="text-label uppercase text-muted-foreground">
                      {group.label}
                    </p>
                    <span className="text-label tabular-nums text-muted-foreground/70">
                      {String(group.items.length).padStart(2, "0")}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-border"
                    />
                  </div>
                  {group.items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={(id) => markRead.mutate(id)}
                    />
                  ))}
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="xs"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-7 shrink-0 rounded-full px-3",
        !active && "text-muted-foreground",
      )}
    >
      {children}
    </Button>
  );
}
