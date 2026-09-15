import {
  AtSign,
  Bell,
  Heart,
  MessageCircle,
  Megaphone,
  ShieldAlert,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { NotificationSummary } from "@/domain";
import { Avatar, ListItem } from "@shared/ui";
import { getAccent } from "@shared/lib/accent";
import { formatExactDateTime, formatRelativeDate } from "@shared/lib/dates";
import {
  actionPhrase,
  formatActors,
  targetHref,
  targetLabel,
} from "../lib/notificationText";

const ICON_BY_TYPE: Record<NotificationSummary["type"], LucideIcon> = {
  highfive_received: Heart,
  comment_on_project: MessageCircle,
  reply_to_comment: MessageCircle,
  join_request_received: UserPlus,
  join_request_accepted: UserPlus,
  join_request_rejected: UserPlus,
  invitation_received: UserPlus,
  new_member: UserPlus,
  announcement_on_followed_project: Megaphone,
  task_assigned: Bell,
  mention: AtSign,
  message_received: MessageCircle,
  admin_decision: ShieldAlert,
};

export interface NotificationItemProps {
  notification: NotificationSummary;
  compact?: boolean;
  onMarkRead: (notificationId: string) => void;
}

export function NotificationItem({
  notification,
  compact = false,
  onMarkRead,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const Icon = ICON_BY_TYPE[notification.type];
  const accent = getAccent(notification.type);
  const primaryActor = notification.actors[0];
  const label = targetLabel(notification.target);

  function handleActivate() {
    if (!notification.read) onMarkRead(notification.id);
    navigate(targetHref(notification.target));
  }

  return (
    <ListItem
      unread={!notification.read}
      onClick={handleActivate}
      className={compact ? "px-3 py-2" : undefined}
      leading={
        <span className="relative shrink-0">
          <Avatar
            name={primaryActor?.displayName ?? primaryActor?.username ?? "?"}
            src={primaryActor?.avatar}
            size={compact ? "sm" : "md"}
          />
          <span
            data-accent={accent}
            className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[var(--accent-light)] text-[var(--accent-dark)] ring-2 ring-card"
          >
            <Icon size={11} strokeWidth={2.5} />
          </span>
        </span>
      }
    >
      <p className="text-body-md text-foreground">
        <span className="font-semibold">
          {formatActors(notification.actors)}
        </span>{" "}
        {actionPhrase(notification.type, notification.actors.length > 1)}
        {label && <> {label}</>}
      </p>
      <p
        className="mt-0.5 text-body-sm text-muted-foreground"
        title={formatExactDateTime(notification.createdAt)}
      >
        {formatRelativeDate(notification.createdAt)}
      </p>
    </ListItem>
  );
}
