import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, MessageSquare, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import type { CurrentUser, MessageAttachment } from "@/domain";
import { ApiError } from "@/api/client";
import {
  useConversation,
  useDeleteMessage,
  useEditMessage,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
  useUploadMessageAttachment,
} from "@/api/queries/conversations";
import {
  Avatar,
  AvatarGroup,
  Button,
  EmptyState,
  ErrorState,
  IconButton,
  Skeleton,
  Spinner,
} from "@shared/ui";
import { getConversationDisplay } from "../lib/conversationDisplay";
import { GroupSettingsDialog } from "./GroupSettingsDialog";
import { MessageBubble } from "./MessageBubble";
import { MessageDateSeparator } from "./MessageDateSeparator";
import { MessageInput, type MessageDraft } from "./MessageInput";

export interface ConversationDetailProps {
  conversationId: string;
  currentUser: CurrentUser;
  onBack: () => void;
  /** Appele quand la personne quitte le groupe ouvert. */
  onLeft: () => void;
}

/** Distance au bas du fil sous laquelle un nouveau message fait defiler. */
const STICK_TO_BOTTOM_PX = 120;

export function ConversationDetail({
  conversationId,
  currentUser,
  onBack,
  onLeft,
}: ConversationDetailProps) {
  const conversation = useConversation(conversationId);
  const messages = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const uploadAttachment = useUploadMessageAttachment(conversationId);
  const editMessage = useEditMessage(conversationId);
  const deleteMessage = useDeleteMessage(conversationId);
  const markRead = useMarkConversationRead();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  /** Hauteur du fil avant le chargement d'une page plus ancienne. */
  const prependAnchorRef = useRef<{ height: number; top: number } | null>(null);
  const lastMarkedRef = useRef<string | null>(null);

  // Pages les plus recentes d'abord, chacune chronologique.
  const items = [...(messages.data?.pages ?? [])]
    .reverse()
    .flatMap((page) => page.items);
  const newestId = items.at(-1)?.id;
  const newestAuthorId = items.at(-1)?.authorId;
  const oldestId = items[0]?.id;

  // Ouvrir la conversation, puis chaque message recu pendant qu'elle est
  // affichee, vaut lecture (eteint aussi ses notifications cote serveur).
  useEffect(() => {
    if (!newestId || lastMarkedRef.current === newestId) return;
    const isFirst = lastMarkedRef.current === null;
    lastMarkedRef.current = newestId;
    if (isFirst || newestAuthorId !== currentUser.id) {
      markRead.mutate(conversationId);
    }
    // markRead change a chaque rendu ; seul le dernier message compte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, newestId, newestAuthorId, currentUser.id]);

  // Une page plus ancienne arrive en haut : garder sous les yeux le meme message.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const anchor = prependAnchorRef.current;
    if (!el || !anchor) return;
    el.scrollTop = el.scrollHeight - anchor.height + anchor.top;
    prependAnchorRef.current = null;
  }, [oldestId]);

  // Un nouveau message en bas : suivre si l'on y etait, ou si c'est le sien.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !newestId) return;
    if (nearBottomRef.current || newestAuthorId === currentUser.id) {
      el.scrollTop = el.scrollHeight;
    }
  }, [newestId, newestAuthorId, currentUser.id]);

  function loadOlder() {
    const el = scrollRef.current;
    if (el) {
      prependAnchorRef.current = { height: el.scrollHeight, top: el.scrollTop };
    }
    void messages.fetchNextPage();
  }

  async function handleSend({ body, file }: MessageDraft) {
    let attachment: MessageAttachment | undefined;
    if (file) {
      const upload = await uploadAttachment.mutateAsync(file);
      attachment = { kind: "upload", uploadId: upload.id };
    }
    await sendMessage.mutateAsync({ body: body || undefined, attachment });
  }

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
  const canWrite = currentUser.accountStatus === "active";
  const actionError = editMessage.error ?? deleteMessage.error;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 items-center gap-2 border-b border-border px-3 py-2.5">
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
        <div className="min-w-0 flex-1">
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
        {conversation.data.type === "group" && (
          <IconButton
            aria-label="Paramètres du groupe"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={18} />
          </IconButton>
        )}
      </div>

      <div
        ref={scrollRef}
        className="min-w-0 flex-1 overflow-y-auto py-2"
        onScroll={(e) => {
          const el = e.currentTarget;
          nearBottomRef.current =
            el.scrollHeight - el.scrollTop - el.clientHeight <
            STICK_TO_BOTTOM_PX;
        }}
      >
        {messages.isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-10 w-1/2 self-end" />
          </div>
        ) : messages.isError && !messages.data ? (
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
          <>
            {messages.hasNextPage && (
              <div className="flex justify-center py-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loadOlder}
                  disabled={messages.isFetchingNextPage}
                >
                  {messages.isFetchingNextPage && <Spinner size="sm" />}
                  Messages précédents
                </Button>
              </div>
            )}
            {items.map((message, index) => {
              const previous = items[index - 1];
              const showDateSeparator =
                !previous ||
                new Date(previous.sentAt).toDateString() !==
                  new Date(message.sentAt).toDateString();
              const showAuthor =
                !previous || previous.authorId !== message.authorId;
              const isOwn = message.authorId === currentUser.id;
              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <MessageDateSeparator iso={message.sentAt} />
                  )}
                  <MessageBubble
                    message={message}
                    isOwn={isOwn}
                    showAuthor={showAuthor}
                    canEdit={canWrite}
                    onEdit={(body) =>
                      editMessage.mutate({ messageId: message.id, body })
                    }
                    onDelete={() => deleteMessage.mutate(message.id)}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>

      {actionError && (
        <p role="alert" className="px-4 pb-1 text-body-sm text-destructive">
          {actionError instanceof ApiError
            ? actionError.message
            : "L'action sur ce message a échoué."}
        </p>
      )}

      <MessageInput
        disabled={!canWrite}
        disabledReason={
          canWrite
            ? undefined
            : "Ton compte est suspendu : tu ne peux plus écrire de messages."
        }
        onSend={handleSend}
      />

      {settingsOpen && (
        <GroupSettingsDialog
          open
          onOpenChange={setSettingsOpen}
          conversation={conversation.data}
          currentUser={currentUser}
          onLeft={onLeft}
        />
      )}
    </div>
  );
}
