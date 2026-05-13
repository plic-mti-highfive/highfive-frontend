export interface Conversation {
  id: string;
  type: "direct" | "group";
  participants: string[]; // userIds
  name?: string; // pour les groupes
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
}
