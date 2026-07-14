export interface ConversationDto {
  id: string;
  type: "direct" | "group";
  participants: string[];
  name?: string;
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount: number;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}
