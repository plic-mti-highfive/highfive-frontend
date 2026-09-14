import { useState } from "react";
import { X } from "lucide-react";
import type { MembershipRole, UserSummary } from "@/domain";
import { useSearch } from "@/api/queries/search";
import { useCreateInvitation } from "@/api/queries/memberships";
import {
  Avatar,
  Button,
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  Field,
  Input,
  Textarea,
} from "@shared/ui";

/** Rôles proposables par invitation (R-I2) : jamais `owner`, il y en a exactement un (R-M1). */
type InvitableRole = Exclude<MembershipRole, "owner">;

export interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
}

/**
 * Bouton "Inviter" de la coquille atelier (doc 06 §4, réservé
 * porteur/co-porteur — vérifié par l'appelant). R-I3 (personne bloquée) est
 * vérifié côté handler ; l'échec remonte comme un message d'erreur simple.
 */
export function InviteMemberDialog({
  open,
  onOpenChange,
  slug,
}: InviteMemberDialogProps) {
  const [query, setQuery] = useState("");
  const [recipient, setRecipient] = useState<UserSummary | null>(null);
  const [role, setRole] = useState<InvitableRole>("member");
  const [message, setMessage] = useState("");

  const search = useSearch({ q: query, types: ["users"] });
  const results = (search.data?.users?.items ?? []).filter(
    (user) => user.id !== recipient?.id,
  );

  const createInvitation = useCreateInvitation(slug);

  function reset() {
    setQuery("");
    setRecipient(null);
    setRole("member");
    setMessage("");
    createInvitation.reset();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipient) return;
    createInvitation.mutate(
      {
        recipientId: recipient.id,
        proposedRole: role,
        message: message.trim() || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogPopup>
        <DialogTitle>Inviter dans le projet</DialogTitle>
        <DialogDescription>
          Choisis une personne et le rôle que tu lui proposes.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Field label="Personne">
            {recipient ? (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-2.5 py-1.5">
                <Avatar
                  name={recipient.displayName ?? recipient.username}
                  src={recipient.avatar}
                  size="sm"
                />
                <span className="flex-1 text-body-md text-foreground">
                  {recipient.displayName ?? `@${recipient.username}`}
                </span>
                <button
                  type="button"
                  aria-label="Changer de personne"
                  onClick={() => setRecipient(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Chercher un pseudo…"
                  aria-label="Chercher une personne"
                  autoFocus
                />
                {query.trim() && results.length > 0 && (
                  <div className="mt-1.5 flex flex-col gap-0.5 rounded-md border border-border bg-card p-1 shadow-rest">
                    {results.slice(0, 6).map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setRecipient(user);
                          setQuery("");
                        }}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted"
                      >
                        <Avatar
                          name={user.displayName ?? user.username}
                          src={user.avatar}
                          size="sm"
                        />
                        <span className="text-body-md text-foreground">
                          {user.displayName ?? `@${user.username}`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </Field>

          <Field label="Rôle proposé">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={role === "member" ? "default" : "outline"}
                size="sm"
                onClick={() => setRole("member")}
              >
                Membre
              </Button>
              <Button
                type="button"
                variant={role === "co_owner" ? "default" : "outline"}
                size="sm"
                onClick={() => setRole("co_owner")}
              >
                Co-porteur
              </Button>
            </div>
          </Field>

          <Field label="Message" description="Facultatif.">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Pourquoi tu l'invites…"
              rows={2}
            />
          </Field>

          {createInvitation.isError && (
            <p className="text-body-sm text-danger-fg" role="alert">
              L'invitation n'a pas pu être envoyée. Réessaie.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!recipient || createInvitation.isPending}
            >
              {createInvitation.isPending ? "Envoi…" : "Envoyer l'invitation"}
            </Button>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
