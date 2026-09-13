import { useEffect, useRef } from "react";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import type { CurrentUser } from "@/domain";
import { ApiError } from "@/api/client";
import {
  useConversation,
  useDeleteMessage,
  useEditMessage,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from "@/api/queries/conversations";
import {
  Avatar,
  AvatarGroup,
  EmptyState,
  ErrorState,
  IconButton,
  Skeleton,
} from "@shared/ui";
import { getConversationDisplay } from "../lib/conversationDisplay";
import { MessageBubble } from "./MessageBubble";
import { MessageDateSeparator } from "./MessageDateSeparator";
import { MessageInput } from "./MessageInput";

const EDIT_WINDOW_MS = 15 * 60 * 1000;

/** R-MSG5 : fenetre de 15 minutes, verifiee cote handler — ici pour l'affichage seul. */
function isWithinEditWindow(sentAt: string): boolean {
  return Date.now() - new Date(sentAt).getTime() <= EDIT_WINDOW_MS;
}

export interface ConversationDetailProps {
  conversationId: string;
  currentUser: CurrentUser;
  onBack: () => void;
}

export function ConversationDetail({
  conversationId,
  currentUser,
  onBack,
}: ConversationDetailProps) {
  const conversation = useConversation(conversationId);
  const messages = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const editMessage = useEditMessage(conversationId);
  const deleteMessage = useDeleteMessage(conversationId);
  const markRead = useMarkConversationRead();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markRead.mutate(conversationId);
    // Une seule fois par conversation ouverte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.data?.items.length]);

  if (conversation.isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex-1 space-y-3 p-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-10 w-1/2 self-end" />
          <Skeleton className="h-10 w-3/5" />
        </div>
      </div>
    );
  }

  if (conversation.isError || !conversation.data) {
    const message =
      conversation.error instanceof ApiError
        ? conversation.error.message
        : "Impossible de charger cette conversation.";
    return (
      <ErrorState message={message} onRetry={() => conversation.refetch()} />
    );
  }

  const { title, subtitle, avatarPeople } = getConversationDisplay(
    conversation.data,
    currentUser.id,
  );
  const items = messages.data?.items ?? [];
  const canWrite = currentUser.accountStatus === "active";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <IconButton
          aria-label="Retour aux conversations"
          className="lg:hidden"
          onClick={onBack}
        >
          <ChevronLeft size={18} />
        </IconButton>
        {avatarPeople.length > 1 ? (
          <AvatarGroup max={2}>
            {avatarPeople.map((person) => (
              <Avatar
                key={person.id}
                name={person.displayName ?? person.username}
                src={person.avatar}
              />
            ))}
          </AvatarGroup>
        ) : (
          <Avatar
            name={
              avatarPeople[0]?.displayName ?? avatarPeople[0]?.username ?? title
            }
            src={avatarPeople[0]?.avatar}
          />
        )}
        <div className="min-w-0">
          <p className="truncate text-body-lg font-semibold text-foreground">
            {conversation.data.projectSlug ? (
              <Link
                to={`/projets/${conversation.data.projectSlug}`}
                className="hover:underline"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </p>
          {subtitle && (
            <p className="truncate text-body-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {messages.isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-10 w-1/2 self-end" />
          </div>
        ) : messages.isError ? (
          <ErrorState
            message="Impossible de charger les messages."
            onRetry={() => messages.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Aucun message pour l'instant"
            description="Écris le premier message de cette conversation."
          />
        ) : (
          items.map((message, index) => {
            const previous = items[index - 1];
            const showDateSeparator =
              !previous ||
              new Date(previous.sentAt).toDateString() !==
                new Date(message.sentAt).toDateString();
            const showAuthor =
              !previous || previous.authorId !== message.authorId;
            const isOwn = message.authorId === currentUser.id;
            const editable = isOwn && isWithinEditWindow(message.sentAt);
            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <MessageDateSeparator iso={message.sentAt} />
                )}
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  showAuthor={showAuthor}
                  editable={editable}
                  onEdit={(body) =>
                    editMessage.mutate({ messageId: message.id, body })
                  }
                  onDelete={() => deleteMessage.mutate(message.id)}
                />
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        disabled={!canWrite}
        disabledReason={
          canWrite
            ? undefined
            : "Ton compte est suspendu : tu ne peux plus écrire de messages."
        }
        onSend={(body) => sendMessage.mutate({ body })}
      />
    </div>
  );
}
