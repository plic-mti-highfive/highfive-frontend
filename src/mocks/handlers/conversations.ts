import { http, HttpResponse } from "msw";
import {
  GROUP_MAX_PARTICIPANTS,
  conversationCreateInputSchema,
  conversationParticipantsAddInputSchema,
  conversationUpdateInputSchema,
  messageBodyUpdateInputSchema,
  messageCreateInputSchema,
  type Message,
  type MessageAttachmentPreview,
  type MessageWithAuthor,
} from "@/domain";
import { nextId } from "../data/ids";
import { getDb, type DbUser, type MockDatabase } from "../db";
import {
  apiUrl,
  errors,
  getAuthUser,
  isWritable,
  paginate,
  simulateLatency,
  toUserSummary,
} from "./utils";

/** R-MSG8 : plafonds par famille ; les executables sont refuses (R-F2). */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_OTHER_SIZE = 20 * 1024 * 1024;
const FORBIDDEN_MIME = ["application/x-msdownload", "application/x-executable"];

function maxSizeFor(mimeType: string) {
  if (mimeType.startsWith("image/")) return MAX_IMAGE_SIZE;
  if (mimeType.startsWith("video/")) return MAX_VIDEO_SIZE;
  return MAX_OTHER_SIZE;
}

function messagesOf(db: MockDatabase, conversationId: string) {
  return db.messages
    .find((m) => m.conversationId === conversationId)
    .sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    );
}

function participantsOf(db: MockDatabase, participantIds: string[]) {
  return participantIds
    .map((id) => db.users.findOne((u) => u.id === id))
    .filter((u): u is DbUser => Boolean(u))
    .map(toUserSummary);
}

/** R-MSG3 : un canal miroite l'equipe d'un projet ; on resout son nom pour l'affichage. */
function projectInfoOf(db: MockDatabase, projectId: string | undefined) {
  if (!projectId) return {};
  const project = db.projects.findOne((p) => p.id === projectId);
  if (!project) return {};
  return { projectSlug: project.slug, projectTitle: project.title };
}

/** R-MSG4 : resout la piece jointe (projet ou fichier) pour l'aperçu embarque. */
function resolveAttachmentPreview(
  db: MockDatabase,
  attachment: Message["attachment"],
): MessageAttachmentPreview | undefined {
  if (!attachment) return undefined;
  if (attachment.kind === "project") {
    const project = db.projects.findOne((p) => p.id === attachment.projectId);
    if (!project) return undefined;
    return {
      kind: "project",
      projectSlug: project.slug,
      projectTitle: project.title,
      projectTagline: project.tagline,
    };
  }
  if (attachment.kind === "upload") {
    const upload = db.messageUploads.findOne(
      (u) => u.id === attachment.uploadId,
    );
    if (!upload) return undefined;
    return {
      kind: "upload",
      uploadId: upload.id,
      fileName: upload.fileName,
      fileSize: upload.fileSize,
      mimeType: upload.mimeType,
      url: upload.url,
    };
  }
  const file = db.files.findOne((f) => f.id === attachment.fileId);
  if (!file) return undefined;
  return {
    kind: "file",
    fileId: file.id,
    fileName: file.name,
    fileSize: file.size,
  };
}

