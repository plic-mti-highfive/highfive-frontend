export type {
  ConversationDto as Conversation,
  MessageDto as Message,
} from "@/api/types";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
}
