import { http, HttpResponse } from "msw";
import {
  projectCreateInputSchema,
  projectSchema,
  projectTransitionSchema,
  projectUpdateInputSchema,
  type Project,
} from "@/domain";
import { nextId } from "../data/ids";
import { getDb } from "../db";
import { canView, isDiscoverable, toProjectSummary } from "./projectHelpers";
import {
  apiUrl,
  errors,
  getAuthUser,
  paginate,
  simulateLatency,
} from "./utils";

function findProjectBySlug(slug: string): Project | undefined {
  return getDb().projects.findOne((p) => p.slug === slug);
}

/** porteur/co-porteur uniquement (matrice §3.1 doc 05). */
function canEdit(project: Project, userId: string | undefined): boolean {
  if (!userId) return false;
  if (project.ownerId === userId) return true;
  const membership = getDb().memberships.findOne(
    (m) => m.projectId === project.id && m.userId === userId,
  );
  return membership?.role === "co_owner";
}

export const projectHandlers = [
  http.get(apiUrl("/projects"), async ({ request }) => {
    await simulateLatency();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const tags = url.searchParams.get("tags")?.split(",").filter(Boolean);
    const cursor = url.searchParams.get("cursor");
    const limit = Number(url.searchParams.get("limit")) || undefined;

    const db = getDb();
    let projects = db.projects.find(isDiscoverable);
    if (q) {
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q),
      );
    }
    if (tags?.length) {
      projects = projects.filter((p) =>
        tags.some((tag) => p.tags.includes(tag)),
      );
    }
    projects = [...projects].sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime(),
    );

    const page = paginate(projects, cursor, limit);
    return HttpResponse.json({
      ...page,
      items: page.items.map(toProjectSummary),
    });
  }),

  http.get(apiUrl("/projects/:slug"), async ({ request, params }) => {
    await simulateLatency();
    const project = findProjectBySlug(String(params.slug));
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const viewer = getAuthUser(request);
    if (!canView(project, viewer?.id))
      return errors.forbidden("Ce projet est prive.");
    return HttpResponse.json(project);
  }),

  http.post(apiUrl("/projects"), async ({ request }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    if (user.accountStatus !== "active") return errors.forbidden();

    const parsed = projectCreateInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);

    const db = getDb();
    const slugBase = parsed.data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    let slug = slugBase;
    let suffix = 1;
    while (db.projects.findOne((p) => p.slug === slug)) {
      slug = `${slugBase}-${suffix++}`;
    }

    const now = new Date().toISOString();
    const project = projectSchema.parse({
      id: nextId(),
      slug,
      title: parsed.data.title,
      tagline: parsed.data.tagline,
      description: parsed.data.description,
      tags: parsed.data.tags,
      needs: (parsed.data.needs ?? []).map((need) => ({
        ...need,
        id: nextId(),
        fulfilled: false,
      })),
      visibility: parsed.data.visibility,
      participation: parsed.data.participation,
      state: "draft",
      ownerId: user.id,
      highfiveCount: 0,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    });
    db.projects.insert(project);
    db.memberships.insert({
      projectId: project.id,
      userId: user.id,
      role: "owner",
      joinedAt: now,
      blocked: false,
    });

    return HttpResponse.json(project, { status: 201 });
  }),

  http.patch(apiUrl("/projects/:slug"), async ({ request, params }) => {
    await simulateLatency();
    const project = findProjectBySlug(String(params.slug));
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const user = getAuthUser(request);
    if (!canEdit(project, user?.id)) return errors.forbidden();

    const parsed = projectUpdateInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);

    const db = getDb();
    const now = new Date().toISOString();
    const updated = db.projects.update((p) => p.id === project.id, {
      ...parsed.data,
      updatedAt: now,
      lastActivityAt: now,
    });
    return HttpResponse.json(projectSchema.parse(updated));
  }),

  http.post(
    apiUrl("/projects/:slug/transition"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = findProjectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();

      const body = (await request.json()) as { transition?: string };
      const transition = projectTransitionSchema.safeParse(body.transition);
      if (!transition.success)
        return errors.validation(transition.error.issues);

      const isOwner = project.ownerId === user.id;
      const membership = getDb().memberships.findOne(
        (m) => m.projectId === project.id && m.userId === user.id,
      );
      const isCoOwner = membership?.role === "co_owner";

      // R-PR3..R-PR6 : publier/archiver/transferer restent au porteur ; terminer/rouvrir aussi au co-porteur.
      const allowed: Record<string, boolean> = {
        publish: isOwner,
        complete: isOwner || isCoOwner,
        reopen: isOwner || isCoOwner,
        archive: isOwner,
        reactivate: isOwner,
      };
      if (!allowed[transition.data]) return errors.forbidden();

      if (transition.data === "publish") {
        // R-PR3 : titre, accroche, au moins un tag — deja garantis par le schema Project.
        if (!project.tags.length)
          return errors.validation({ tags: "Au moins un tag est requis." });
      }

      const nextState: Record<string, Project["state"]> = {
        publish: "active",
        complete: "done",
        reopen: "active",
        archive: "archived",
        reactivate: "active",
      };

      const db = getDb();
      const now = new Date().toISOString();
      const updated = db.projects.update((p) => p.id === project.id, {
        state: nextState[transition.data],
        updatedAt: now,
        lastActivityAt: now,
      });
      return HttpResponse.json(projectSchema.parse(updated));
    },
  ),

  http.delete(apiUrl("/projects/:slug"), async ({ request, params }) => {
    await simulateLatency();
    const project = findProjectBySlug(String(params.slug));
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const user = getAuthUser(request);
    // R-PR7 : reserve au porteur et a l'administration, confirmation nominative.
    const isAdmin = user?.platformRole === "admin";
    if (!user || (user.id !== project.ownerId && !isAdmin))
      return errors.forbidden();

    const body = (await request.json().catch(() => ({}))) as {
      confirmTitle?: string;
    };
    if (body.confirmTitle !== project.title) {
      return errors.validation({
        confirmTitle: "Le titre saisi ne correspond pas.",
      });
    }

    getDb().projects.remove((p) => p.id === project.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(apiUrl("/projects/:slug/transfer"), async ({ request, params }) => {
    await simulateLatency();
    const project = findProjectBySlug(String(params.slug));
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const user = getAuthUser(request);
    if (!user || user.id !== project.ownerId) return errors.forbidden();

    const body = (await request.json()) as { newOwnerId?: string };
    if (!body.newOwnerId) return errors.validation({ newOwnerId: "Requis." });

    const db = getDb();
    const now = new Date().toISOString();
    // R-M2 : l'ancien porteur devient co-porteur.
    db.memberships.update(
      (m) => m.projectId === project.id && m.userId === user.id,
      {
        role: "co_owner",
      },
    );
    const existing = db.memberships.findOne(
      (m) => m.projectId === project.id && m.userId === body.newOwnerId,
    );
    if (existing) {
      db.memberships.update(
        (m) => m.projectId === project.id && m.userId === body.newOwnerId,
        {
          role: "owner",
        },
      );
    } else {
      db.memberships.insert({
        projectId: project.id,
        userId: body.newOwnerId!,
        role: "owner",
        joinedAt: now,
        blocked: false,
      });
    }
    const updated = db.projects.update((p) => p.id === project.id, {
      ownerId: body.newOwnerId,
      updatedAt: now,
    });
    return HttpResponse.json(projectSchema.parse(updated));
  }),

  http.get(apiUrl("/me/projects"), async ({ request }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    const db = getDb();
    const projectIds = new Set(
      db.memberships.find((m) => m.userId === user.id).map((m) => m.projectId),
    );
    const projects = db.projects.find((p) => projectIds.has(p.id));
    return HttpResponse.json(projects.map(toProjectSummary));
  }),
];
