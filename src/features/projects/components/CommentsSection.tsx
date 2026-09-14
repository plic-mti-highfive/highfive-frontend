import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  EmptyState,
  ErrorState,
  Section,
  Skeleton,
  Textarea,
} from "@shared/ui";
import {
  useComments,
  useCreateComment,
  useHideComment,
} from "@/api/queries/comments";
import { CommentItem } from "./CommentItem";

/**
 * Commentaires en bas de l'apercu (mission item 1). R-C1/R-V5 : suivent la
 * visibilite de la fiche (deja gere par le handler). R-C4 : un seul niveau
 * de reponse — les reponses sont groupees sous leur commentaire racine.
 */
export function CommentsSection({
  slug,
  isAuthenticated,
  canModerate,
}: {
  slug: string;
  isAuthenticated: boolean;
  canModerate: boolean;
}) {
  const navigate = useNavigate();
  const [body, setBody] = useState("");
  const commentsQuery = useComments(slug);
  const createComment = useCreateComment(slug);
  const hideComment = useHideComment(slug);

  const comments = commentsQuery.data ?? [];
  const roots = comments.filter((comment) => !comment.parentId);
  const repliesByParent = new Map<string, typeof comments>();
  for (const comment of comments) {
    if (!comment.parentId) continue;
    const list = repliesByParent.get(comment.parentId) ?? [];
    list.push(comment);
    repliesByParent.set(comment.parentId, list);
  }

  function submitRoot() {
    const value = body.trim();
    if (!value) return;
    createComment.mutate({ body: value }, { onSuccess: () => setBody("") });
  }

  return (
    <Section title={`Commentaires (${comments.length})`}>
      {isAuthenticated ? (
        <div className="flex flex-col gap-2">
          <p className="text-body-sm text-muted-foreground">
            Visible par tout le monde
          </p>
          <Textarea
            value={body}
            maxLength={1000}
            rows={3}
            placeholder="Écrire un commentaire…"
            onChange={(event) => setBody(event.target.value)}
          />
          <div>
            <Button
              size="sm"
              disabled={!body.trim() || createComment.isPending}
              onClick={submitRoot}
            >
              Publier
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() =>
            navigate(
              `/connexion?suite=${encodeURIComponent(`/projets/${slug}`)}`,
            )
          }
        >
          Se connecter pour commenter
        </Button>
      )}

      {commentsQuery.isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : commentsQuery.error ? (
        <ErrorState
          message="Les commentaires n'ont pas pu être chargés."
          onRetry={() => commentsQuery.refetch()}
        />
      ) : roots.length === 0 ? (
        <EmptyState title="Personne n'a encore réagi." />
      ) : (
        <ul className="flex flex-col gap-5">
          {roots.map((comment) => (
            <li key={comment.id} className="flex flex-col gap-3">
              <CommentItem
                comment={comment}
                canReply={isAuthenticated}
                canModerate={canModerate}
                onReply={(replyBody) =>
                  createComment.mutate({
                    body: replyBody,
                    parentId: comment.id,
                  })
                }
                onHide={
                  canModerate ? () => hideComment.mutate(comment.id) : undefined
                }
                isSubmittingReply={createComment.isPending}
              />
              {(repliesByParent.get(comment.id) ?? []).map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply
                  canReply={false}
                  canModerate={canModerate}
                  onHide={
                    canModerate ? () => hideComment.mutate(reply.id) : undefined
                  }
                />
              ))}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
