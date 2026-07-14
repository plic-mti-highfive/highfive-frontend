import type { ConversationDto as Conversation } from "../../../types";

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    type: "direct",
    participants: ["user-1", "user-2"],
    lastMessage: {
      content: "Oui, à bientôt!",
      senderId: "user-2",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    },
    unreadCount: 0,
  },
  {
    id: "conv-2",
    type: "direct",
    participants: ["user-1", "user-3"],
    lastMessage: {
      content: "Peux-tu vérifier le rapport?",
      senderId: "user-1",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    unreadCount: 2,
  },
  {
    id: "conv-3",
    type: "group",
    participants: ["user-1", "user-2", "user-4", "user-5"],
    name: "Projet React",
    lastMessage: {
      content: "La mise en page est prête!",
      senderId: "user-4",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h ago
    },
    unreadCount: 5,
  },
  {
    id: "conv-4",
    type: "direct",
    participants: ["user-1", "user-6"],
    lastMessage: {
      content: "Je suis d'accord avec toi",
      senderId: "user-6",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    unreadCount: 0,
  },
];
