import { http, HttpResponse } from "msw";
import {
  invitationCreateInputSchema,
  joinRequestCreateInputSchema,
  membershipRoleSchema,
} from "@/domain";
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

function projectBySlug(slug: string) {
  return getDb().projects.findOne((p) => p.slug === slug);
}

function roleOf(projectId: string, userId: string | undefined) {
  if (!userId) return undefined;
  return getDb().memberships.findOne(
    (m) => m.projectId === projectId && m.userId === userId,
  )?.role;
}

export const membershipHandlers = [
  http.get(apiUrl("/projects/:slug/members"), async ({ params }) => {
    await simulateLatency();
    const project = projectBySlug(String(params.slug));
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const db = getDb();
    const members = db.memberships
      .find((m) => m.projectId === project.id)
      .map((m) => ({
        ...m,
        user: toUserSummary(db.users.findOne((u) => u.id === m.userId)!),
      }));
    return HttpResponse.json(members);
  }),

  http.patch(
    apiUrl("/projects/:slug/members/:userId"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = projectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      // Nommer/retirer un co-porteur : reserve au porteur (doc 05 §3.2).
      if (!user || user.id !== project.ownerId) return errors.forbidden();

      const body = (await request.json()) as { role?: string };
      const role = membershipRoleSchema.safeParse(body.role);
      if (!role.success || role.data === "owner")
        return errors.validation({ role: "Role invalide." });

      const db = getDb();
      const updated = db.memberships.update(
        (m) => m.projectId === project.id && m.userId === params.userId,
        { role: role.data },
      );
      if (!updated) return errors.notFound("Ce membre n'existe pas.");
      return HttpResponse.json(updated);
    },
  ),

  http.delete(
    apiUrl("/projects/:slug/members/:userId"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = projectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      const role = roleOf(project.id, user?.id);
      // Exclure un membre : porteur et co-porteur (doc 05 §3.2).
      if (!hasAtLeastRole(role ?? "observer", "co_owner"))
        return errors.forbidden();
      if (params.userId === project.ownerId)
        return errors.forbidden("Le porteur ne peut pas etre exclu.");

      getDb().memberships.remove(
        (m) => m.projectId === project.id && m.userId === params.userId,
      );
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.post(
    apiUrl("/projects/:slug/members/:userId/block"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = projectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      const role = roleOf(project.id, user?.id);
      if (!hasAtLeastRole(role ?? "observer", "co_owner"))
        return errors.forbidden();

      const db = getDb();
      db.memberships.update(
        (m) => m.projectId === project.id && m.userId === params.userId,
        {
          blocked: true,
        },
      );
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.post(apiUrl("/projects/:slug/leave"), async ({ request, params }) => {
    await simulateLatency();
    const project = projectBySlug(String(params.slug));
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    // R-M3 : le porteur doit d'abord transferer ou archiver.
    if (user.id === project.ownerId) {
      return errors.forbidden(
        "Transfere ou archive le projet avant de le quitter.",
      );
    }
    getDb().memberships.remove(
      (m) => m.projectId === project.id && m.userId === user.id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(
    apiUrl("/projects/:slug/join-requests"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = projectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      const role = roleOf(project.id, user?.id);
      if (!hasAtLeastRole(role ?? "observer", "co_owner"))
        return errors.forbidden();

      const requests = getDb().joinRequests.find(
        (r) => r.projectId === project.id,
      );
      return HttpResponse.json(requests);
    },
  ),

  http.post(
    apiUrl("/projects/:slug/join-requests"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = projectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();
      if (project.participation === "on_invite") {
        return errors.forbidden("Ce projet ne se rejoint que sur invitation.");
      }
      const parsed = joinRequestCreateInputSchema.safeParse(
        await request.json(),
      );
      if (!parsed.success) return errors.validation(parsed.error.issues);

      const db = getDb();
      const now = new Date().toISOString();
      if (project.participation === "open") {
        db.memberships.insert({
          projectId: project.id,
          userId: user.id,
          role: "member",
          joinedAt: now,
          blocked: false,
        });
        const record = {
          id: nextId(),
          projectId: project.id,
          userId: user.id,
          message: parsed.data.message,
          status: "accepted" as const,
          createdAt: now,
        };
        db.joinRequests.insert(record);
        return HttpResponse.json(record, { status: 201 });
      }
      const record = {
        id: nextId(),
        projectId: project.id,
        userId: user.id,
        message: parsed.data.message,
        status: "pending" as const,
        createdAt: now,
      };
      db.joinRequests.insert(record);
      return HttpResponse.json(record, { status: 201 });
    },
  ),

  http.post(
    apiUrl("/projects/:slug/join-requests/:requestId/accept"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = projectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      const role = roleOf(project.id, user?.id);
      if (!hasAtLeastRole(role ?? "observer", "co_owner"))
        return errors.forbidden();

      const db = getDb();
      const joinRequest = db.joinRequests.update(
        (r) => r.id === params.requestId,
        { status: "accepted" },
      );
      if (!joinRequest) return errors.notFound("Demande introuvable.");
      db.memberships.insert({
        projectId: project.id,
        userId: joinRequest.userId,
        role: "member",
        joinedAt: new Date().toISOString(),
        blocked: false,
      });
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.post(
    apiUrl("/projects/:slug/join-requests/:requestId/reject"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = projectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      const role = roleOf(project.id, user?.id);
      if (!hasAtLeastRole(role ?? "observer", "co_owner"))
        return errors.forbidden();

      // R-D3 : refuser n'envoie pas de motif.
      const updated = getDb().joinRequests.update(
        (r) => r.id === params.requestId,
        { status: "rejected" },
      );
      if (!updated) return errors.notFound("Demande introuvable.");
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.get(
    apiUrl("/projects/:slug/invitations"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = projectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      const role = roleOf(project.id, user?.id);
      if (!hasAtLeastRole(role ?? "observer", "co_owner"))
        return errors.forbidden();

      return HttpResponse.json(
        getDb().invitations.find((i) => i.projectId === project.id),
      );
    },
  ),

  http.post(
    apiUrl("/projects/:slug/invitations"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = projectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      const role = roleOf(project.id, user?.id);
      if (!hasAtLeastRole(role ?? "observer", "co_owner"))
        return errors.forbidden();

      const parsed = invitationCreateInputSchema.safeParse(
        await request.json(),
      );
      if (!parsed.success) return errors.validation(parsed.error.issues);

      const db = getDb();
      // R-I3 : on ne peut pas inviter une personne bloquee sur ce projet.
      const blocked = db.memberships.findOne(
        (m) =>
          m.projectId === project.id &&
          m.userId === parsed.data.recipientId &&
          m.blocked,
      );
      if (blocked)
        return errors.forbidden("Cette personne est bloquee sur ce projet.");

      const now = new Date();
      const invitation = {
        id: nextId(),
        projectId: project.id,
        senderId: user!.id,
        recipientId: parsed.data.recipientId,
        proposedRole: parsed.data.proposedRole,
        message: parsed.data.message,
        status: "pending" as const,
        // R-I1 : expiration a 30 jours.
        expiresAt: new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        createdAt: now.toISOString(),
      };
      db.invitations.insert(invitation);
      return HttpResponse.json(invitation, { status: 201 });
    },
  ),

  http.post(
    apiUrl("/invitations/:invitationId/accept"),
    async ({ request, params }) => {
      await simulateLatency();
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();
      const db = getDb();
      const invitation = db.invitations.findOne(
        (i) => i.id === params.invitationId,
      );
      if (!invitation || invitation.recipientId !== user.id)
        return errors.notFound("Invitation introuvable.");

      db.invitations.update((i) => i.id === invitation.id, {
        status: "accepted",
      });
      // R-I2 : l'invitation acceptee cree l'appartenance au role propose.
      db.memberships.insert({
        projectId: invitation.projectId,
        userId: user.id,
        role: invitation.proposedRole,
        joinedAt: new Date().toISOString(),
        blocked: false,
      });
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.post(
    apiUrl("/invitations/:invitationId/reject"),
    async ({ request, params }) => {
      await simulateLatency();
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();
      const db = getDb();
      const invitation = db.invitations.findOne(
        (i) => i.id === params.invitationId,
      );
      if (!invitation || invitation.recipientId !== user.id)
        return errors.notFound("Invitation introuvable.");

      db.invitations.update((i) => i.id === invitation.id, {
        status: "rejected",
      });
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
