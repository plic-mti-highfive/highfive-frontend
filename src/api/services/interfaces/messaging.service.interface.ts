import type { ConversationDto, MessageDto } from "../../types";
import type { Notification } from "@features/notifications/types";

/**
 * Messagerie privee et notifications.
 *
 * Ces deux ecrans lisaient les donnees mock en important directement
 * `@/api/services/mock/data/...` depuis les composants, court-circuitant la
 * couche API : ils affichaient donc les memes conversations fictives en mode
 * http qu'en mode mock, avec des utilisateurs absents de la base.
 *
 * Le backend n'expose a ce jour aucune route de messagerie privee ni de
 * notification (il n'a que /projects/:id/messages, qui est la discussion d'un
 * projet). Il n'existe donc pas encore d'implementation HTTP : la factory
 * renvoie le mock dans les deux modes, explicitement, en attendant que le
 * domaine existe cote serveur. Le contrat est pose ici pour que le jour venu
 * seule la factory change.
 */
export interface IMessagingService {
  getConversations(): Promise<ConversationDto[]>;
  getMessages(conversationId: string): Promise<MessageDto[]>;
  sendMessage(conversationId: string, content: string): Promise<MessageDto>;
}

export interface INotificationService {
  getNotifications(): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}
