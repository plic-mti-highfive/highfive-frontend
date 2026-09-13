import { z } from "zod";
import { idSchema, isoDateTimeSchema } from "./common";

/**
 * Signalement et moderation (doc 04 section 15). R-S1 : motifs enumeres.
 * R-S2 : trois signalements distincts sur une meme cible la remontent en
 * tete de file (calcule cote handler, pas dans ce schema).
 */
export const reportReasonSchema = z.enum([
  "hateful_content",
  "harassment",
  "scam",
  "sexual_content",
  "spam",
  "other",
]);
export type ReportReason = z.infer<typeof reportReasonSchema>;

export const reportTargetTypeSchema = z.enum([
  "project",
  "comment",
  "message",
  "user",
]);
export type ReportTargetType = z.infer<typeof reportTargetTypeSchema>;

export const reportStatusSchema = z.enum(["new", "handled", "rejected"]);
export type ReportStatus = z.infer<typeof reportStatusSchema>;

export const reportSchema = z.object({
  id: idSchema,
  reporterId: idSchema,
  targetType: reportTargetTypeSchema,
  targetId: idSchema,
  reason: reportReasonSchema,
  detail: z.string().max(1000).optional(),
  status: reportStatusSchema,
  handledBy: idSchema.optional(),
  createdAt: isoDateTimeSchema,
});
export type Report = z.infer<typeof reportSchema>;

export const reportCreateInputSchema = z.object({
  targetType: reportTargetTypeSchema,
  targetId: idSchema,
  reason: reportReasonSchema,
  detail: z.string().max(1000).optional(),
});
export type ReportCreateInput = z.infer<typeof reportCreateInputSchema>;

/** Journal d'action d'administration (R-S4), inalterable. */
export const adminActionTypeSchema = z.enum([
  "suspend_account",
  "delete_project",
  "hide_comment",
  "reject_report",
  "resolve_report",
]);
export type AdminActionType = z.infer<typeof adminActionTypeSchema>;

export const adminActionSchema = z.object({
  id: idSchema,
  adminId: idSchema,
  type: adminActionTypeSchema,
  targetType: reportTargetTypeSchema,
  targetId: idSchema,
  reason: z.string().max(1000).optional(),
  createdAt: isoDateTimeSchema,
});
export type AdminAction = z.infer<typeof adminActionSchema>;

/** Chiffres pour l'administration (doc 23 section 11) : jamais inventes flatteurs. */
export const adminStatsSchema = z.object({
  usersCount: z.number().int().nonnegative(),
  onlineCount: z.number().int().nonnegative(),
  activeProjectsCount: z.number().int().nonnegative(),
  doneProjectsCount: z.number().int().nonnegative(),
  archivedProjectsCount: z.number().int().nonnegative(),
  pendingReportsCount: z.number().int().nonnegative(),
  signupsLast30Days: z.array(
    z.object({ date: z.iso.date(), count: z.number().int().nonnegative() }),
  ),
});
export type AdminStats = z.infer<typeof adminStatsSchema>;
