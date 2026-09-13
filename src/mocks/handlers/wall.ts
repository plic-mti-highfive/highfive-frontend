import { http, HttpResponse } from "msw";
import { wallToTasksInputSchema } from "@/domain";
import { nextId } from "../data/ids";
import { getDb } from "../db";
import {
  apiUrl,
  errors,
  getAuthUser,
  hasAtLeastRole,
  simulateLatency,
} from "./utils";

function roleOf(projectId: string, userId: string | undefined) {
  if (!userId) return undefined;
  return getDb().memberships.findOne(
    (m) => m.projectId === projectId && m.userId === userId,
  )?.role;
}

export const wallHandlers = [
  http.get(apiUrl("/projects/:slug/wall"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const user = getAuthUser(request);
    // R-W1 : lecture reservee aux membres (le porteur peut ouvrir la lecture aux observateurs, non modelise ici).
    if (!hasAtLeastRole(roleOf(project.id, user?.id) ?? "observer", "observer"))
      return errors.forbidden();

    const wall = db.walls.findOne((w) => w.projectId === project.id);
    if (!wall) return errors.notFound("Mur introuvable.");
    return HttpResponse.json(wall);
  }),

  http.post(
    apiUrl("/projects/:slug/wall/to-tasks"),
    async ({ request, params }) => {
      await simulateLatency();
      const db = getDb();
      const project = db.projects.findOne((p) => p.slug === params.slug);
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      // R-W2 : conversion en taches ouverte aux membres.
      if (!hasAtLeastRole(roleOf(project.id, user?.id) ?? "observer", "member"))
        return errors.forbidden();

      const parsed = wallToTasksInputSchema.safeParse(await request.json());
      if (!parsed.success) return errors.validation(parsed.error.issues);

      const columns = db.columns
        .find((c) => c.projectId === project.id)
        .sort((a, b) => a.order - b.order);
      const firstColumn = columns[0];
      if (!firstColumn) return errors.notFound("Aucune colonne disponible.");

      const created = parsed.data.elementIds.map((elementId, index) => {
        const task = {
          id: nextId(),
          columnId: firstColumn.id,
          title: `Idee du Mur : ${elementId}`,
          assigneeIds: [],
          order:
            db.tasks.find((t) => t.columnId === firstColumn.id).length + index,
          createdBy: user!.id,
          createdAt: new Date().toISOString(),
          wallOriginId: elementId,
        };
        db.tasks.insert(task);
        return task;
      });

      return HttpResponse.json(created, { status: 201 });
    },
  ),
];
