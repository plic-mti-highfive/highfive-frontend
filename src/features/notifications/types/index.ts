export type NotificationType = "like" | "comment" | "follow" | "mention";

export interface Notification {
  id: string;
  type: NotificationType;
  read: boolean;
  timestamp: Date;
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  target?: {
    type: "project" | "comment";
    id: string;
    label: string;
  };
  excerpt?: string;
}
