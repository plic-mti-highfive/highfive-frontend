import { http, HttpResponse } from "msw";
import { announcementCreateInputSchema } from "@/domain";
import { nextId } from "../data/ids";
import { getDb } from "../db";
import {
  apiUrl,
  errors,
  getAuthUser,
  hasAtLeastRole,
  simulateLatency,
  toUserSummary,
} from "./utils";

function roleOf(projectId: string, userId: string | undefined) {
  if (!userId) return undefined;
  return getDb().memberships.findOne(
    (m) => m.projectId === projectId && m.userId === userId,
  )?.role;
}

export const announcementHandlers = [
  http.get(apiUrl("/projects/:slug/announcements"), async ({ params }) => {
    await simulateLatency();
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const announcements = db.announcements
      .find((a) => a.projectId === project.id)
      .map((a) => ({
        ...a,
        author: toUserSummary(db.users.findOne((u) => u.id === a.authorId)!),
      }))
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    return HttpResponse.json(announcements);
  }),

  http.post(
    apiUrl("/projects/:slug/announcements"),
    async ({ request, params }) => {
      await simulateLatency();
      const db = getDb();
      const project = db.projects.findOne((p) => p.slug === params.slug);
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      // R-A1 : porteur et co-porteur seulement.
      if (
        !hasAtLeastRole(roleOf(project.id, user?.id) ?? "observer", "co_owner")
      ) {
        return errors.forbidden();
      }

      const parsed = announcementCreateInputSchema.safeParse(
        await request.json(),
      );
      if (!parsed.success) return errors.validation(parsed.error.issues);

      // R-A2 : une seule annonce epinglee a la fois.
      if (parsed.data.pinned) {
        for (const existing of db.announcements.find(
          (a) => a.projectId === project.id && a.pinned,
        )) {
          db.announcements.update((a) => a.id === existing.id, {
            pinned: false,
          });
        }
      }

      const announcement = {
        id: nextId(),
        projectId: project.id,
        authorId: user!.id,
        title: parsed.data.title,
        body: parsed.data.body,
        pinned: parsed.data.pinned ?? false,
        publishedAt: new Date().toISOString(),
      };
      db.announcements.insert(announcement);
      return HttpResponse.json(announcement, { status: 201 });
    },
  ),

  http.post(
    apiUrl("/announcements/:announcementId/pin"),
    async ({ request, params }) => {
      await simulateLatency();
      const db = getDb();
      const announcement = db.announcements.findOne(
        (a) => a.id === params.announcementId,
      );
      if (!announcement) return errors.notFound("Annonce introuvable.");
      const user = getAuthUser(request);
      if (
        !hasAtLeastRole(
          roleOf(announcement.projectId, user?.id) ?? "observer",
          "co_owner",
        )
      ) {
        return errors.forbidden();
      }
      for (const existing of db.announcements.find(
        (a) => a.projectId === announcement.projectId && a.pinned,
      )) {
        db.announcements.update((a) => a.id === existing.id, { pinned: false });
      }
      const updated = db.announcements.update((a) => a.id === announcement.id, {
        pinned: true,
      });
      return HttpResponse.json(updated);
    },
  ),

  http.delete(
    apiUrl("/announcements/:announcementId"),
    async ({ request, params }) => {
      await simulateLatency();
      const db = getDb();
      const announcement = db.announcements.findOne(
        (a) => a.id === params.announcementId,
      );
      if (!announcement) return errors.notFound("Annonce introuvable.");
      const user = getAuthUser(request);
      if (
        !hasAtLeastRole(
          roleOf(announcement.projectId, user?.id) ?? "observer",
          "co_owner",
        )
      ) {
        return errors.forbidden();
      }
      db.announcements.remove((a) => a.id === announcement.id);
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
