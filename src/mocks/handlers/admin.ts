import { http, HttpResponse } from "msw";
import { adminStatsSchema, currentUserSchema } from "@/domain";
import { nextId } from "../data/ids";
import { SIGNUPS_LAST_30_DAYS } from "../data";
import { getDb, type DbUser } from "../db";
import { toProjectSummary } from "./projectHelpers";
import {
  apiUrl,
  errors,
  getAuthUser,
  paginate,
  simulateLatency,
} from "./utils";

function requireAdmin(request: Request) {
  const user = getAuthUser(request);
  if (!user) return { error: errors.unauthorized() };
  if (user.platformRole !== "admin") return { error: errors.forbidden() };
  return { user };
}

function stripPassword(user: DbUser) {
  const { passwordHash, ...rest } = user;
  void passwordHash;
  return rest;
}

export const adminHandlers = [
  http.get(apiUrl("/admin/reports"), async ({ request }) => {
    await simulateLatency();
    const auth = requireAdmin(request);
    if (auth.error) return auth.error;
    const db = getDb();
    const url = new URL(request.url);
    // R-S2 : les cibles a 3 signalements distincts remontent en tete de file.
    const reports = [...db.reports.all()].sort((a, b) => {
      const countA = db.reports.find((r) => r.targetId === a.targetId).length;
      const countB = db.reports.find((r) => r.targetId === b.targetId).length;
      if (countA !== countB) return countB - countA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return HttpResponse.json(paginate(reports, url.searchParams.get("cursor")));
  }),

  http.post(
    apiUrl("/admin/reports/:reportId/resolve"),
    async ({ request, params }) => {
      await simulateLatency();
      const auth = requireAdmin(request);
      if (auth.error) return auth.error;
      const db = getDb();
      const report = db.reports.findOne((r) => r.id === params.reportId);
      if (!report) return errors.notFound("Signalement introuvable.");
      const body = (await request.json().catch(() => ({}))) as {
        reason?: string;
      };
      const updated = db.reports.update((r) => r.id === report.id, {
        status: "handled",
        handledBy: auth.user!.id,
      });
      db.adminActions.insert({
        id: nextId(),
        adminId: auth.user!.id,
        type: "resolve_report",
        targetType: report.targetType,
        targetId: report.targetId,
        reason: body.reason,
        createdAt: new Date().toISOString(),
      });
      return HttpResponse.json(updated);
    },
  ),

  http.post(
    apiUrl("/admin/reports/:reportId/reject"),
    async ({ request, params }) => {
      await simulateLatency();
      const auth = requireAdmin(request);
      if (auth.error) return auth.error;
      const db = getDb();
      const report = db.reports.findOne((r) => r.id === params.reportId);
      if (!report) return errors.notFound("Signalement introuvable.");
      const body = (await request.json().catch(() => ({}))) as {
        reason?: string;
      };
      const updated = db.reports.update((r) => r.id === report.id, {
        status: "rejected",
        handledBy: auth.user!.id,
      });
      db.adminActions.insert({
        id: nextId(),
        adminId: auth.user!.id,
        type: "reject_report",
        targetType: report.targetType,
        targetId: report.targetId,
        reason: body.reason,
        createdAt: new Date().toISOString(),
      });
      return HttpResponse.json(updated);
    },
  ),

  http.get(apiUrl("/admin/stats"), async ({ request }) => {
    await simulateLatency();
    const auth = requireAdmin(request);
    if (auth.error) return auth.error;
    const db = getDb();
    const stats = adminStatsSchema.parse({
      usersCount: db.users.all().length,
      onlineCount: db.users.find((u) => {
        const minutesSinceVisit =
          (Date.now() - new Date(u.lastVisitAt).getTime()) / 60000;
        return minutesSinceVisit < 30;
      }).length,
      activeProjectsCount: db.projects.find((p) => p.state === "active").length,
      doneProjectsCount: db.projects.find((p) => p.state === "done").length,
      archivedProjectsCount: db.projects.find((p) => p.state === "archived")
        .length,
      pendingReportsCount: db.reports.find((r) => r.status === "new").length,
      signupsLast30Days: SIGNUPS_LAST_30_DAYS,
    });
    return HttpResponse.json(stats);
  }),

  http.get(apiUrl("/admin/users"), async ({ request }) => {
    await simulateLatency();
    const auth = requireAdmin(request);
    if (auth.error) return auth.error;
    const db = getDb();
    const url = new URL(request.url);
    const page = paginate(db.users.all(), url.searchParams.get("cursor"));
    return HttpResponse.json({
      ...page,
      items: page.items.map((u) => currentUserSchema.parse(stripPassword(u))),
    });
  }),

  http.post(
    apiUrl("/admin/users/:userId/suspend"),
    async ({ request, params }) => {
      await simulateLatency();
      const auth = requireAdmin(request);
      if (auth.error) return auth.error;
      const db = getDb();
      const target = db.users.findOne((u) => u.id === params.userId);
      if (!target) return errors.notFound("Personne introuvable.");
      const body = (await request.json().catch(() => ({}))) as {
        reason?: string;
      };
      db.users.update((u) => u.id === target.id, {
        accountStatus: "suspended",
      });
      db.adminActions.insert({
        id: nextId(),
        adminId: auth.user!.id,
        type: "suspend_account",
        targetType: "user",
        targetId: target.id,
        reason: body.reason,
        createdAt: new Date().toISOString(),
      });
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.get(apiUrl("/admin/projects"), async ({ request }) => {
    await simulateLatency();
    const auth = requireAdmin(request);
    if (auth.error) return auth.error;
    const db = getDb();
    const url = new URL(request.url);
    const page = paginate(db.projects.all(), url.searchParams.get("cursor"));
    return HttpResponse.json({
      ...page,
      items: page.items.map(toProjectSummary),
    });
  }),

  http.delete(apiUrl("/admin/projects/:slug"), async ({ request, params }) => {
    await simulateLatency();
    const auth = requireAdmin(request);
    if (auth.error) return auth.error;
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    db.projects.remove((p) => p.id === project.id);
    db.adminActions.insert({
      id: nextId(),
      adminId: auth.user!.id,
      type: "delete_project",
      targetType: "project",
      targetId: project.id,
      createdAt: new Date().toISOString(),
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(apiUrl("/admin/tags"), async ({ request }) => {
    await simulateLatency();
    const auth = requireAdmin(request);
    if (auth.error) return auth.error;
    return HttpResponse.json(getDb().tags.all());
  }),
];
