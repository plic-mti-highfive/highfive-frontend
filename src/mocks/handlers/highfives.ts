import { http, HttpResponse } from "msw";
import { getDb } from "../db";
import { paginate, toUserSummary } from "./utils";
import { apiUrl, errors, getAuthUser, simulateLatency } from "./utils";

export const highfiveHandlers = [
  http.post(apiUrl("/projects/:slug/highfive"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    // R-H2 : le porteur ne peut pas highfiver son propre projet.
    if (user.id === project.ownerId)
      return errors.forbidden("Tu ne peux pas highfiver ton propre projet.");

    const already = db.highfives.findOne(
      (h) => h.projectId === project.id && h.userId === user.id,
    );
    if (!already) {
      db.highfives.insert({
        projectId: project.id,
        userId: user.id,
        givenAt: new Date().toISOString(),
      });
      db.projects.update((p) => p.id === project.id, {
        highfiveCount: project.highfiveCount + 1,
      });
    }
    const updated = db.projects.findOne((p) => p.id === project.id)!;
    return HttpResponse.json({
      given: true,
      highfiveCount: updated.highfiveCount,
    });
  }),

  http.delete(
    apiUrl("/projects/:slug/highfive"),
    async ({ request, params }) => {
      await simulateLatency();
      const db = getDb();
      const project = db.projects.findOne((p) => p.slug === params.slug);
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();

      const removed = db.highfives.remove(
        (h) => h.projectId === project.id && h.userId === user.id,
      );
      // R-H4 : retirer un highfive ne genere aucune notification.
      if (removed > 0) {
        db.projects.update((p) => p.id === project.id, {
          highfiveCount: Math.max(0, project.highfiveCount - 1),
        });
      }
      const updated = db.projects.findOne((p) => p.id === project.id)!;
      return HttpResponse.json({
        given: false,
        highfiveCount: updated.highfiveCount,
      });
    },
  ),

  http.get(apiUrl("/projects/:slug/highfives"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    // R-H3 : liste publique des personnes ayant highfive.
    const givers = db.highfives
      .find((h) => h.projectId === project.id)
      .map((h) => db.users.findOne((u) => u.id === h.userId))
      .filter((u): u is NonNullable<typeof u> => Boolean(u));
    const page = paginate(givers, cursor);
    return HttpResponse.json({ ...page, items: page.items.map(toUserSummary) });
  }),
];
