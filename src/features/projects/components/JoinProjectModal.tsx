import { useId, useState } from "react";

import {
  Button,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  Field,
  Textarea,
} from "@shared/ui";

/**
 * Demande de rejoindre avec message optionnel (mission item 4 :
 * "JoinProjectModal reecrit sur Dialog"). Utilise quand la participation du
 * projet est `on_request` (R-D... doc 05) : le porteur/co-porteur decide au
 * cas par cas, un mot d'explication aide sa decision.
 */
export function JoinProjectModal({
  open,
  onOpenChange,
  projectTitle,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  onSubmit: (message: string | undefined) => void;
  isSubmitting: boolean;
}) {
  const [message, setMessage] = useState("");
  const fieldId = useId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogTitle>Demander à rejoindre</DialogTitle>
        <DialogDescription>
          « {projectTitle} » accepte les demandes au cas par cas. Un mot
          d'explication aide le porteur à décider.
        </DialogDescription>

        <Field
          label="Message"
          htmlFor={fieldId}
          description="Optionnel"
          className="mt-4"
        >
          <Textarea
            id={fieldId}
            value={message}
            maxLength={300}
            rows={4}
            placeholder="Pourquoi tu veux rejoindre ce projet…"
            onChange={(event) => setMessage(event.target.value)}
          />
        </Field>

        <div className="mt-5 flex justify-end gap-2">
          <DialogClose render={<Button variant="outline">Annuler</Button>} />
          <Button
            disabled={isSubmitting}
            onClick={() =>
              onSubmit(message.trim() ? message.trim() : undefined)
            }
          >
            Envoyer la demande
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
