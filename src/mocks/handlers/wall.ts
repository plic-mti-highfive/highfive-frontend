import { http, HttpResponse } from "msw";
import {
  acceptSuggestedTasksInputSchema,
  wallToTasksInputSchema,
  type MembershipRole,
  type WallRole,
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

const WALL_ROLE: Record<MembershipRole, WallRole> = {
  owner: "admin",
  co_owner: "admin",
  member: "editor",
  observer: "viewer",
};

export const wallHandlers = [
  // Session de synchronisation : aucun serveur Hocuspocus n'existe en mode
  // mock. L'URL pointe volontairement vers un port ferme : le Mur affiche
  // alors son etat « serveur injoignable » (avec Reessayer), sans crash.
  http.get(
    apiUrl("/projects/:slug/wall/session"),
    async ({ request, params }) => {
      await simulateLatency();
      const db = getDb();
      const project = db.projects.findOne((p) => p.slug === params.slug);
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      const role = roleOf(project.id, user?.id);
      if (!role) return errors.forbidden();
      const wall = db.walls.findOne((w) => w.projectId === project.id);
      return HttpResponse.json({
        canvasId: wall?.projectId ?? project.id,
        projectId: project.id,
        websocketUrl: "ws://localhost:1/ws",
        token: "jeton-mock",
        role: WALL_ROLE[role],
      });
    },
  ),

  // IA : propositions deterministes (sans reseau), rien n'est persiste.
  http.post(
    apiUrl("/projects/:slug/wall/suggest-tasks"),
    async ({ request, params }) => {
      await simulateLatency();
      const db = getDb();
      const project = db.projects.findOne((p) => p.slug === params.slug);
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      if (!hasAtLeastRole(roleOf(project.id, user?.id) ?? "observer", "member"))
        return errors.forbidden();
      return HttpResponse.json({
        empty: false,
        tasks: [
          {
            title: `Définir les objectifs de « ${project.title} »`,
            description: "Poser par écrit ce que le projet doit accomplir.",
            sourceHints: ["Idées du Mur"],
          },
          {
            title: "Répartir les rôles dans l'équipe",
            description: "Qui fait quoi, et avec quelle disponibilité.",
            sourceHints: [],
          },
          {
            title: "Planifier la première étape",
            description: "",
            sourceHints: ["Post-it « prochaine étape »"],
          },
        ],
      });
    },
  ),

  http.post(
    apiUrl("/projects/:slug/wall/suggested-tasks"),
    async ({ request, params }) => {
      await simulateLatency();
      const db = getDb();
      const project = db.projects.findOne((p) => p.slug === params.slug);
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      if (!hasAtLeastRole(roleOf(project.id, user?.id) ?? "observer", "member"))
        return errors.forbidden();

      const parsed = acceptSuggestedTasksInputSchema.safeParse(
        await request.json(),
      );
      if (!parsed.success) return errors.validation(parsed.error.issues);

      const firstColumn = db.columns
        .find((c) => c.projectId === project.id)
        .sort((a, b) => a.order - b.order)[0];
      if (!firstColumn) return errors.notFound("Aucune colonne disponible.");

      const created = parsed.data.tasks.map((proposal, index) => {
        const task = {
          id: nextId(),
          columnId: firstColumn.id,
          title: proposal.title,
          assigneeIds: [],
          order:
            db.tasks.find((t) => t.columnId === firstColumn.id).length + index,
          createdBy: user!.id,
          createdAt: new Date().toISOString(),
          wallOriginId: proposal.sourceHints[0] ?? `suggestion-${index + 1}`,
        };
        db.tasks.insert(task);
        return task;
      });

      return HttpResponse.json(created, { status: 201 });
    },
  ),

  http.get(apiUrl("/projects/:slug/wall"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const user = getAuthUser(request);
    // R-W1/R-V6 (doc 05 §3.3, §4) : Tableau blanc n'est jamais public, meme sur un
    // projet public — seuls les membres et observateurs du projet y lisent
    // (defaut porteur : Tableau blanc ouvert aux observateurs). Un visiteur sans
    // appartenance (role indefini) est refuse, jamais suppose observateur.
    const role = roleOf(project.id, user?.id);
    if (!role || !hasAtLeastRole(role, "observer")) return errors.forbidden();

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

      const created = parsed.data.elements.map(
        ({ id: elementId, label }, index) => {
          const task = {
            id: nextId(),
            columnId: firstColumn.id,
            title: label,
            assigneeIds: [],
            order:
              db.tasks.find((t) => t.columnId === firstColumn.id).length +
              index,
            createdBy: user!.id,
            createdAt: new Date().toISOString(),
            wallOriginId: elementId,
          };
          db.tasks.insert(task);
          return task;
        },
      );

      return HttpResponse.json(created, { status: 201 });
    },
  ),
];
