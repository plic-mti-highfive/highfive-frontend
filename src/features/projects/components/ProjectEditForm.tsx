import { useId, useState } from "react";
import { X } from "lucide-react";

import {
  Button,
  Card,
  CardBody,
  Field,
  IconButton,
  Input,
  Textarea,
} from "@shared/ui";
import type { Need, Project } from "@/domain";
import { useUpdateProject } from "@/api/queries/projects";
import { TagPicker } from "./TagPicker";

/**
 * Edition en place (doc 13 E-10 "Interactions") : titre, accroche,
 * description, themes et besoins. Simplifie par rapport au doc (un bouton
 * Enregistrer explicite plutot qu'un autosave toutes les 2 secondes,
 * cf. rapport de mission) — le reste des regles (R-PR1 visibilite/
 * participation) reste sur l'ecran Reglages, hors perimetre de ce lot.
 */
export function ProjectEditForm({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(project.title);
  const [tagline, setTagline] = useState(project.tagline);
  const [description, setDescription] = useState(project.description ?? "");
  const [tags, setTags] = useState<string[]>(project.tags);
  const [needs, setNeeds] = useState<Need[]>(project.needs);
  const [newNeedLabel, setNewNeedLabel] = useState("");
  const updateProject = useUpdateProject(project.slug);
  const titleId = useId();
  const taglineId = useId();
  const descriptionId = useId();

  const canSubmit =
    title.trim().length >= 3 && tagline.trim().length > 0 && tags.length > 0;

  function addNeed() {
    const label = newNeedLabel.trim();
    if (label.length < 3) return;
    setNeeds((current) => [
      ...current,
      { id: crypto.randomUUID(), label, fulfilled: false },
    ]);
    setNewNeedLabel("");
  }

  function handleSubmit() {
    if (!canSubmit) return;
    updateProject.mutate(
      {
        title: title.trim(),
        tagline: tagline.trim(),
        description: description.trim() ? description.trim() : undefined,
        tags,
        needs,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Card>
      <CardBody>
        <Field label="Titre" htmlFor={titleId} required>
          <Input
            id={titleId}
            value={title}
            maxLength={70}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field
          label="Accroche"
          htmlFor={taglineId}
          required
          description={`${tagline.length}/140`}
        >
          <Input
            id={taglineId}
            value={tagline}
            maxLength={140}
            onChange={(e) => setTagline(e.target.value)}
          />
        </Field>
        <Field label="Description" htmlFor={descriptionId}>
          <Textarea
            id={descriptionId}
            value={description}
            maxLength={5000}
            rows={8}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field label="Thèmes" required>
          <TagPicker selected={tags} onChange={setTags} />
        </Field>
        <Field label="Ce que tu cherches" description="Optionnel">
          <ul className="flex flex-col gap-2">
            {needs.map((need) => (
              <li key={need.id} className="flex items-center gap-2">
                <span className="flex-1 text-body-sm text-foreground">
                  {need.label}
                </span>
                <IconButton
                  aria-label="Retirer ce besoin"
                  size="xs"
                  onClick={() =>
                    setNeeds((current) =>
                      current.filter((n) => n.id !== need.id),
                    )
                  }
                >
                  <X size={14} />
                </IconButton>
              </li>
            ))}
          </ul>
          {needs.length < 6 && (
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

        <div className="flex gap-2">
          <Button
            disabled={!canSubmit || updateProject.isPending}
            onClick={handleSubmit}
          >
            Enregistrer
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
