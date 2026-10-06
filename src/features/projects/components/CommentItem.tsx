import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";

import {
  Avatar,
  Button,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuTrigger,
  IconButton,
  Textarea,
} from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { formatExactDateTime, formatRelativeDate } from "@shared/lib/dates";
import { ConfirmActionDialog } from "@features/admin/components/ConfirmActionDialog";
import type { CommentWithAuthor } from "@/api/comments";
import { commentAnchor } from "../lib/commentAnchor";
import { ReportDialog } from "./ReportDialog";

const MENTION = /^@([A-Za-z0-9._-]+)/;
const FEEDBACK_MS = 2500;

/**
 * Corps du commentaire. Une reponse a une reponse commence par `@pseudo` (un
 * seul niveau d'imbrication, R-C4) : la mention est rendue en lien, pour que
 * l'on voie a qui chaque reponse s'adresse.
 */
function CommentBody({ body }: { body: string }): ReactNode {
  const match = MENTION.exec(body);
  if (!match) return body;
  return (
    <>
      <Link
        to={`/u/${match[1]}`}
        className="font-medium text-[var(--accent-dark,var(--primary))] hover:underline"
      >
        @{match[1]}
      </Link>
      {body.slice(match[0].length)}
    </>
  );
}

type Feedback = "copied" | "reported" | null;

/**
 * Un commentaire (racine ou reponse). Les actions sont dans le menu ⋮ : copier
 * le lien (tout le monde), signaler (personne connectee, pas ses propres
 * commentaires), masquer (porteur+, R-C3, avec confirmation). `onHide` absent
 * (plutot que desactive, R-IMP2) sans droit de moderation. Repondre a une
 * reponse reste a un seul niveau : le parent decide du `parentId`, ici on
 * prefixe seulement la mention.
 */
export function CommentItem({
  comment,
  isReply = false,
  highlighted = false,
  canReply,
  canReport,
  onReply,
  onHide,
  isSubmittingReply,
}: {
  comment: CommentWithAuthor;
  isReply?: boolean;
  /** Cible du lien `#comment-…` ouvert : defile jusqu'ici et met en evidence. */
  highlighted?: boolean;
  canReply: boolean;
  /** Personne connectee et commentaire d'une autre personne. */
  canReport: boolean;
  onReply?: (body: string) => void;
  onHide?: () => void;
  isSubmittingReply?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [replying, setReplying] = useState(false);
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [hideOpen, setHideOpen] = useState(false);
  const username = comment.author.username;

  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView?.({ block: "center" });
  }, [highlighted]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [feedback]);

  async function copyLink() {
    const { origin, pathname, search } = window.location;
    try {
      await navigator.clipboard.writeText(
        `${origin}${pathname}${search}#${commentAnchor(comment.id)}`,
      );
      setFeedback("copied");
    } catch {
      // Presse-papiers indisponible (permissions, contexte non securise) :
      // pas de repli invente, l'action reste silencieuse.
    }
  }

  function openReply() {
    // Repondre a une reponse : la mention dit a qui l'on s'adresse.
    if (!replying && isReply && !body) setBody(`@${username} `);
    setReplying((value) => !value);
  }

  return (
    <article
      ref={ref}
      id={commentAnchor(comment.id)}
      aria-label={`Commentaire de @${username}`}
      className={cn(
        "flex scroll-mt-24 gap-3 rounded-lg",
        highlighted && "bg-muted p-2 -m-2",
      )}
    >
      <Avatar
        name={comment.author.displayName ?? username}
        src={comment.author.avatar}
        size={isReply ? "sm" : "md"}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
            <Link
              to={`/u/${username}`}
              className="text-body-sm font-semibold text-foreground hover:underline"
            >
              @{username}
            </Link>
            <time
              dateTime={comment.publishedAt}
              title={formatExactDateTime(comment.publishedAt)}
              className="text-body-sm text-muted-foreground"
            >
              {formatRelativeDate(comment.publishedAt)}
            </time>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <IconButton
                  aria-label={`Actions sur le commentaire de @${username}`}
                  size="xs"
                  className="-mt-0.5 shrink-0"
                />
              }
            >
              <MoreVertical size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuPositioner>
                <DropdownMenuPopup>
                  <DropdownMenuItem onClick={() => void copyLink()}>
                    Copier le lien
                  </DropdownMenuItem>
                  {canReport && (
                    <DropdownMenuItem onClick={() => setReportOpen(true)}>
                      Signaler
                    </DropdownMenuItem>
                  )}
                  {onHide && (
                    <DropdownMenuItem
                      className="text-destructive data-[highlighted]:bg-destructive/10"
                      onClick={() => setHideOpen(true)}
                    >
                      Masquer le commentaire
                    </DropdownMenuItem>
                  )}
                </DropdownMenuPopup>
              </DropdownMenuPositioner>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>

        <p className="mt-0.5 whitespace-pre-wrap break-words text-body-md text-foreground">
          <CommentBody body={comment.body} />
        </p>

        <div className="mt-1 flex items-center gap-3">
          {canReply && (
            <button
              type="button"
              onClick={openReply}
              className="text-body-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Répondre
            </button>
          )}
          <span role="status" className="text-body-sm text-muted-foreground">
            {feedback === "copied" && "Lien copié"}
            {feedback === "reported" && "Signalement envoyé"}
          </span>
        </div>

        {replying && (
          <div className="mt-2 flex flex-col gap-2">
            <Textarea
              autoFocus
              aria-label={`Répondre à @${username}`}
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

      {reportOpen && (
        <ReportDialog
          open
          onOpenChange={setReportOpen}
          targetType="comment"
          targetId={comment.id}
          subject="ce commentaire"
          onSent={() => setFeedback("reported")}
        />
      )}
      {onHide && (
        <ConfirmActionDialog
          open={hideOpen}
          onOpenChange={setHideOpen}
          title="Masquer ce commentaire ?"
          description="Il ne sera plus visible sur la fiche, ni ses réponses éventuelles."
          confirmLabel="Masquer"
          destructive
          onConfirm={() => {
            setHideOpen(false);
            onHide();
          }}
        />
      )}
    </article>
  );
}
