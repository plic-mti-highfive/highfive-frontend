import { http, HttpResponse } from "msw";
import { commentCreateInputSchema } from "@/domain";
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

export const commentHandlers = [
  http.get(apiUrl("/projects/:slug/comments"), async ({ params }) => {
    await simulateLatency();
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    // R-C1/R-V5 : commentaires publics, suivent la visibilite de la fiche (deja filtree en amont par la route projet).
    const comments = db.comments
      .find((c) => c.projectId === project.id && !c.hidden)
      .map((c) => ({
        ...c,
        author: toUserSummary(db.users.findOne((u) => u.id === c.authorId)!),
      }))
      .sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      );
    return HttpResponse.json(comments);
  }),

  http.post(apiUrl("/projects/:slug/comments"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const user = getAuthUser(request);
    // R-C2 : ecriture reservee aux comptes connectes et non suspendus.
    if (!user) return errors.unauthorized();
    if (user.accountStatus !== "active") return errors.forbidden();

    const parsed = commentCreateInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);

    // R-C4 : un seul niveau de reponse.
    if (parsed.data.parentId) {
      const parent = db.comments.findOne((c) => c.id === parsed.data.parentId);
      if (!parent || parent.parentId) {
        return errors.validation({
          parentId: "Un seul niveau de reponse est autorise.",
        });
      }
    }

    const comment = {
      id: nextId(),
      projectId: project.id,
      authorId: user.id,
      body: parsed.data.body,
      parentId: parsed.data.parentId,
      publishedAt: new Date().toISOString(),
      hidden: false,
    };
    db.comments.insert(comment);
    return HttpResponse.json(comment, { status: 201 });
  }),

  http.post(
    apiUrl("/comments/:commentId/hide"),
    async ({ request, params }) => {
      await simulateLatency();
      const db = getDb();
      const comment = db.comments.findOne((c) => c.id === params.commentId);
      if (!comment) return errors.notFound("Commentaire introuvable.");
      const user = getAuthUser(request);
      const isAdmin = user?.platformRole === "admin";
      // R-C3 : le porteur/co-porteur masque.
      if (
        !isAdmin &&
        !hasAtLeastRole(
          roleOf(comment.projectId, user?.id) ?? "observer",
          "co_owner",
        )
      ) {
        return errors.forbidden();
      }
      db.comments.update((c) => c.id === comment.id, { hidden: true });
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.delete(apiUrl("/comments/:commentId"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const comment = db.comments.findOne((c) => c.id === params.commentId);
    if (!comment) return errors.notFound("Commentaire introuvable.");
    const user = getAuthUser(request);
    // R-C3 : la suppression est reservee a l'administration.
    if (user?.platformRole !== "admin") return errors.forbidden();
    db.comments.remove((c) => c.id === comment.id);
    return new HttpResponse(null, { status: 204 });
  }),
];
