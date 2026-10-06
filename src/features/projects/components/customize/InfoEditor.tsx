import { useState } from "react";
import { X } from "lucide-react";

import { Button, Field, IconButton, Input, Textarea } from "@shared/ui";
import {
  INFO_FIELD_IDS,
  INFO_NEED_MIN,
  INFO_NEEDS_MAX,
  getInfoIssues,
  type ProjectInfoDraft,
} from "../../lib/projectInfo";
import { TagPicker } from "../TagPicker";

/**
 * Onglet Infos de l'editeur de la fiche (doc 13 E-10 "Interactions") : titre,
 * accroche, description, themes et besoins. Controle par la page, qui
 * enregistre avec le reste ; `showIssues` affiche les champs a corriger apres
 * une tentative d'enregistrement. Visibilite et participation (R-PR1) restent
 * sur l'ecran Reglages.
 */
export function InfoEditor({
  value,
  onChange,
  showIssues,
}: {
  value: ProjectInfoDraft;
  onChange: (next: ProjectInfoDraft) => void;
  showIssues: boolean;
}) {
  const [newNeedLabel, setNewNeedLabel] = useState("");
  const issues = showIssues ? getInfoIssues(value) : [];
  const issueFor = (inputId: string) =>
    issues.find((issue) => issue.inputId === inputId)?.message;

  function addNeed() {
    const label = newNeedLabel.trim();
    if (label.length < INFO_NEED_MIN) return;
    onChange({
      ...value,
      needs: [
        ...value.needs,
        { id: crypto.randomUUID(), label, fulfilled: false },
      ],
    });
    setNewNeedLabel("");
  }

  return (
    <div className="flex flex-col gap-4">
      <Field
        label="Titre"
        htmlFor={INFO_FIELD_IDS.title}
        required
        error={issueFor(INFO_FIELD_IDS.title)}
      >
        <Input
          id={INFO_FIELD_IDS.title}
          value={value.title}
          maxLength={70}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </Field>
      <Field
        label="Accroche"
        htmlFor={INFO_FIELD_IDS.tagline}
        required
        description={`${value.tagline.length}/140`}
        error={issueFor(INFO_FIELD_IDS.tagline)}
      >
        <Input
          id={INFO_FIELD_IDS.tagline}
          value={value.tagline}
          maxLength={140}
          onChange={(e) => onChange({ ...value, tagline: e.target.value })}
        />
      </Field>
      <Field label="Description" htmlFor="edit-info-description">
        <Textarea
          id="edit-info-description"
          value={value.description}
          maxLength={5000}
          rows={8}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </Field>
      <Field label="Thèmes" required error={issueFor(INFO_FIELD_IDS.tags)}>
        {/* Cible du focus apres un enregistrement refuse (pas de champ unique a focaliser). */}
        <div id={INFO_FIELD_IDS.tags} tabIndex={-1} className="outline-none">
          <TagPicker
            selected={value.tags}
            onChange={(tags) => onChange({ ...value, tags })}
          />
        </div>
      </Field>
      <Field label="Ce que tu cherches" description="Optionnel">
        <ul className="flex flex-col gap-2">
          {value.needs.map((need) => (
            <li key={need.id} className="flex items-center gap-2">
              <span className="flex-1 text-body-sm text-foreground">
                {need.label}
              </span>
              <IconButton
                aria-label="Retirer ce besoin"
                size="xs"
                onClick={() =>
                  onChange({
                    ...value,
                    needs: value.needs.filter((n) => n.id !== need.id),
                  })
                }
              >
                <X size={14} />
              </IconButton>
            </li>
          ))}
        </ul>
        {value.needs.length < INFO_NEEDS_MAX && (
          <div className="mt-2 flex gap-2">
            <Input
              value={newNeedLabel}
              maxLength={40}
              placeholder="quelqu'un pour…"
              onChange={(e) => setNewNeedLabel(e.target.value)}
            />
            <Button variant="outline" onClick={addNeed}>
              Ajouter
            </Button>
          </div>
        )}
      </Field>
    </div>
  );
}
