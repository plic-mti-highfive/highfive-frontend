import { useState } from "react";

import {
  Button,
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  Radio,
  RadioGroup,
  Spinner,
  Textarea,
} from "@shared/ui";
import { ApiError } from "@/api/client";
import { useCreateReport } from "@/api/queries/reports";
import {
  reportReasonSchema,
  type ReportReason,
  type ReportTargetType,
} from "@/domain";
import { REPORT_REASON_LABELS } from "@features/admin/lib/labels";

/**
 * Signalement d'un contenu (R-S1 : motif enumere, precision facultative).
 * Monte a la demande par l'appelant : l'etat du formulaire repart de zero a
 * chaque ouverture. `onSent` est appele une fois le signalement cree.
 */
export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  subject,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ReportTargetType;
  targetId: string;
  /** Ce qui est signale, au demonstratif (« ce commentaire »). */
  subject: string;
  onSent: () => void;
}) {
  const [reason, setReason] = useState<ReportReason | undefined>();
  const [detail, setDetail] = useState("");
  const createReport = useCreateReport();

  function submit() {
    if (!reason) return;
    createReport.mutate(
      {
        targetType,
        targetId,
        reason,
        detail: detail.trim() ? detail.trim() : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSent();
        },
      },
    );
  }

  const error = createReport.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogTitle>Signaler {subject}</DialogTitle>
        <DialogDescription>
          L'équipe de modération examinera ce signalement. La personne concernée
          n'en est pas informée.
        </DialogDescription>

        <RadioGroup
          aria-label="Motif du signalement"
          value={reason ?? ""}
          onValueChange={(value) => setReason(value as ReportReason)}
          className="mt-4"
        >
          {reportReasonSchema.options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-body-md text-foreground has-[[data-checked]]:border-ring"
            >
              <Radio value={option} />
              {REPORT_REASON_LABELS[option]}
            </label>
          ))}
        </RadioGroup>

        <Textarea
          aria-label="Précision (facultative)"
          className="mt-3"
          value={detail}
          maxLength={1000}
          rows={3}
          placeholder="Précise si besoin (facultatif)"
          onChange={(event) => setDetail(event.target.value)}
        />

        {error && (
          <p role="alert" className="mt-3 text-body-sm text-danger-fg">
            {error instanceof ApiError
              ? error.message
              : "Le signalement n'a pas pu être envoyé. Réessaie dans un instant."}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createReport.isPending}
          >
            Annuler
          </Button>
          <Button disabled={!reason || createReport.isPending} onClick={submit}>
            {createReport.isPending && <Spinner size="sm" />}
            Envoyer le signalement
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
