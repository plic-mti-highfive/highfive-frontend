import { http, HttpResponse } from "msw";
import {
  notificationPreferencesUpdateInputSchema,
  notificationTypeSchema,
  type Notification,
  type NotificationPreference,
  type NotificationSummary,
  type NotificationTarget,
} from "@/domain";
import { getDb, type MockDatabase } from "../db";
import {
  apiUrl,
  errors,
  getAuthUser,
  paginate,
  simulateLatency,
  toUserSummary,
} from "./utils";

/** R-N3 : resout la cible vers ce qu'il faut pour construire la route FR exacte. */
function resolveTarget(
  db: MockDatabase,
  notification: Notification,
): NotificationTarget {
  switch (notification.targetType) {
    case "project": {
      const project = db.projects.findOne(
        (p) => p.id === notification.targetId,
      )!;
      return {
        type: "project",
        projectSlug: project.slug,
        projectTitle: project.title,
      };
    }
    case "task": {
      const task = db.tasks.findOne((t) => t.id === notification.targetId)!;
      const column = db.columns.findOne((c) => c.id === task.columnId)!;
      const project = db.projects.findOne((p) => p.id === column.projectId)!;
      return {
        type: "task",
        projectSlug: project.slug,
        projectTitle: project.title,
        taskTitle: task.title,
      };
    }
    case "comment": {
      const comment = db.comments.findOne(
        (c) => c.id === notification.targetId,
      )!;
      const project = db.projects.findOne((p) => p.id === comment.projectId)!;
      return {
        type: "comment",
        projectSlug: project.slug,
        projectTitle: project.title,
      };
    }
    case "message": {
      const conversation = db.conversations.findOne(
        (c) => c.id === notification.targetId,
      );
      let conversationTitle: string | undefined = conversation?.title;
      if (!conversationTitle && conversation?.projectId) {
        const project = db.projects.findOne(
          (p) => p.id === conversation.projectId,
        );
        if (project) conversationTitle = `Canal de ${project.title}`;
      }
      return {
        type: "message",
        conversationId: notification.targetId,
        conversationTitle,
      };
    }
  }
}

/** R-N2 : `actorIds` deja regroupe cote serveur ; on n'ajoute que la projection affichable. */
function toNotificationSummary(
  db: MockDatabase,
  notification: Notification,
): NotificationSummary {
  return {
    ...notification,
    actors: notification.actorIds
      .map((id) => db.users.findOne((u) => u.id === id))
      .filter((u): u is NonNullable<typeof u> => Boolean(u))
      .map(toUserSummary),
    target: resolveTarget(db, notification),
  };
}

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
      )
      .map((n) => toNotificationSummary(db, n));
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
