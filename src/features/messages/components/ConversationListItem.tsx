import { Users } from "lucide-react";
import type { ConversationSummary } from "@/domain";
import { Avatar, AvatarGroup, ListItem } from "@shared/ui";
import { formatRelativeDate, formatExactDateTime } from "@shared/lib/dates";
import { getConversationDisplay } from "../lib/conversationDisplay";

export interface ConversationListItemProps {
  conversation: ConversationSummary;
  currentUserId: string;
  active: boolean;
  onSelect: () => void;
}

export function ConversationListItem({
  conversation,
  currentUserId,
  active,
  onSelect,
}: ConversationListItemProps) {
  const { title, avatarPeople } = getConversationDisplay(
    conversation,
    currentUserId,
  );
  const { lastMessage, unreadCount } = conversation;
  const isOwnLastMessage = lastMessage?.authorId === currentUserId;
  const preview = !lastMessage
    ? "Aucun message pour l'instant"
    : lastMessage.deleted
      ? "Message supprimé"
      : `${isOwnLastMessage ? "Toi : " : ""}${lastMessage.body}`;

  return (
    <ListItem
      active={active}
      unread={unreadCount > 0}
      onClick={onSelect}
      leading={
        avatarPeople.length > 1 ? (
          <AvatarGroup max={2}>
            {avatarPeople.map((person) => (
              <Avatar
                key={person.id}
                name={person.displayName ?? person.username}
                src={person.avatar}
                size="md"
              />
            ))}
          </AvatarGroup>
        ) : avatarPeople[0] ? (
          <Avatar
            name={avatarPeople[0].displayName ?? avatarPeople[0].username}
            src={avatarPeople[0].avatar}
            size="md"
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users size={16} />
          </span>
        )
      }
      trailing={
        lastMessage ? (
          <span
            className="shrink-0 text-body-sm text-muted-foreground"
            title={formatExactDateTime(lastMessage.sentAt)}
          >
            {formatRelativeDate(lastMessage.sentAt)}
          </span>
        ) : undefined
      }
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-body-lg font-semibold text-foreground">
          {title}
        </p>
      </div>
      <p className="truncate text-body-md text-muted-foreground">{preview}</p>
    </ListItem>
  );
}
