import type {
  IMessagingService,
  INotificationService,
  LegacyNotification,
} from "../interfaces/messaging.service.interface";
import type { ConversationDto, MessageDto } from "../../types";
import { delay, generateId } from "./utils";
import { mockConversations, mockMessages, mockNotifications } from "./data";

/**
 * Messagerie et notifications en memoire.
 *
 * Seule implementation disponible : le backend n'expose pas encore ces
 * domaines (cf. messaging.service.interface.ts). L'etat est mutable pour que
 * l'envoi d'un message ou le marquage comme lu aient un effet visible.
 */
export class MessagingServiceMock implements IMessagingService {
  private conversations: ConversationDto[] = mockConversations.map((c) => ({
    ...c,
  }));
  private messages: MessageDto[] = mockMessages.map((m) => ({ ...m }));

  async getConversations(): Promise<ConversationDto[]> {
    await delay(200);
    return this.conversations.map((c) => ({ ...c }));
  }

  async getMessages(conversationId: string): Promise<MessageDto[]> {
    await delay(200);
    return this.messages
      .filter((m) => m.conversationId === conversationId)
      .map((m) => ({ ...m }));
  }

  async sendMessage(
    conversationId: string,
    content: string,
  ): Promise<MessageDto> {
    await delay(200);
    const message: MessageDto = {
      id: generateId(),
      conversationId,
      senderId: "current-user",
      content,
      timestamp: new Date(),
      read: true,
    };
    this.messages.push(message);

    const conversation = this.conversations.find(
      (c) => c.id === conversationId,
    );
    if (conversation) {
      conversation.lastMessage = {
        content,
        senderId: message.senderId,
        timestamp: message.timestamp,
      };
    }

    return { ...message };
  }
}

export class NotificationServiceMock implements INotificationService {
  private notifications: LegacyNotification[] = mockNotifications.map((n) => ({
    ...n,
  }));

  async getNotifications(): Promise<LegacyNotification[]> {
    await delay(200);
    return this.notifications.map((n) => ({ ...n }));
  }

  async markAsRead(notificationId: string): Promise<void> {
    await delay(100);
    const notification = this.notifications.find(
      (n) => n.id === notificationId,
    );
    if (notification) notification.read = true;
  }

  async markAllAsRead(): Promise<void> {
    await delay(100);
    this.notifications.forEach((n) => {
      n.read = true;
    });
  }
}
