import { useId, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import {
  Button,
  Field,
  IconButton,
  Input,
  PageHeader,
  Radio,
  RadioGroup,
  Section,
} from "@shared/ui";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";
import { useCreateProject } from "@/api/queries/projects";
import { queryKeys } from "@/api/queries/keys";
import { transitionProject } from "@/api/projects";
import type { Participation, Visibility } from "@/domain";
import { TagPicker } from "../components/TagPicker";

/**
 * Création de projet (doc 13 E-13, mission item 3). Une seule page
 * défilante — le parcours en étapes (Step*.tsx) est retiré : le minimum
 * publiable (P4) tient déjà dans un seul écran (titre + accroche + un
 * thème). Aucun chemin IA : le contrat v2 (`src/domain`, `src/api`)
 * n'expose pas d'assistance de formulation — un bouton mort aurait été pire
 * qu'aucun bouton (P7, doc 18 R-IA-21/22).
 */

type Access = "open" | "on_request" | "on_invite" | "private";

const ACCESS_OPTIONS: {
  value: Access;
  label: string;
  description: string;
}[] = [
  {
    value: "open",
    label: "Ouvert à tous",
    description: "On peut rejoindre sans te demander",
  },
  {
    value: "on_request",
    label: "Sur demande",
    description: "Tu acceptes ou non chaque personne",
  },
  {
    value: "on_invite",
    label: "Sur invitation",
    description: "Visible, mais on n'entre que si tu invites",
  },
  {
    value: "private",
    label: "Privé",
    description: "Personne ne le voit à part les invités",
  },
];

function accessToFields(access: Access): {
  visibility: Visibility;
  participation: Participation;
} {
  if (access === "private") {
    return { visibility: "private", participation: "on_invite" };
  }
  return { visibility: "public", participation: access };
}

export default function CreateProjectPage() {
  useDocumentTitle("Nouveau projet");
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [newNeed, setNewNeed] = useState("");
  const [access, setAccess] = useState<Access>("open");

  const queryClient = useQueryClient();
  const createProject = useCreateProject();
  const publishProject = useMutation({
    mutationFn: (slug: string) => transitionProject(slug, "publish"),
    onSuccess: (published) => {
      // R-PR3 : la creation renvoie toujours un brouillon (etat initial
      // draft, doc API-ROUTES) ; sans ceci le cache garde ce brouillon et la
      // fiche affiche "Brouillon" juste apres avoir publie.
      queryClient.setQueryData(
        queryKeys.projects.detail(published.slug),
        published,
      );
    },
  });

  const titleId = useId();
  const taglineId = useId();
  const canPublish =
    title.trim().length >= 3 && tagline.trim().length > 0 && tags.length > 0;

  function addNeed() {
    const label = newNeed.trim();
    if (label.length < 3 || needs.length >= 6) return;
    setNeeds((current) => [...current, label]);
    setNewNeed("");
  }

  function buildInput() {
    const { visibility, participation } = accessToFields(access);
    return {
      title: title.trim(),
      tagline: tagline.trim(),
      tags,
      needs: needs.length > 0 ? needs.map((label) => ({ label })) : undefined,
      visibility,
      participation,
    };
  }

  function handleSaveDraft() {
    if (title.trim().length < 3) return;
    createProject.mutate(buildInput(), {
      onSuccess: (project) => navigate(`/projets/${project.slug}`),
    });
  }

  function handlePublish() {
    if (!canPublish) return;
    createProject.mutate(buildInput(), {
      onSuccess: (project) => {
        publishProject.mutate(project.slug, {
          onSettled: () => navigate(`/projets/${project.slug}`),
        });
      },
    });
  }

  const isSubmitting = createProject.isPending || publishProject.isPending;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 py-12">
      <PageHeader title="Nouveau projet" />

      <Section title="Ton idée">
        <Field label="Titre" htmlFor={titleId} required>
          <Input
            id={titleId}
            value={title}
            maxLength={70}
            placeholder="Le nom de ton projet"
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field
          label="Accroche"
          htmlFor={taglineId}
          required
          description={`Une phrase pour donner envie. ${tagline.length}/140`}
        >
          <Input
            id={taglineId}
            value={tagline}
            maxLength={140}
            placeholder="Ce qu'on lira dans le fil"
            onChange={(event) => setTagline(event.target.value)}
          />
        </Field>
      </Section>

      <Section title="De quoi ça parle">
        <Field label="Thèmes" required description="1 à 5">
          <TagPicker selected={tags} onChange={setTags} />
        </Field>
        <Field label="Ce que tu cherches" description="Optionnel">
          <ul className="flex flex-col gap-2">
            {needs.map((label, index) => (
              <li key={`${label}-${index}`} className="flex items-center gap-2">
                <span className="flex-1 text-body-sm text-foreground">
                  {label}
                </span>
                <IconButton
                  aria-label="Retirer ce besoin"
                  size="xs"
                  onClick={() =>
                    setNeeds((current) => current.filter((_, i) => i !== index))
                  }
                >
                  <X size={14} />
                </IconButton>
              </li>
            ))}
          </ul>
          {needs.length < 6 && (
            <div className="flex gap-2">
              <Input
                value={newNeed}
                maxLength={40}
                placeholder="quelqu'un pour la photo…"
                onChange={(event) => setNewNeed(event.target.value)}
              />
              <Button variant="outline" onClick={addNeed}>
                Ajouter un besoin
              </Button>
            </div>
          )}
        </Field>
      </Section>

      <Section title="Qui peut venir">
        <RadioGroup
          value={access}
          onValueChange={(value) => setAccess(value as Access)}
        >
          {ACCESS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={
                access === option.value
                  ? "flex cursor-pointer items-start gap-3 rounded-lg border border-ring p-3"
                  : "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3"
              }
            >
              <Radio value={option.value} className="mt-1" />
              <span>
                <span className="block text-body-md font-medium text-foreground">
                  {option.label}
                </span>
                <span className="block text-body-sm text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </Section>

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button
          variant="outline"
          disabled={title.trim().length < 3 || isSubmitting}
          onClick={handleSaveDraft}
        >
          Garder en brouillon
        </Button>
        <Button disabled={!canPublish || isSubmitting} onClick={handlePublish}>
          Publier le projet
        </Button>
      </div>
      {(createProject.isError || publishProject.isError) && (
        <p className="text-body-sm text-danger-fg" role="alert">
          Le projet n'a pas pu être enregistré. Réessaie.
        </p>
      )}
    </div>
  );
}
