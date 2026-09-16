import type { NotificationSummary, NotificationType } from "@/domain";

/**
 * Categories de filtre de la page notifications : regroupent les 13 types
 * techniques en quelques familles lisibles (pilules "Demande", "Mention"...).
 */
export type NotificationCategory =
  | "request"
  | "mention"
  | "comment"
  | "highfive"
  | "task"
  | "announcement"
  | "message";

const CATEGORY_BY_TYPE: Record<NotificationType, NotificationCategory> = {
  highfive_received: "highfive",
  comment_on_project: "comment",
  reply_to_comment: "comment",
  join_request_received: "request",
  join_request_accepted: "request",
  join_request_rejected: "request",
  invitation_received: "request",
  new_member: "request",
  announcement_on_followed_project: "announcement",
  task_assigned: "task",
  mention: "mention",
  message_received: "message",
  admin_decision: "announcement",
};

/** Ordre d'affichage des pilules de filtre. */
export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "request",
  "mention",
  "comment",
  "highfive",
  "task",
  "announcement",
  "message",
];

const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  request: "Demande",
  mention: "Mention",
  comment: "Commentaire",
  highfive: "Highfive",
  task: "Tâche",
  announcement: "Annonce",
  message: "Message",
};

export function notificationCategory(
  type: NotificationType,
): NotificationCategory {
  return CATEGORY_BY_TYPE[type];
}

export function categoryLabel(category: NotificationCategory): string {
  return CATEGORY_LABEL[category];
}

/** Sections temporelles de la liste (doc 17 : regroupement par date). */
export interface NotificationDateGroup {
  key: string;
  label: string;
  items: NotificationSummary[];
}

const DATE_BUCKETS = [
  { key: "today", label: "Aujourd'hui" },
  { key: "yesterday", label: "Hier" },
  { key: "week", label: "Cette semaine" },
  { key: "month", label: "Ce mois-ci" },
  { key: "older", label: "Plus ancien" },
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function bucketKey(iso: string, now: Date): string {
  const diffDays = Math.floor(
    (startOfDay(now) - startOfDay(new Date(iso))) / DAY_MS,
  );
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return "week";
  if (diffDays < 30) return "month";
  return "older";
}

/**
 * Repartit les notifications (les plus recentes d'abord) dans les sections
 * temporelles, en ne gardant que les sections non vides.
 */
export function groupNotificationsByDate(
  notifications: NotificationSummary[],
  now: Date = new Date(),
): NotificationDateGroup[] {
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return DATE_BUCKETS.map(({ key, label }) => ({
    key,
    label,
    items: sorted.filter((n) => bucketKey(n.createdAt, now) === key),
  })).filter((group) => group.items.length > 0);
}