function toMessageWithAuthor(
  db: MockDatabase,
  message: Message,
): MessageWithAuthor {
  return {
    ...message,
    author: toUserSummary(db.users.findOne((u) => u.id === message.authorId)!),
    attachmentPreview: resolveAttachmentPreview(db, message.attachment),
  };
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

type DbConversation = ReturnType<MockDatabase["conversations"]["all"]>[number];

function toDetail(db: MockDatabase, conversation: DbConversation) {
  return {
    ...conversation,
    participants: participantsOf(db, conversation.participantIds),
    ...projectInfoOf(db, conversation.projectId),
  };
}

/**
 * R-MSG9 : seul un groupe se gere par ces routes, et seulement par l'un de
 * ses participants. Renvoie la conversation, ou la reponse d'erreur.
 */
function ownGroup(request: Request, conversationId: unknown) {
  const user = getAuthUser(request);
  if (!user) return { error: errors.unauthorized() };
  const db = getDb();
  const conversation = db.conversations.findOne((c) => c.id === conversationId);
  if (!conversation || !conversation.participantIds.includes(user.id)) {
    return { error: errors.notFound("Conversation introuvable.") };
  }
  if (conversation.type !== "group") {
    return {
      error: errors.forbidden(
        "Seul un groupe se gere ainsi : une conversation directe reste a deux, un canal suit son equipe.",
      ),
    };
  }
  return { user, db, conversation };
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
    participants: participantsOf(db, conversation.participantIds),
    ...projectInfoOf(db, conversation.projectId),
    lastMessage: last
      ? {
          body: last.body,
          authorId: last.authorId,
          sentAt: last.sentAt,
          deleted: last.deleted,
          attachmentKind: last.deleted ? undefined : last.attachment?.kind,
        }
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
      return HttpResponse.json(toDetail(db, conversation));
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
      // Comme le backend : la premiere page porte les plus recents, le curseur
      // remonte vers les plus anciens, chaque page reste chronologique.
      const page = paginate(
        messagesOf(db, conversation.id).reverse(),
        url.searchParams.get("cursor"),
      );
      return HttpResponse.json({
        ...page,
        items: page.items.reverse().map((m) => toMessageWithAuthor(db, m)),
      });
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
      (participantIds.length < 3 ||
        participantIds.length > GROUP_MAX_PARTICIPANTS)
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
      // R-MSG9 : le createur administre le groupe.
      adminId: type === "group" ? user.id : undefined,
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

      // R-MSG8 : un depot ne se joint qu'une fois, par son auteur, dans sa
      // conversation.
      const attachment = parsed.data.attachment;
      if (attachment?.kind === "upload") {
        const upload = db.messageUploads.findOne(
          (u) => u.id === attachment.uploadId,
        );
        const alreadyUsed = db.messages
          .all()
          .some(
            (m) =>
              m.attachment?.kind === "upload" &&
              m.attachment.uploadId === attachment.uploadId,
          );
        if (
          !upload ||
          upload.conversationId !== conversation.id ||
          upload.uploadedBy !== user.id ||
          alreadyUsed
        ) {
          return errors.validation({
            attachment:
              "Ce fichier est introuvable : il ne peut pas etre joint.",
          });
        }
      }

      const message = {
        id: nextId(),
        conversationId: conversation.id,
        authorId: user.id,
        body: parsed.data.body ?? "",
        attachment: parsed.data.attachment,
        readBy: [user.id],
        sentAt: new Date().toISOString(),
        deleted: false,
      };
      db.messages.insert(message);
      return HttpResponse.json(toMessageWithAuthor(db, message), {
        status: 201,
      });
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

    // R-MSG5 : sans limite de temps, mais un message supprime reste supprime.
    if (message.deleted)
      return errors.forbidden(
        "Ce message a ete supprime : il ne peut plus etre modifie.",
      );

    const parsed = messageBodyUpdateInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);
    const updated = db.messages.update((m) => m.id === message.id, {
      body: parsed.data.body,
      editedAt: new Date().toISOString(),
    });
    return HttpResponse.json(toMessageWithAuthor(db, updated!));
  }),

  http.delete(apiUrl("/messages/:messageId"), async ({ request, params }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    const db = getDb();
    const message = db.messages.findOne((m) => m.id === params.messageId);
    if (!message || message.authorId !== user.id)
      return errors.notFound("Message introuvable.");

    // R-MSG6 : suppression laisse "Message supprime", sans sa piece jointe.
    if (message.attachment?.kind === "upload") {
      const uploadId = message.attachment.uploadId;
      db.messageUploads.remove((u) => u.id === uploadId);
    }
    db.messages.update((m) => m.id === message.id, {
      deleted: true,
      body: "",
      attachment: undefined,
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(
    apiUrl("/conversations/:conversationId"),
    async ({ request, params }) => {
      await simulateLatency();
      const found = ownGroup(request, params.conversationId);
      if ("error" in found) return found.error;
      const { user, db, conversation } = found;
      if (!isWritable(user)) return errors.forbidden();
      const parsed = conversationUpdateInputSchema.safeParse(
        await request.json(),
      );
      if (!parsed.success) return errors.validation(parsed.error.issues);
      const updated = db.conversations.update((c) => c.id === conversation.id, {
        title: parsed.data.title,
      });
      return HttpResponse.json(toDetail(db, updated!));
    },
  ),

  http.post(
    apiUrl("/conversations/:conversationId/participants"),
    async ({ request, params }) => {
      await simulateLatency();
      const found = ownGroup(request, params.conversationId);
      if ("error" in found) return found.error;
      const { user, db, conversation } = found;
      if (!isWritable(user)) return errors.forbidden();
      const parsed = conversationParticipantsAddInputSchema.safeParse(
        await request.json(),
      );
      if (!parsed.success) return errors.validation(parsed.error.issues);
      const unknown = parsed.data.participantIds.some(
        (id) =>
          !db.users.findOne((u) => u.id === id && u.accountStatus === "active"),
      );
      if (unknown) {
        return errors.validation({
          participantIds: "Certaines personnes sont introuvables.",
        });
      }
      const participantIds = Array.from(
        new Set([
          ...conversation.participantIds,
          ...parsed.data.participantIds,
        ]),
      );
      if (participantIds.length > GROUP_MAX_PARTICIPANTS) {
        return errors.validation({
          participantIds: "Un groupe compte de 3 a 50 personnes.",
        });
      }
      const updated = db.conversations.update((c) => c.id === conversation.id, {
        participantIds,
      });
      return HttpResponse.json(toDetail(db, updated!));
    },
  ),

  http.delete(
    apiUrl("/conversations/:conversationId/participants/:userId"),
    async ({ request, params }) => {
      await simulateLatency();
      const found = ownGroup(request, params.conversationId);
      if ("error" in found) return found.error;
      const { user, db, conversation } = found;
      const adminId = conversation.adminId ?? conversation.participantIds[0];
      if (adminId !== user.id) {
        return errors.forbidden(
          "Seul l'administrateur du groupe peut en retirer quelqu'un.",
        );
      }
      if (params.userId === user.id) {
        return errors.validation({
          userId: "Pour partir, quitte le groupe.",
        });
      }
      if (!conversation.participantIds.includes(String(params.userId))) {
        return errors.notFound("Cette personne n'est pas dans le groupe.");
      }
      db.conversations.update((c) => c.id === conversation.id, {
        participantIds: conversation.participantIds.filter(
          (id) => id !== params.userId,
        ),
      });
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.post(
    apiUrl("/conversations/:conversationId/leave"),
    async ({ request, params }) => {
      await simulateLatency();
      const found = ownGroup(request, params.conversationId);
      if ("error" in found) return found.error;
      const { user, db, conversation } = found;
      const participantIds = conversation.participantIds.filter(
        (id) => id !== user.id,
      );
      if (participantIds.length === 0) {
        db.messages.remove((m) => m.conversationId === conversation.id);
        db.conversations.remove((c) => c.id === conversation.id);
        return new HttpResponse(null, { status: 204 });
      }
      // R-MSG9 : l'administration passe au plus ancien participant restant.
      const adminId =
        conversation.adminId === user.id
          ? participantIds[0]
          : conversation.adminId;
      db.conversations.update((c) => c.id === conversation.id, {
        participantIds,
        adminId,
      });
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.post(
    apiUrl("/conversations/:conversationId/attachments"),
    async ({ request, params }) => {
      await simulateLatency();
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();
      if (!isWritable(user)) {
        return errors.forbidden(
          "Ton compte est suspendu : tu ne peux pas envoyer de message.",
        );
      }
      const db = getDb();
      const conversation = db.conversations.findOne(
        (c) => c.id === params.conversationId,
      );
      if (!conversation || !conversation.participantIds.includes(user.id)) {
        return errors.notFound("Conversation introuvable.");
      }

      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File))
        return errors.validation({ file: "Fichier requis." });
      if (FORBIDDEN_MIME.includes(file.type)) {
        return errors.validation({
          file: "Ce type de fichier n'est pas autorise (R-F2).",
        });
      }
      const maxSize = maxSizeFor(file.type);
      if (file.size > maxSize) {
        return errors.validation({
          file: `${maxSize / (1024 * 1024)} Mo maximum pour ce type de fichier.`,
        });
      }

      const upload = {
        id: nextId(),
        conversationId: conversation.id,
        uploadedBy: user.id,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        // Le mock n'a pas de stockage : l'URL locale du navigateur en tient lieu.
        url: URL.createObjectURL(file),
      };
      db.messageUploads.insert(upload);
      return HttpResponse.json(
        {
          id: upload.id,
          fileName: upload.fileName,
          fileSize: upload.fileSize,
          mimeType: upload.mimeType,
        },
        { status: 201 },
      );
    },
  ),

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
