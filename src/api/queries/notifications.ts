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

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsApi.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
