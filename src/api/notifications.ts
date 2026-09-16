import { z } from "zod";
import { apiFetch } from "./client";
import {
  notificationPreferenceSchema,
  notificationSummarySchema,
  paginatedSchema,
  type NotificationPreference,
  type NotificationPreferencesUpdateInput,
  type NotificationSummary,
  type Paginated,
} from "@/domain";

/** R-N1/R-N2 : deja regroupees par acteurs, R-N3 : cible resolue pour le routage. */
export function listNotifications(
  cursor?: string,
): Promise<Paginated<NotificationSummary>> {
  return apiFetch("/notifications", {
    query: { cursor },
    schema: paginatedSchema(notificationSummarySchema),
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
