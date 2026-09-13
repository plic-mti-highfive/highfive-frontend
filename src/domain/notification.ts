import { z } from "zod";
import { idSchema, isoDateTimeSchema } from "./common";

/** R-N1 : types de notification enumeres par le doc 04 section 14. */
export const notificationTypeSchema = z.enum([
  "highfive_received",
  "comment_on_project",
  "reply_to_comment",
  "join_request_received",
  "join_request_accepted",
  "join_request_rejected",
  "invitation_received",
  "new_member",
  "announcement_on_followed_project",
  "task_assigned",
  "mention",
  "message_received",
  "admin_decision",
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationTargetTypeSchema = z.enum([
  "project",
  "task",
  "message",
  "comment",
]);
export type NotificationTargetType = z.infer<
  typeof notificationTargetTypeSchema
>;

/**
 * Notification (doc 04 section 14). R-N2 : regroupement obligatoire — un
 * meme evenement sur une meme cible agrege ses acteurs dans `actorIds`
 * ("Sophie et 4 autres ont highfive Fresque murale") plutot que de creer une
 * notification par acteur.
 */
export const notificationSchema = z.object({
  id: idSchema,
  recipientId: idSchema,
  type: notificationTypeSchema,
  actorIds: z.array(idSchema).min(1),
  targetType: notificationTargetTypeSchema,
  targetId: idSchema,
  read: z.boolean().default(false),
  createdAt: isoDateTimeSchema,
});
export type Notification = z.infer<typeof notificationSchema>;

/** R-N4 : preferences par type et par canal, reglables dans /reglages/notifications. */
export const notificationChannelSchema = z.enum(["app", "email"]);
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;

export const notificationPreferenceSchema = z.object({
  type: notificationTypeSchema,
  channels: z.array(notificationChannelSchema),
});
export type NotificationPreference = z.infer<
  typeof notificationPreferenceSchema
>;

export const notificationPreferencesUpdateInputSchema = z.array(
  notificationPreferenceSchema,
);
export type NotificationPreferencesUpdateInput = z.infer<
  typeof notificationPreferencesUpdateInputSchema
>;
