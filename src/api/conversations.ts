import { z } from "zod";
import { apiFetch } from "./client";
import {
  conversationSchema,
  conversationSummarySchema,
  messageSchema,
  paginatedSchema,
  type Conversation,
  type ConversationCreateInput,
  type ConversationSummary,
  type Message,
  type MessageCreateInput,
  type Paginated,
} from "@/domain";

/** R-MSG7 : les conversations sans reponse arrivent dans "Demandes de message". */
export function listConversations(): Promise<ConversationSummary[]> {
  return apiFetch("/conversations", {
    schema: z.array(conversationSummarySchema),
  });
}

export function getConversation(conversationId: string): Promise<Conversation> {
  return apiFetch(`/conversations/${conversationId}`, {
    schema: conversationSchema,
  });
}

export function listMessages(
  conversationId: string,
  cursor?: string,
): Promise<Paginated<Message>> {
  return apiFetch(`/conversations/${conversationId}/messages`, {
    query: { cursor },
    schema: paginatedSchema(messageSchema),
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
): Promise<Message> {
  return apiFetch(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: input,
    schema: messageSchema,
  });
}

/** R-MSG5 : modification possible dans les 15 minutes (verifie cote handler). */
export function editMessage(messageId: string, body: string): Promise<Message> {
  return apiFetch(`/messages/${messageId}`, {
    method: "PATCH",
    body: { body },
    schema: messageSchema,
  });
}

export function deleteMessage(messageId: string): Promise<void> {
  return apiFetch(`/messages/${messageId}`, { method: "DELETE" });
}

export function markConversationRead(conversationId: string): Promise<void> {
  return apiFetch(`/conversations/${conversationId}/read`, { method: "POST" });
}
