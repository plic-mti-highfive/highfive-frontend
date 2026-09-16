import { useState } from "react";
import { X } from "lucide-react";
import type { UserSummary } from "@/domain";
import { useSearch } from "@/api/queries/search";
import { useCreateConversation } from "@/api/queries/conversations";
import {
  Avatar,
  Button,
  Dialog,
  DialogPopup,
  DialogTitle,
  Field,
  Input,
  Textarea,
} from "@shared/ui";

export interface CreateConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  /** Appele avec l'id de la conversation creee, pour y naviguer. */
  onCreated: (conversationId: string) => void;
}

/**
 * Nouvelle conversation : recherche de personnes (R-MSG1/R-MSG2, 1 = direct,
 * 2-49 = groupe une fois soi-meme ajoute), message d'ouverture obligatoire.
 */
export function CreateConversationModal({
  open,
  onOpenChange,
  currentUserId,
  onCreated,
}: CreateConversationModalProps) {
  const [query, setQuery] = useState("");
  const [recipients, setRecipients] = useState<UserSummary[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const search = useSearch({ q: query, types: ["users"] });
  const results = (search.data?.users?.items ?? []).filter(
    (user) =>
      user.id !== currentUserId && !recipients.some((r) => r.id === user.id),
  );

  const createConversation = useCreateConversation();

  function reset() {
    setQuery("");
    setRecipients([]);
    setTitle("");
    setMessage("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (recipients.length === 0 || !message.trim()) return;
    createConversation.mutate(
      {
        participantIds: recipients.map((r) => r.id),
        title: recipients.length > 1 && title.trim() ? title.trim() : undefined,
        message: message.trim(),
      },
      {
        onSuccess: (conversation) => {
          reset();
          onOpenChange(false);
          onCreated(conversation.id);
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
        <DialogTitle>Nouvelle conversation</DialogTitle>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Field label="À">
            {recipients.length > 0 && (
              <div className="mb-1.5 flex flex-wrap gap-1.5">
                {recipients.map((recipient) => (
                  <span
                    key={recipient.id}
                    className="inline-flex items-center gap-1.5 rounded-pill bg-muted px-2 py-1 text-body-sm text-foreground"
                  >
                    {recipient.displayName ?? `@${recipient.username}`}
                    <button
                      type="button"
                      aria-label={`Retirer ${recipient.displayName ?? recipient.username}`}
                      onClick={() =>
                        setRecipients((prev) =>
                          prev.filter((r) => r.id !== recipient.id),
                        )
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher un pseudo…"
              aria-label="Chercher une personne"
            />
            {query.trim() && results.length > 0 && (
              <div className="mt-1.5 flex flex-col gap-0.5 rounded-md border border-border bg-card p-1 shadow-rest">
                {results.slice(0, 6).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setRecipients((prev) => [...prev, user]);
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
          </Field>

          {recipients.length > 1 && (
            <Field label="Nom du groupe" description="Facultatif.">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. Chorale du mardi"
              />
            </Field>
          )}

          <Field label="Message">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écris ton premier message…"
              rows={3}
              required
            />
          </Field>

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
              disabled={
                recipients.length === 0 ||
                !message.trim() ||
                createConversation.isPending
              }
            >
              {createConversation.isPending ? "Envoi…" : "Envoyer"}
            </Button>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
