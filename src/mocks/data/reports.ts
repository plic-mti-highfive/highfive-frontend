import {
  adminActionSchema,
  reportSchema,
  type AdminAction,
  type Report,
} from "@/domain";
import { COMMENTS } from "./comments";
import { daysAgo, hoursAgo, nextId } from "./ids";
import * as u from "./users";

const reportedComment = COMMENTS.find((c) => c.authorId === u.thomasDupont.id)!;

/**
 * Doc 23 §11 : "Signalements en attente : 3, dont un commentaire à trois
 * signalements." Modelise litteralement par 3 lignes `new` sur la meme
 * cible (R-S2 : trois signalements distincts remontent la cible en tete de
 * file de moderation).
 */
export const REPORTS: Report[] = [
  reportSchema.parse({
    id: nextId(),
    reporterId: u.yanisF.id,
    targetType: "comment",
    targetId: reportedComment.id,
    reason: "spam",
    detail: "Ce commentaire revient a l'identique sur plusieurs fiches.",
    status: "new",
    createdAt: hoursAgo(6),
  }),
  reportSchema.parse({
    id: nextId(),
    reporterId: u.nadiaK.id,
    targetType: "comment",
    targetId: reportedComment.id,
    reason: "spam",
    status: "new",
    createdAt: hoursAgo(4),
  }),
  reportSchema.parse({
    id: nextId(),
    reporterId: u.enzoB.id,
    targetType: "comment",
    targetId: reportedComment.id,
    reason: "spam",
    status: "new",
    createdAt: hoursAgo(1),
  }),
];

/** R-S4 : journal d'action passe, distinct des signalements en attente ci-dessus. */
export const ADMIN_ACTIONS: AdminAction[] = [
  adminActionSchema.parse({
    id: nextId(),
    adminId: u.annickR.id,
    type: "reject_report",
    targetType: "comment",
    targetId: reportedComment.id,
    reason: "Signalement injustifie, aucune infraction constatee.",
    createdAt: daysAgo(9),
  }),
];
