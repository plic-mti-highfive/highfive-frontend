import { useState } from "react";
import type { UserSummary } from "@/domain";
import { ApiError } from "@/api/client";
import { useCreateConversation } from "@/api/queries/conversations";
import {
  Button,
  Dialog,
  DialogPopup,
  DialogTitle,
  Field,
  Input,
  Textarea,
} from "@shared/ui";
import { PeoplePicker } from "./PeoplePicker";

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
  const [recipients, setRecipients] = useState<UserSummary[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const createConversation = useCreateConversation();

  function reset() {
    setRecipients([]);
    setTitle("");
    setMessage("");
    createConversation.reset();
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
            <PeoplePicker
              selected={recipients}
              onChange={setRecipients}
              excludeIds={[currentUserId]}
            />
          </Field>

          {recipients.length > 1 && (
            <Field label="Nom du groupe" description="Facultatif.">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                placeholder="Ex. Chorale du mardi"
              />
            </Field>
          )}

          <Field label="Message">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={4000}
              placeholder="Écris ton premier message…"
              rows={3}
              required
            />
          </Field>

          {createConversation.error && (
            <p role="alert" className="text-body-sm text-destructive">
              {createConversation.error instanceof ApiError
                ? createConversation.error.message
                : "La conversation n'a pas pu être créée."}
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
