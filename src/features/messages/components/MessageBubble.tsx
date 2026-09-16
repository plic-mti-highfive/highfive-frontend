import { useState } from "react";
import { Menu } from "@base-ui/react/menu";
import { MoreHorizontal, Paperclip } from "lucide-react";
import { Link } from "react-router-dom";
import type { MessageWithAuthor } from "@/domain";
import { Avatar, Button, Textarea } from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { formatExactDateTime, formatTime } from "@shared/lib/dates";

export interface MessageBubbleProps {
  message: MessageWithAuthor;
  isOwn: boolean;
  showAuthor: boolean;
  /** R-MSG5 : fenetre de 15 minutes ecoulee ou non, verifiee cote handler. */
  editable: boolean;
  onEdit: (body: string) => void;
  onDelete: () => void;
}

function AttachmentPreview({
  attachment,
}: {
  attachment: NonNullable<MessageWithAuthor["attachmentPreview"]>;
}) {
  if (attachment.kind === "project") {
    return (
      <Link
        to={`/projets/${attachment.projectSlug}`}
        className="mt-1.5 flex flex-col gap-0.5 rounded-md border border-border bg-card px-3 py-2 hover:bg-muted"
      >
        <span className="text-body-md font-semibold text-foreground">
          {attachment.projectTitle}
        </span>
        <span className="truncate text-body-sm text-muted-foreground">
          {attachment.projectTagline}
        </span>
      </Link>
    );
  }
  return (
    <span className="mt-1.5 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-body-sm text-foreground">
      <Paperclip size={14} className="shrink-0 text-muted-foreground" />
      <span className="truncate">{attachment.fileName}</span>
    </span>
  );
}

export function MessageBubble({
  message,
  isOwn,
  showAuthor,
  editable,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);

  if (message.deleted) {
    return (
      <div
        className={cn(
          "flex px-4 py-1",
          isOwn ? "justify-end" : "justify-start",
        )}
      >
        <p className="text-body-sm italic text-muted-foreground">
          Message supprimé
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-end gap-2 px-4 py-1",
        isOwn ? "justify-end" : "justify-start",
      )}
    >
      {!isOwn && (
        <Avatar
          name={message.author.displayName ?? message.author.username}
          src={message.author.avatar}
          size="sm"
          className={showAuthor ? "" : "invisible"}
        />
      )}
      <div
        className={cn(
          "flex max-w-md flex-col gap-1",
          isOwn ? "items-end" : "items-start",
        )}
      >
        {showAuthor && !isOwn && (
          <span className="px-1 text-body-sm font-medium text-muted-foreground">
            {message.author.displayName ?? `@${message.author.username}`}
          </span>
        )}
        {editing ? (
          <div className="flex w-full flex-col gap-1.5">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraft(message.body);
                  setEditing(false);
                }}
              >
                Annuler
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (draft.trim() && draft.trim() !== message.body) {
                    onEdit(draft.trim());
                  }
                  setEditing(false);
                }}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "flex items-end gap-1.5 rounded-lg px-3 py-2",
              isOwn
                ? "rounded-br-sm bg-primary text-primary-foreground"
                : "rounded-bl-sm bg-muted text-foreground",
            )}
          >
            <div className="min-w-0">
              <p className="whitespace-pre-wrap break-words text-body-md">
                {message.body}
              </p>
              {message.attachmentPreview && (
                <AttachmentPreview attachment={message.attachmentPreview} />
              )}
            </div>
            {isOwn && editable && (
              <Menu.Root>
                <Menu.Trigger
                  aria-label="Actions sur le message"
                  className="shrink-0 rounded-full p-1 opacity-0 outline-none transition-opacity hover:bg-black/10 group-hover:opacity-100"
                >
                  <MoreHorizontal size={14} />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner side="top" align="end" sideOffset={4}>
                    <Menu.Popup className="min-w-32 rounded-md border border-border bg-card py-1 shadow-overlay">
                      <Menu.Item
                        className="cursor-pointer px-3 py-1.5 text-body-sm text-foreground outline-none hover:bg-muted"
                        onClick={() => setEditing(true)}
                      >
                        Modifier
                      </Menu.Item>
                      <Menu.Item
                        className="cursor-pointer px-3 py-1.5 text-body-sm text-danger-fg outline-none hover:bg-danger-bg"
                        onClick={onDelete}
                      >
                        Supprimer
                      </Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            )}
          </div>
        )}
        <span
          className="px-1 text-body-sm text-muted-foreground"
          title={formatExactDateTime(message.sentAt)}
        >
          {formatTime(message.sentAt)}
          {message.editedAt && " · modifié"}
        </span>
      </div>
    </div>
  );
}
