import { http, HttpResponse } from "msw";
import {
  columnCreateInputSchema,
  taskCreateInputSchema,
  taskMoveInputSchema,
  taskUpdateInputSchema,
} from "@/domain";
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

export const taskHandlers = [
  http.get(apiUrl("/projects/:slug/columns"), async ({ params }) => {
    await simulateLatency();
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const columns = db.columns
      .find((c) => c.projectId === project.id)
      .sort((a, b) => a.order - b.order);
    return HttpResponse.json(columns);
  }),

  http.post(apiUrl("/projects/:slug/columns"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const user = getAuthUser(request);
    // Gerer les colonnes : porteur/co-porteur seulement (doc 05 §3.3).
    if (!hasAtLeastRole(roleOf(project.id, user?.id) ?? "observer", "co_owner"))
      return errors.forbidden();

    const parsed = columnCreateInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);

    const existing = db.columns.find((c) => c.projectId === project.id);
    // R-K2 : de 1 a 6 colonnes par projet.
    if (existing.length >= 6)
      return errors.validation({ columns: "6 colonnes au maximum." });

    const column = {
      id: nextId(),
      projectId: project.id,
      label: parsed.data.label,
      order: existing.length,
      color: parsed.data.color,
    };
    db.columns.insert(column);
    return HttpResponse.json(column, { status: 201 });
  }),

  http.delete(apiUrl("/columns/:columnId"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const column = db.columns.findOne((c) => c.id === params.columnId);
    if (!column) return errors.notFound("Colonne introuvable.");
    const user = getAuthUser(request);
    if (
      !hasAtLeastRole(
        roleOf(column.projectId, user?.id) ?? "observer",
        "co_owner",
      )
    )
      return errors.forbidden();

    const url = new URL(request.url);
    const moveTo = url.searchParams.get("moveTo");
    // R-K3 : supprimer une colonne exige de choisir ou deplacer ses taches.
    if (!moveTo || !db.columns.findOne((c) => c.id === moveTo)) {
      return errors.validation({
        moveTo: "Choisis une colonne de destination.",
      });
    }
    if (db.columns.find((c) => c.projectId === column.projectId).length <= 1) {
      return errors.validation({
        columns: "Une colonne au moins est requise.",
      });
    }

    db.tasks
      .find((t) => t.columnId === column.id)
      .forEach((task) => {
        db.tasks.update((t) => t.id === task.id, { columnId: moveTo });
      });
    db.columns.remove((c) => c.id === column.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(apiUrl("/projects/:slug/tasks"), async ({ params }) => {
    await simulateLatency();
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const columnIds = new Set(
      db.columns.find((c) => c.projectId === project.id).map((c) => c.id),
    );
    const tasks = db.tasks.find((t) => columnIds.has(t.columnId));
    return HttpResponse.json(tasks);
  }),

  http.post(apiUrl("/tasks"), async ({ request }) => {
    await simulateLatency();
    const parsed = taskCreateInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);

    const db = getDb();
    const column = db.columns.findOne((c) => c.id === parsed.data.columnId);
    if (!column) return errors.notFound("Colonne introuvable.");
    const user = getAuthUser(request);
    // Creer des taches : porteur, co-porteur, membre (doc 05 §3.3).
    if (
      !hasAtLeastRole(
        roleOf(column.projectId, user?.id) ?? "observer",
        "member",
      )
    )
      return errors.forbidden();

    const siblingsCount = db.tasks.find((t) => t.columnId === column.id).length;
    const task = {
      id: nextId(),
      columnId: column.id,
      title: parsed.data.title,
      details: parsed.data.details,
      assigneeIds: parsed.data.assigneeIds ?? [],
      dueDate: parsed.data.dueDate,
      order: siblingsCount,
      createdBy: user!.id,
      createdAt: new Date().toISOString(),
    };
    db.tasks.insert(task);
    return HttpResponse.json(task, { status: 201 });
  }),

  http.patch(apiUrl("/tasks/:taskId"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const task = db.tasks.findOne((t) => t.id === params.taskId);
    if (!task) return errors.notFound("Tache introuvable.");
    const column = db.columns.findOne((c) => c.id === task.columnId)!;
    const user = getAuthUser(request);
    if (
      !hasAtLeastRole(
        roleOf(column.projectId, user?.id) ?? "observer",
        "member",
      )
    )
      return errors.forbidden();

    const parsed = taskUpdateInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);

    const { dueDate, ...rest } = parsed.data;
    // R-K6 : l'echeance est optionnelle. `null` explicite l'efface ; l'absence du champ la laisse intacte.
    const dueDatePatch =
      "dueDate" in parsed.data ? { dueDate: dueDate ?? undefined } : {};
    const updated = db.tasks.update((t) => t.id === task.id, {
      ...rest,
      ...dueDatePatch,
    });
    return HttpResponse.json(updated);
  }),

  http.post(apiUrl("/tasks/:taskId/move"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const task = db.tasks.findOne((t) => t.id === params.taskId);
    if (!task) return errors.notFound("Tache introuvable.");
    const column = db.columns.findOne((c) => c.id === task.columnId)!;
    const user = getAuthUser(request);
    if (
      !hasAtLeastRole(
        roleOf(column.projectId, user?.id) ?? "observer",
        "member",
      )
    )
      return errors.forbidden();

    const parsed = taskMoveInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);
    if (!db.columns.findOne((c) => c.id === parsed.data.columnId)) {
      return errors.notFound("Colonne de destination introuvable.");
    }

    const updated = db.tasks.update((t) => t.id === task.id, parsed.data);
    return HttpResponse.json(updated);
  }),

  http.delete(apiUrl("/tasks/:taskId"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const task = db.tasks.findOne((t) => t.id === params.taskId);
    if (!task) return errors.notFound("Tache introuvable.");
    const column = db.columns.findOne((c) => c.id === task.columnId)!;
    const user = getAuthUser(request);
    if (
      !hasAtLeastRole(
        roleOf(column.projectId, user?.id) ?? "observer",
        "member",
      )
    )
      return errors.forbidden();

    db.tasks.remove((t) => t.id === task.id);
    return new HttpResponse(null, { status: 204 });
  }),
];
