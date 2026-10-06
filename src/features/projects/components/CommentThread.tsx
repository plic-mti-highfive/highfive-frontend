import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@shared/lib/cn";
import type { CommentWithAuthor } from "@/api/comments";
import { CommentItem } from "./CommentItem";

/**
 * Un commentaire racine et ses reponses (R-C4 : un seul niveau). Les reponses
 * sont repliees derriere un compteur, comme sur YouTube, et rangees sous un
 * filet vertical qui les rattache au commentaire. Elles s'ouvrent d'elles
 * memes quand on repond ou que le lien ouvert en cible une.
 */
export function CommentThread({
  root,
  replies,
  currentUserId,
  canReply,
  canModerate,
  targetId,
  onReply,
  onHide,
  isSubmittingReply,
}: {
  root: CommentWithAuthor;
  replies: CommentWithAuthor[];
  /** Personne connectee, pour ne pas lui proposer de signaler ses propres commentaires. */
  currentUserId?: string;
  canReply: boolean;
  canModerate: boolean;
  /** Id du commentaire vise par `#comment-…`, s'il y en a un. */
  targetId?: string;
  onReply: (parentId: string, body: string) => void;
  onHide: (commentId: string) => void;
  isSubmittingReply: boolean;
}) {
  const [expanded, setExpanded] = useState(() =>
    replies.some((reply) => reply.id === targetId),
  );

  function itemProps(comment: CommentWithAuthor) {
    return {
      comment,
      highlighted: comment.id === targetId,
      canReply,
      canReport: Boolean(currentUserId) && comment.authorId !== currentUserId,
      onHide: canModerate ? () => onHide(comment.id) : undefined,
      isSubmittingReply,
    };
  }

  return (
    <div className="flex flex-col gap-2">
      <CommentItem
        {...itemProps(root)}
        onReply={(body) => {
          onReply(root.id, body);
          setExpanded(true);
        }}
      />

      {replies.length > 0 && (
        // Aligne sur le texte du commentaire (avatar `md` + espacement).
        <div className="ml-11 flex flex-col gap-3">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
            className="-ml-2 flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-body-sm font-semibold text-[var(--accent-dark,var(--primary))] hover:bg-muted"
          >
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-4 transition-transform",
                expanded && "rotate-180",
              )}
            />
            {replies.length} {replies.length === 1 ? "réponse" : "réponses"}
          </button>
          {expanded && (
            <ul className="flex flex-col gap-4 border-l-2 border-border pl-4">
              {replies.map((reply) => (
                <li key={reply.id}>
                  <CommentItem
                    {...itemProps(reply)}
                    isReply
                    // Un seul niveau : repondre a une reponse repond au
                    // commentaire racine, la mention dit a qui.
                    onReply={(body) => {
                      onReply(root.id, body);
                      setExpanded(true);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
