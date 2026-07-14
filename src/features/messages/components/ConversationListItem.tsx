import type { Conversation } from "../types";
import { format, isToday, isYesterday } from "date-fns";
import { frCA } from "date-fns/locale";

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const USER_NAMES: Record<string, string> = {
  "user-1": "Moi",
  "user-2": "Sophie Martin",
  "user-3": "Thomas Dupont",
  "user-4": "Marie Laurent",
  "user-5": "Jean Claude",
  "user-6": "Lisa Moreau",
};

const USER_COLORS: Record<string, string> = {
  "user-1": "bg-rose-200 text-rose-800",
  "user-2": "bg-violet-200 text-violet-800",
  "user-3": "bg-sky-200 text-sky-800",
  "user-4": "bg-emerald-200 text-emerald-800",
  "user-5": "bg-amber-200 text-amber-800",
  "user-6": "bg-pink-200 text-pink-800",
};

function getInitials(userId: string): string {
  const name = USER_NAMES[userId] || "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function UserAvatar({
  userId,
  size = "md",
}: {
  userId: string;
  size?: "sm" | "md";
}) {
  const colorCls = USER_COLORS[userId] ?? "bg-muted text-muted-foreground";
  const sizeCls = size === "sm" ? "w-7 h-7 text-[10px]" : "w-10 h-10 text-xs";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold shrink-0 ${sizeCls} ${colorCls}`}
    >
      {getInitials(userId)}
    </span>
  );
}

function ConversationAvatar({
  conversation,
  currentUserId = "user-1",
}: {
  conversation: Conversation;
  currentUserId?: string;
}) {
  if (conversation.type === "direct") {
    const otherId =
      conversation.participants.find((id) => id !== currentUserId) ??
      currentUserId;
    return <UserAvatar userId={otherId} size="md" />;
  }

  // Group: show up to 2 non-current participants stacked
  const others = conversation.participants
    .filter((id) => id !== currentUserId)
    .slice(0, 2);

  return (
    <div className="relative w-10 h-10 shrink-0">
      <span className="absolute bottom-0 left-0">
        <UserAvatar userId={others[1] ?? others[0]} size="sm" />
      </span>
      <span className="absolute top-0 right-0 ring-2 ring-sidebar">
        <UserAvatar userId={others[0]} size="sm" />
      </span>
    </div>
  );
}

function formatMessageTime(date: Date): string {
  if (isToday(date)) {
    return format(date, "HH:mm", { locale: frCA });
  }
  if (isYesterday(date)) {
    return "Hier";
  }
  return format(date, "d MMM", { locale: frCA });
}

function getConversationName(
  conversation: Conversation,
  currentUserId = "user-1",
): string {
  if (conversation.type === "group") {
    return conversation.name || "Groupe sans nom";
  }
  const otherUserId = conversation.participants.find(
    (id) => id !== currentUserId,
  );
  return USER_NAMES[otherUserId ?? "user-1"] ?? "Utilisateur";
}

export function ConversationListItem({
  conversation,
  isSelected,
  onSelect,
}: ConversationListItemProps) {
  const name = getConversationName(conversation);
  const timestamp = formatMessageTime(conversation.lastMessage.timestamp);
  const truncatedContent =
    conversation.lastMessage.content.substring(0, 40) +
    (conversation.lastMessage.content.length > 40 ? "..." : "");

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`w-full px-4 py-3 text-left border-b border-border transition-colors ${
        isSelected ? "bg-muted" : "hover:bg-muted/50 bg-sidebar"
      }`}
    >
      <div className="flex items-center gap-3">
        <ConversationAvatar conversation={conversation} />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <h3 className="font-medium text-foreground truncate">{name}</h3>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {timestamp}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {truncatedContent}
          </p>
        </div>

        {conversation.unreadCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 bg-primary text-primary-foreground text-xs font-medium rounded-full shrink-0">
            {conversation.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}
