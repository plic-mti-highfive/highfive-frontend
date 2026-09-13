import type { ConversationDto, MessageDto } from "../../types";

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
 *
 * `LegacyNotification` etait auparavant importe depuis
 * `@features/notifications/types` : ce type a migre vers le domaine v2
 * (`NotificationSummary` dans `src/domain/notification.ts`), consomme par
 * `src/api/queries/notifications.ts`. Il reste defini ici, local a cette
 * ancienne implementation mock, pour les appelants qui n'ont pas encore
 * migre (ex. `@features/layout/components/Header.tsx`).
 */
export type LegacyNotificationType = "like" | "comment" | "follow" | "mention";

export interface LegacyNotification {
  id: string;
  type: LegacyNotificationType;
  read: boolean;
  timestamp: Date;
  actor: { id: string; name: string; avatar?: string };
  target?: { type: "project" | "comment"; id: string; label: string };
  excerpt?: string;
}

export interface IMessagingService {
  getConversations(): Promise<ConversationDto[]>;
  getMessages(conversationId: string): Promise<MessageDto[]>;
  sendMessage(conversationId: string, content: string): Promise<MessageDto>;
}

export interface INotificationService {
  getNotifications(): Promise<LegacyNotification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}
