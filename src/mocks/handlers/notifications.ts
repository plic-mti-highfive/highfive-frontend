import { http, HttpResponse } from "msw";
import {
  notificationPreferencesUpdateInputSchema,
  notificationTypeSchema,
  type NotificationPreference,
} from "@/domain";
import { getDb } from "../db";
import {
  apiUrl,
  errors,
  getAuthUser,
  paginate,
  simulateLatency,
} from "./utils";

/** R-N4 : par defaut tout dans l'application, e-mail en plus pour ces trois types. */
const EMAIL_BY_DEFAULT = new Set([
  "invitation_received",
  "join_request_received",
  "message_received",
]);

function defaultPreferences(): NotificationPreference[] {
  return notificationTypeSchema.options.map((type) => ({
    type,
    channels: EMAIL_BY_DEFAULT.has(type) ? ["app", "email"] : ["app"],
  }));
}

export const notificationHandlers = [
  http.get(apiUrl("/notifications"), async ({ request }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    const db = getDb();
    const url = new URL(request.url);
    const notifications = db.notifications
      .find((n) => n.recipientId === user.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return HttpResponse.json(
      paginate(notifications, url.searchParams.get("cursor")),
    );
  }),

  http.post(
    apiUrl("/notifications/:notificationId/read"),
    async ({ request, params }) => {
      await simulateLatency();
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();
      const db = getDb();
      const notification = db.notifications.findOne(
        (n) => n.id === params.notificationId && n.recipientId === user.id,
      );
      if (!notification) return errors.notFound("Notification introuvable.");
      db.notifications.update((n) => n.id === notification.id, { read: true });
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.post(apiUrl("/notifications/read-all"), async ({ request }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    const db = getDb();
    for (const notification of db.notifications.find(
      (n) => n.recipientId === user.id && !n.read,
    )) {
      db.notifications.update((n) => n.id === notification.id, { read: true });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(apiUrl("/notifications/preferences"), async ({ request }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    const db = getDb();
    const overrides = db.notificationPreferences.find(
      (p) => p.userId === user.id,
    );
    const merged = defaultPreferences().map(
      (def) => overrides.find((o) => o.type === def.type) ?? def,
    );
    return HttpResponse.json(merged);
  }),

  http.patch(apiUrl("/notifications/preferences"), async ({ request }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    const parsed = notificationPreferencesUpdateInputSchema.safeParse(
      await request.json(),
    );
    if (!parsed.success) return errors.validation(parsed.error.issues);

    const db = getDb();
    for (const preference of parsed.data) {
      const existing = db.notificationPreferences.findOne(
        (p) => p.userId === user.id && p.type === preference.type,
      );
      if (existing) {
        db.notificationPreferences.update(
          (p) => p.userId === user.id && p.type === preference.type,
          { channels: preference.channels },
        );
      } else {
        db.notificationPreferences.insert({ ...preference, userId: user.id });
      }
    }
    const overrides = db.notificationPreferences.find(
      (p) => p.userId === user.id,
    );
    const merged = defaultPreferences().map(
      (def) => overrides.find((o) => o.type === def.type) ?? def,
    );
    return HttpResponse.json(merged);
  }),
];
