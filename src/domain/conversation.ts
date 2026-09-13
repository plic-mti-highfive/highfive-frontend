import { z } from "zod";
import { idSchema, isoDateTimeSchema, slugSchema } from "./common";
import { userSummarySchema } from "./user";

/**
 * Messagerie (doc 04 section 13). `direct` : exactement 2 participants
 * (R-MSG1). `group` : 3 a 50 (R-MSG2). `channel` : miroir de l'equipe d'un
 * projet, non gere manuellement (R-MSG3) — projectId obligatoire alors.
 */
export const conversationTypeSchema = z.enum(["direct", "group", "channel"]);
export type ConversationType = z.infer<typeof conversationTypeSchema>;

const conversationBase = z.object({
  id: idSchema,
  type: conversationTypeSchema,
  participantIds: z.array(idSchema).min(2).max(50),
  projectId: idSchema.optional(),
  title: z.string().min(1).max(80).optional(),
  createdAt: isoDateTimeSchema,
});

export const conversationSchema = conversationBase.superRefine(
  (conversation, ctx) => {
    if (
      conversation.type === "direct" &&
      conversation.participantIds.length !== 2
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "R-MSG1 : une conversation directe compte exactement 2 personnes",
        path: ["participantIds"],
      });
    }
    if (conversation.type === "channel" && !conversation.projectId) {
      ctx.addIssue({
        code: "custom",
        message: "R-MSG3 : un canal est rattache a un projet",
        path: ["projectId"],
      });
    }
  },
);
export type Conversation = z.infer<typeof conversationSchema>;

/** Version pour la liste des conversations (`/api/conversations`). */
export const conversationSummarySchema = conversationBase.extend({
  /** Personnes de la conversation, resolues (avatar/pseudo) pour l'affichage. */
  participants: z.array(userSummarySchema),
  /** R-MSG3 : nom/slug du projet, resolus quand `type === "channel"`. */
  projectSlug: slugSchema.optional(),
  projectTitle: z.string().optional(),
  lastMessage: z
    .object({
      body: z.string(),
      authorId: idSchema,
      sentAt: isoDateTimeSchema,
      /** R-MSG6 : le corps est vide quand le dernier message a ete supprime. */
      deleted: z.boolean().default(false),
    })
    .optional(),
  unreadCount: z.number().int().nonnegative(),
  isMessageRequest: z.boolean().default(false),
});
export type ConversationSummary = z.infer<typeof conversationSummarySchema>;

/** Version detaillee pour l'ouverture d'une conversation (`/api/conversations/:id`). */
export const conversationDetailSchema = conversationBase.extend({
  participants: z.array(userSummarySchema),
  projectSlug: slugSchema.optional(),
  projectTitle: z.string().optional(),
});
export type ConversationDetail = z.infer<typeof conversationDetailSchema>;

/** R-MSG4 : un message peut embarquer un projet ou un fichier en piece jointe. */
export const messageAttachmentSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("project"), projectId: idSchema }),
  z.object({ kind: z.literal("file"), fileId: idSchema }),
]);
export type MessageAttachment = z.infer<typeof messageAttachmentSchema>;

export const messageSchema = z.object({
  id: idSchema,
  conversationId: idSchema,
  authorId: idSchema,
  body: z.string().max(4000),
  attachment: messageAttachmentSchema.optional(),
  readBy: z.array(idSchema).default([]),
  sentAt: isoDateTimeSchema,
  editedAt: isoDateTimeSchema.optional(),
  deleted: z.boolean().default(false),
});
export type Message = z.infer<typeof messageSchema>;

/** R-MSG4 : aperçu résolu d'une pièce jointe, pour l'affichage embarqué dans la bulle. */
export const messageAttachmentPreviewSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("project"),
    projectSlug: slugSchema,
    projectTitle: z.string(),
    projectTagline: z.string(),
  }),
  z.object({
    kind: z.literal("file"),
    fileId: idSchema,
    fileName: z.string(),
    fileSize: z.number().int().nonnegative(),
  }),
]);
export type MessageAttachmentPreview = z.infer<
  typeof messageAttachmentPreviewSchema
>;

/** Message enrichi de son auteur et de l'aperçu resolu de sa piece jointe. */
export const messageWithAuthorSchema = messageSchema.extend({
  author: userSummarySchema,
  attachmentPreview: messageAttachmentPreviewSchema.optional(),
});
export type MessageWithAuthor = z.infer<typeof messageWithAuthorSchema>;

export const messageCreateInputSchema = z.object({
  body: z.string().min(1).max(4000),
  attachment: messageAttachmentSchema.optional(),
});
export type MessageCreateInput = z.infer<typeof messageCreateInputSchema>;

export const conversationCreateInputSchema = z.object({
  participantIds: z.array(idSchema).min(1).max(49),
  title: z.string().min(1).max(80).optional(),
  message: z.string().min(1).max(4000),
});
export type ConversationCreateInput = z.infer<
  typeof conversationCreateInputSchema
>;
