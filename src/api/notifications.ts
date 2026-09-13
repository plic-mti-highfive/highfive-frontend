import { z } from "zod";
import { apiFetch } from "./client";
import {
  notificationPreferenceSchema,
  notificationSchema,
  paginatedSchema,
  type Notification,
  type NotificationPreference,
  type NotificationPreferencesUpdateInput,
  type Paginated,
} from "@/domain";

export function listNotifications(
  cursor?: string,
): Promise<Paginated<Notification>> {
  return apiFetch("/notifications", {
    query: { cursor },
    schema: paginatedSchema(notificationSchema),
  });
}

export function markNotificationRead(notificationId: string): Promise<void> {
  return apiFetch(`/notifications/${notificationId}/read`, { method: "POST" });
}

export function markAllNotificationsRead(): Promise<void> {
  return apiFetch("/notifications/read-all", { method: "POST" });
}

export function getNotificationPreferences(): Promise<
  NotificationPreference[]
> {
  return apiFetch("/notifications/preferences", {
    schema: z.array(notificationPreferenceSchema),
  });
}

export function updateNotificationPreferences(
  input: NotificationPreferencesUpdateInput,
): Promise<NotificationPreference[]> {
  return apiFetch("/notifications/preferences", {
    method: "PATCH",
    body: input,
    schema: z.array(notificationPreferenceSchema),
  });
}
