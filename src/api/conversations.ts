import { z } from "zod";
import { apiFetch } from "./client";
import {
  conversationDetailSchema,
  conversationSchema,
  conversationSummarySchema,
  messageUploadSchema,
  messageWithAuthorSchema,
  paginatedSchema,
  type Conversation,
  type ConversationCreateInput,
  type ConversationDetail,
  type ConversationParticipantsAddInput,
  type ConversationUpdateInput,
  type ConversationSummary,
  type MessageCreateInput,
  type MessageUpload,
  type MessageWithAuthor,
  type Paginated,
} from "@/domain";

/** R-MSG7 : les conversations sans reponse arrivent dans "Demandes de message". */
export function listConversations(): Promise<ConversationSummary[]> {
  return apiFetch("/conversations", {
    schema: z.array(conversationSummarySchema),
  });
}

export function getConversation(
  conversationId: string,
): Promise<ConversationDetail> {
  return apiFetch(`/conversations/${conversationId}`, {
    schema: conversationDetailSchema,
  });
}

export function listMessages(
  conversationId: string,
  cursor?: string,
): Promise<Paginated<MessageWithAuthor>> {
  return apiFetch(`/conversations/${conversationId}/messages`, {
    query: { cursor },
    schema: paginatedSchema(messageWithAuthorSchema),
  });
}

export function createConversation(
  input: ConversationCreateInput,
): Promise<Conversation> {
  return apiFetch("/conversations", {
    method: "POST",
    body: input,
    schema: conversationSchema,
  });
}

export function sendMessage(
  conversationId: string,
  input: MessageCreateInput,
): Promise<MessageWithAuthor> {
  return apiFetch(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: input,
    schema: messageWithAuthorSchema,
  });
}

/**
 * R-MSG8 : depose une image, une video ou un fichier dans la conversation.
 * L'`id` renvoye se joint ensuite a un message
 * (`attachment: { kind: "upload", uploadId }`).
 */
export function uploadMessageAttachment(
  conversationId: string,
  file: File,
): Promise<MessageUpload> {
  const body = new FormData();
  body.append("file", file);
  return apiFetch(`/conversations/${conversationId}/attachments`, {
    method: "POST",
    body,
    schema: messageUploadSchema,
  });
}

/** R-MSG9 : renommer un groupe (tout participant). */
export function renameConversation(
  conversationId: string,
  input: ConversationUpdateInput,
): Promise<ConversationDetail> {
  return apiFetch(`/conversations/${conversationId}`, {
    method: "PATCH",
    body: input,
    schema: conversationDetailSchema,
  });
}

/** R-MSG9 : ajouter des personnes a un groupe (tout participant, 50 au plus). */
export function addConversationParticipants(
  conversationId: string,
  input: ConversationParticipantsAddInput,
): Promise<ConversationDetail> {
  return apiFetch(`/conversations/${conversationId}/participants`, {
    method: "POST",
    body: input,
    schema: conversationDetailSchema,
  });
}

/** R-MSG9 : retirer quelqu'un d'un groupe (administrateur seulement). */
export function removeConversationParticipant(
  conversationId: string,
  userId: string,
): Promise<void> {
  return apiFetch(`/conversations/${conversationId}/participants/${userId}`, {
    method: "DELETE",
  });
}

/** R-MSG9 : quitter un groupe ; l'administration passe au plus ancien. */
export function leaveConversation(conversationId: string): Promise<void> {
  return apiFetch(`/conversations/${conversationId}/leave`, { method: "POST" });
}

/** R-MSG5 : l'auteur seul, sans limite de temps ; un message supprime ne se modifie plus. */
export function editMessage(
  messageId: string,
  body: string,
): Promise<MessageWithAuthor> {
  return apiFetch(`/messages/${messageId}`, {
    method: "PATCH",
    body: { body },
    schema: messageWithAuthorSchema,
  });
}

export function deleteMessage(messageId: string): Promise<void> {
  return apiFetch(`/messages/${messageId}`, { method: "DELETE" });
}

export function markConversationRead(conversationId: string): Promise<void> {
  return apiFetch(`/conversations/${conversationId}/read`, { method: "POST" });
}
