import { http, HttpResponse } from "msw";
import { reportCreateInputSchema } from "@/domain";
import { nextId } from "../data/ids";
import { getDb } from "../db";
import {
  apiUrl,
  errorResponse,
  errors,
  getAuthUser,
  simulateLatency,
} from "./utils";

/** Auteur de la cible signalee, quand le store sait la resoudre (sinon `undefined`). */
function authorOf(targetType: string, targetId: string): string | undefined {
  const db = getDb();
  if (targetType === "comment") {
    return db.comments.findOne((c) => c.id === targetId)?.authorId;
  }
  if (targetType === "project") {
    return db.projects.findOne((p) => p.id === targetId)?.ownerId;
  }
  if (targetType === "user") {
    return db.users.findOne((u) => u.id === targetId)?.id;
  }
  return db.messages.findOne((m) => m.id === targetId)?.authorId;
}

export const reportHandlers = [
  http.post(apiUrl("/reports"), async ({ request }) => {
    await simulateLatency();
    const db = getDb();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    if (user.accountStatus !== "active") return errors.forbidden();

    const parsed = reportCreateInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);
    const { targetType, targetId, reason, detail } = parsed.data;

    const authorId = authorOf(targetType, targetId);
    if (!authorId) return errors.notFound("Ce contenu n'existe plus.");
    if (authorId === user.id) {
      return errors.forbidden("Tu ne peux pas signaler ton propre contenu.");
    }
    // Un signalement par personne et par cible : R-S2 compte des signalements distincts.
    const already = db.reports.findOne(
      (r) => r.reporterId === user.id && r.targetId === targetId,
    );
    if (already) {
      return errorResponse(409, "conflict", "Tu as déjà signalé ce contenu.");
    }

    const report = {
      id: nextId(),
      reporterId: user.id,
      targetType,
      targetId,
      reason,
      detail: detail?.trim() ? detail.trim() : undefined,
      status: "new" as const,
      createdAt: new Date().toISOString(),
    };
    db.reports.insert(report);
    return HttpResponse.json(report, { status: 201 });
  }),
];
