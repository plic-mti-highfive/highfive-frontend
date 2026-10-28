import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { UserSummary } from "@/domain";
import { useCreateConversation } from "@/api/queries/conversations";
import { ApiError } from "@/api/client";
import {
  Avatar,
  Button,
  Dialog,
  DialogPopup,
  DialogTitle,
  Field,
  Textarea,
} from "@shared/ui";

/**
 * Message direct a une personne deja choisie (menu d'un membre, etc.) : un
 * destinataire fige et le message d'ouverture, sans la recherche de
 * `CreateConversationModal`. En cas de succes, ouvre la conversation creee.
 */
export function SendMessageDialog({
  open,
  onOpenChange,
  recipient,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient: UserSummary;
}) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const createConversation = useCreateConversation();
  const name = recipient.displayName ?? recipient.username;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setMessage("");
      createConversation.reset();
    }
    onOpenChange(next);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    createConversation.mutate(
      { participantIds: [recipient.id], message: message.trim() },
      {
        onSuccess: (conversation) => {
          handleOpenChange(false);
          navigate(`/messages/${conversation.id}`);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup>
        <DialogTitle>Envoyer un message</DialogTitle>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-body-md text-foreground">
            <Avatar name={name} src={recipient.avatar} size="md" />
            <span className="font-medium">{name}</span>
            <span className="text-body-sm text-muted-foreground">
              @{recipient.username}
            </span>
          </div>

          <Field label="Message">
            <Textarea
              autoFocus
              value={message}
              maxLength={4000}
              rows={4}
              placeholder="Écris ton message…"
              onChange={(event) => setMessage(event.target.value)}
            />
          </Field>

          {createConversation.error && (
            <p role="alert" className="text-body-sm text-destructive">
              {createConversation.error instanceof ApiError
                ? createConversation.error.message
                : "Le message n'a pas pu être envoyé."}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!message.trim() || createConversation.isPending}
            >
              {createConversation.isPending ? "Envoi…" : "Envoyer"}
            </Button>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
