import { Heart, MessageCircle, UserPlus, AtSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Notification } from "../types";

const ACTOR_COLORS: Record<string, string> = {
  "user-2": "bg-violet-200 text-violet-800",
  "user-3": "bg-sky-200 text-sky-800",
  "user-4": "bg-emerald-200 text-emerald-800",
  "user-5": "bg-amber-200 text-amber-800",
  "user-6": "bg-pink-200 text-pink-800",
};

function ActorAvatar({ actor }: { actor: Notification["actor"] }) {
  const initials = actor.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const colorCls = ACTOR_COLORS[actor.id] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold text-xs shrink-0 ${colorCls}`}
    >
      {initials}
    </span>
  );
}

function NotifIcon({ type }: { type: Notification["type"] }) {
  const cfg = {
    like: { Icon: Heart, cls: "bg-rose-100 text-rose-500" },
    comment: { Icon: MessageCircle, cls: "bg-sky-100 text-sky-500" },
    follow: { Icon: UserPlus, cls: "bg-emerald-100 text-emerald-600" },
    mention: { Icon: AtSign, cls: "bg-amber-100 text-amber-600" },
  }[type];

  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${cfg.cls}`}
    >
      <cfg.Icon size={11} strokeWidth={2.5} />
    </span>
  );
}

function buildText(notif: Notification): string {
  switch (notif.type) {
    case "like":
      return notif.target
        ? `a aimé votre projet "${notif.target.label}"`
        : "a aimé votre contenu";
    case "comment":
      return notif.target
        ? `a commenté "${notif.target.label}"`
        : "a commenté votre contenu";
    case "follow":
      return "a commencé à vous suivre";
    case "mention":
      return notif.target
        ? `vous a mentionné dans "${notif.target.label}"`
        : "vous a mentionné";
  }
}

interface NotificationItemProps {
  notification: Notification;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  compact = false,
}: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <div
      className={`flex items-start gap-3 transition-colors ${
        compact
          ? "px-3 py-2.5 hover:bg-muted/60 rounded-lg"
          : "px-4 py-3 hover:bg-muted/40"
      } ${!notification.read ? "bg-primary/5" : ""}`}
    >
      <div className="relative shrink-0">
        <ActorAvatar actor={notification.actor} />
        <NotifIcon type={notification.type} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          <span className="font-semibold">{notification.actor.name}</span>{" "}
          {buildText(notification)}
        </p>
        {notification.excerpt && (
          <p className="text-xs text-muted-foreground mt-0.5 italic truncate">
            "{notification.excerpt}"
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
      </div>

      {!notification.read && (
        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
      )}
    </div>
  );
}
