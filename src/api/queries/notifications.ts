import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as notificationsApi from "../notifications";
import { queryKeys } from "./keys";
import type { NotificationPreferencesUpdateInput } from "@/domain";

export function useNotifications(cursor?: string) {
  return useQuery({
    queryKey: queryKeys.notifications.list(cursor),
    queryFn: () => notificationsApi.listNotifications(cursor),
  });
}

/**
 * Compteur pour le badge de la cloche (en-tete) : derive de la premiere page
 * de `useNotifications`, meme cle TanStack Query donc rafraichi par les
 * memes invalidations que "Tout marquer comme lu".
 */
export function useUnreadNotificationsCount(): number {
  const { data } = useNotifications();
  return data?.items.filter((notification) => !notification.read).length ?? 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsApi.markNotificationRead(notificationId),
    onSuccess: () => {
      // Invalide toute la liste (et le compteur de l'en-tete, qui lit la meme cle).
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });
}

/** R-N4 : preferences par type et par canal. */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: notificationsApi.getNotificationPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NotificationPreferencesUpdateInput) =>
      notificationsApi.updateNotificationPreferences(input),
    onSuccess: (preferences) => {
      queryClient.setQueryData(
        queryKeys.notifications.preferences(),
        preferences,
      );
    },
  });
}
