import { useState } from "react";

import { Avatar, Button, IconButton, Textarea } from "@shared/ui";
import { EyeOff } from "lucide-react";
import { formatExactDateTime, formatRelativeDate } from "@shared/lib/dates";
import type { CommentWithAuthor } from "@/api/comments";

/**
 * Un commentaire (racine ou reponse, R-C4 : un seul niveau — pas de bouton
 * "Repondre" sur une reponse). `onHide` absent (plutot que desactive,
 * R-IMP2) quand `canModerate` est faux.
 */
export function CommentItem({
  comment,
  isReply = false,
  canReply,
  canModerate,
  onReply,
  onHide,
  isSubmittingReply,
}: {
  comment: CommentWithAuthor;
  isReply?: boolean;
  canReply: boolean;
  canModerate: boolean;
  onReply?: (body: string) => void;
  onHide?: () => void;
  isSubmittingReply?: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const [body, setBody] = useState("");

  return (
    <div className={isReply ? "ml-10" : ""}>
      <div className="flex gap-3">
        <Avatar
          name={comment.author.displayName ?? comment.author.username}
          src={comment.author.avatar}
          size="sm"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-body-sm font-semibold text-foreground">
              @{comment.author.username}
            </span>
            <time
              dateTime={comment.publishedAt}
              title={formatExactDateTime(comment.publishedAt)}
              className="text-body-sm text-muted-foreground"
            >
              {formatRelativeDate(comment.publishedAt)}
            </time>
          </div>
          <p className="mt-0.5 whitespace-pre-wrap text-body-md text-foreground">
            {comment.body}
          </p>
          <div className="mt-1 flex items-center gap-3">
            {canReply && !isReply && (
              <button
                type="button"
                onClick={() => setReplying((value) => !value)}
                className="text-body-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Répondre
              </button>
            )}
            {canModerate && onHide && (
              <IconButton
                aria-label="Masquer ce commentaire"
                size="xs"
                onClick={onHide}
              >
                <EyeOff size={14} />
              </IconButton>
            )}
          </div>

          {replying && (
            <div className="mt-2 flex flex-col gap-2">
              <Textarea
                value={body}
                maxLength={1000}
                rows={2}
                placeholder="Ta réponse…"
                onChange={(event) => setBody(event.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={!body.trim() || isSubmittingReply}
                  onClick={() => {
                    onReply?.(body.trim());
                    setBody("");
                    setReplying(false);
                  }}
                >
                  Répondre
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplying(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
