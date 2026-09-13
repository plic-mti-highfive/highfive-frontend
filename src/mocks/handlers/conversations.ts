import { http, HttpResponse } from "msw";
import {
  conversationCreateInputSchema,
  messageCreateInputSchema,
} from "@/domain";
import { nextId } from "../data/ids";
import { getDb, type MockDatabase } from "../db";
import {
  apiUrl,
  errors,
  getAuthUser,
  paginate,
  simulateLatency,
} from "./utils";

function messagesOf(db: MockDatabase, conversationId: string) {
  return db.messages
    .find((m) => m.conversationId === conversationId)
    .sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    );
}

/** R-MSG7 : une conversation directe reste une "demande" jusqu'a la premiere reponse du destinataire. */
function isMessageRequest(
  db: MockDatabase,
  conversation: { id: string; type: string },
  viewerId: string,
) {
  if (conversation.type !== "direct") return false;
  const messages = messagesOf(db, conversation.id);
  if (!messages.length) return false;
  return messages.every((m) => m.authorId !== viewerId);
}

function toSummary(
  db: MockDatabase,
  conversation: ReturnType<MockDatabase["conversations"]["all"]>[number],
  viewerId: string,
) {
  const messages = messagesOf(db, conversation.id);
  const last = messages.at(-1);
  const unreadCount = messages.filter(
    (m) => m.authorId !== viewerId && !m.readBy.includes(viewerId),
  ).length;
  return {
    ...conversation,
    lastMessage: last
      ? { body: last.body, authorId: last.authorId, sentAt: last.sentAt }
      : undefined,
    unreadCount,
    isMessageRequest: isMessageRequest(db, conversation, viewerId),
  };
}

export const conversationHandlers = [
  http.get(apiUrl("/conversations"), async ({ request }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    const db = getDb();
    const conversations = db.conversations
      .find((c) => c.participantIds.includes(user.id))
      .map((c) => toSummary(db, c, user.id))
      .sort((a, b) => {
        const at = a.lastMessage ? new Date(a.lastMessage.sentAt).getTime() : 0;
        const bt = b.lastMessage ? new Date(b.lastMessage.sentAt).getTime() : 0;
        return bt - at;
      });
    return HttpResponse.json(conversations);
  }),

  http.get(
    apiUrl("/conversations/:conversationId"),
    async ({ request, params }) => {
      await simulateLatency();
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();
      const db = getDb();
      const conversation = db.conversations.findOne(
        (c) => c.id === params.conversationId,
      );
      if (!conversation || !conversation.participantIds.includes(user.id)) {
        return errors.notFound("Conversation introuvable.");
      }
      return HttpResponse.json(conversation);
    },
  ),

  http.get(
    apiUrl("/conversations/:conversationId/messages"),
    async ({ request, params }) => {
      await simulateLatency();
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();
      const db = getDb();
      const conversation = db.conversations.findOne(
        (c) => c.id === params.conversationId,
      );
      if (!conversation || !conversation.participantIds.includes(user.id)) {
        return errors.notFound("Conversation introuvable.");
      }
      const url = new URL(request.url);
      const page = paginate(
        messagesOf(db, conversation.id),
        url.searchParams.get("cursor"),
      );
      return HttpResponse.json(page);
    },
  ),

  http.post(apiUrl("/conversations"), async ({ request }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    const parsed = conversationCreateInputSchema.safeParse(
      await request.json(),
    );
    if (!parsed.success) return errors.validation(parsed.error.issues);

    const db = getDb();
    const participantIds = Array.from(
      new Set([user.id, ...parsed.data.participantIds]),
    );
    const type = participantIds.length === 2 ? "direct" : "group";
    if (
      type === "group" &&
      (participantIds.length < 3 || participantIds.length > 50)
    ) {
      return errors.validation({
        participantIds: "Un groupe compte de 3 a 50 personnes.",
      });
    }

    const now = new Date().toISOString();
    const conversation = {
      id: nextId(),
      type: type as "direct" | "group",
      participantIds,
      title: type === "group" ? parsed.data.title : undefined,
      createdAt: now,
    };
    db.conversations.insert(conversation);
    db.messages.insert({
      id: nextId(),
      conversationId: conversation.id,
      authorId: user.id,
      body: parsed.data.message,
      readBy: [user.id],
      sentAt: now,
      deleted: false,
    });
    return HttpResponse.json(conversation, { status: 201 });
  }),

  http.post(
    apiUrl("/conversations/:conversationId/messages"),
    async ({ request, params }) => {
      await simulateLatency();
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();
      const db = getDb();
      const conversation = db.conversations.findOne(
        (c) => c.id === params.conversationId,
      );
      if (!conversation || !conversation.participantIds.includes(user.id)) {
        return errors.notFound("Conversation introuvable.");
      }
      const parsed = messageCreateInputSchema.safeParse(await request.json());
      if (!parsed.success) return errors.validation(parsed.error.issues);

      const message = {
        id: nextId(),
        conversationId: conversation.id,
        authorId: user.id,
        body: parsed.data.body,
        attachment: parsed.data.attachment,
        readBy: [user.id],
        sentAt: new Date().toISOString(),
        deleted: false,
      };
      db.messages.insert(message);
      return HttpResponse.json(message, { status: 201 });
    },
  ),

  http.patch(apiUrl("/messages/:messageId"), async ({ request, params }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    const db = getDb();
    const message = db.messages.findOne((m) => m.id === params.messageId);
    if (!message || message.authorId !== user.id)
      return errors.notFound("Message introuvable.");

    // R-MSG5 : modification possible pendant 15 minutes.
    const ageMs = Date.now() - new Date(message.sentAt).getTime();
    if (ageMs > 15 * 60 * 1000)
      return errors.forbidden("Le delai de modification est depasse.");

    const body = (await request.json()) as { body?: string };
    if (!body.body) return errors.validation({ body: "Requis." });
    const updated = db.messages.update((m) => m.id === message.id, {
      body: body.body,
      editedAt: new Date().toISOString(),
    });
    return HttpResponse.json(updated);
  }),

  http.delete(apiUrl("/messages/:messageId"), async ({ request, params }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    const db = getDb();
    const message = db.messages.findOne((m) => m.id === params.messageId);
    if (!message || message.authorId !== user.id)
      return errors.notFound("Message introuvable.");

    // R-MSG6 : suppression laisse "Message supprime".
    db.messages.update((m) => m.id === message.id, { deleted: true, body: "" });
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(
    apiUrl("/conversations/:conversationId/read"),
    async ({ request, params }) => {
      await simulateLatency();
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();
      const db = getDb();
      const conversation = db.conversations.findOne(
        (c) => c.id === params.conversationId,
      );
      if (!conversation || !conversation.participantIds.includes(user.id)) {
        return errors.notFound("Conversation introuvable.");
      }
      for (const message of messagesOf(db, conversation.id)) {
        if (!message.readBy.includes(user.id)) {
          db.messages.update((m) => m.id === message.id, {
            readBy: [...message.readBy, user.id],
          });
        }
      }
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
