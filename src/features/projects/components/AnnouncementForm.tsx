import { useId, useState } from "react";

import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Field,
  Input,
  Textarea,
} from "@shared/ui";
import type { AnnouncementCreateInput } from "@/domain";

/**
 * Panneau "Écrire une annonce" (doc 13 E-11), reserve porteur/co-porteur
 * (R-A1, verifie par l'appelant). La phrase de portee reprend le nombre
 * de membres — le nombre de highfivers n'est pas expose par ce composant
 * (pas de requete supplementaire pour un texte secondaire).
 */
export function AnnouncementForm({
  membersCount,
  onSubmit,
  isSubmitting,
}: {
  membersCount: number;
  onSubmit: (input: AnnouncementCreateInput) => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const titleId = useId();
  const bodyId = useId();
  const pinId = useId();

  const canSubmit = title.trim().length >= 3 && body.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), body: body.trim(), pinned });
    setTitle("");
    setBody("");
    setPinned(false);
  }

  return (
    <Card>
      <CardBody>
        <Field label="Titre" htmlFor={titleId} required>
          <Input
            id={titleId}
            value={title}
            maxLength={80}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field label="Message" htmlFor={bodyId} required>
          <Textarea
            id={bodyId}
            value={body}
            maxLength={2000}
            rows={4}
            onChange={(event) => setBody(event.target.value)}
          />
        </Field>
        <label
          htmlFor={pinId}
          className="flex items-center gap-2 text-body-sm text-foreground"
        >
          <Checkbox id={pinId} checked={pinned} onCheckedChange={setPinned} />
          Épingler
        </label>
        <p className="text-body-sm text-muted-foreground">
          Les {membersCount} membres de l'équipe recevront une notification.
        </p>
        <div>
          <Button disabled={!canSubmit || isSubmitting} onClick={handleSubmit}>
            Publier l'annonce
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
