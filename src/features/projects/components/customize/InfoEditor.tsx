import { useState } from "react";
import { Plus, X } from "lucide-react";

import {
  Button,
  Field,
  IconButton,
  Input,
  Section,
  Textarea,
} from "@shared/ui";
import { cn } from "@shared/lib/cn";
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
 * accroche, description, themes et besoins, en blocs titres comme les autres
 * onglets (Images, Sections, Couleurs). Controle par la page, qui
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
    <div className="flex flex-col gap-8">
      <Section title="Présentation">
        <p className="text-body-sm text-muted-foreground">
          Le titre et l'accroche ouvrent la fiche et figurent sur la carte du
          projet.
        </p>
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
      </Section>

      <Section title="Description">
        <p className="text-body-sm text-muted-foreground">
          Affichée dans le bloc « À propos » de la fiche. Facultative.
        </p>
        <Textarea
          aria-label="Description"
          value={value.description}
          maxLength={5000}
          rows={8}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </Section>

      <Section title="Thèmes">
        <p className="text-body-sm text-muted-foreground">
          De 1 à 5 thèmes : ils aident les gens à trouver le projet.
        </p>
        <Field error={issueFor(INFO_FIELD_IDS.tags)}>
          {/* Cible du focus apres un enregistrement refuse (pas de champ unique a focaliser). */}
          <div
            id={INFO_FIELD_IDS.tags}
            role="group"
            aria-label="Thèmes"
            tabIndex={-1}
            className="outline-none"
          >
            <TagPicker
              selected={value.tags}
              onChange={(tags) => onChange({ ...value, tags })}
            />
          </div>
        </Field>
      </Section>

      <Section title="On recherche">
        <p className="text-body-sm text-muted-foreground">
          Les profils que tu cherches, affichés en tête de la fiche. Facultatif,{" "}
          {INFO_NEEDS_MAX} au plus ({value.needs.length}/{INFO_NEEDS_MAX}).
        </p>
        <div className="flex flex-col gap-2">
          {value.needs.length > 0 && (
            <ul className="flex flex-col gap-2">
              {value.needs.map((need) => (
                <li
                  key={need.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-border px-3 py-2",
                    need.fulfilled ? "bg-muted" : "bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "min-w-0 flex-1 break-words text-body-md",
                      need.fulfilled
                        ? "text-muted-foreground line-through"
                        : "font-medium text-foreground",
                    )}
                  >
                    {need.label}
                  </span>
                  <IconButton
                    aria-label={`Retirer « ${need.label} »`}
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
          )}
          {value.needs.length < INFO_NEEDS_MAX && (
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                addNeed();
              }}
            >
              <Input
                value={newNeedLabel}
                maxLength={40}
                aria-label="Nouveau profil recherché"
                placeholder="quelqu'un pour…"
                onChange={(e) => setNewNeedLabel(e.target.value)}
              />
              <Button
                type="submit"
                variant="outline"
                disabled={newNeedLabel.trim().length < INFO_NEED_MIN}
              >
                <Plus aria-hidden="true" />
                Ajouter
              </Button>
            </form>
          )}
        </div>
      </Section>
    </div>
  );
}
