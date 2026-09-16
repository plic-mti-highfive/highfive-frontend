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
import type { Participation, ProjectSummary, Visibility } from "@/domain";
import { useCurrentUser } from "@features/auth/hooks/useCurrentUser";
import { ProjectCard } from "@shared/components/projects/ProjectCard";
import { TagPicker } from "../components/TagPicker";

type Access = "open" | "on_request" | "on_invite" | "private";
type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Idée",
  2: "Thèmes",
  3: "Visibilité",
};

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

function StepIndicator({ current }: { current: Step }) {
  const steps: Step[] = [1, 2, 3];
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex flex-1 items-center">
            {i > 0 && (
              <div
                className={`h-px flex-1 ${done ? "bg-primary" : "bg-border"}`}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-label font-semibold ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
              <span
                className={`hidden text-label sm:block ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px flex-1 ${step < current ? "bg-primary" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CreateProjectPage() {
  useDocumentTitle("Nouveau projet");
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [newNeed, setNewNeed] = useState("");
  const [access, setAccess] = useState<Access>("open");

  const titleId = useId();
  const taglineId = useId();
  const newNeedId = useId();

  const queryClient = useQueryClient();
  const createProject = useCreateProject();
  const publishProject = useMutation({
    mutationFn: (slug: string) => transitionProject(slug, "publish"),
    onSuccess: (published) => {
      queryClient.setQueryData(
        queryKeys.projects.detail(published.slug),
        published,
      );
    },
  });

  const canGoNext =
    step === 1
      ? title.trim().length >= 3 && tagline.trim().length > 0
      : step === 2
        ? tags.length >= 1
        : true;

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

  const { visibility, participation } = accessToFields(access);
  const previewProject: ProjectSummary | null = user
    ? {
        id: "00000000-0000-0000-0000-000000000000",
        slug: "apercu",
        title: title.trim() || "Titre du projet",
        tagline: tagline.trim() || "L'accroche apparaîtra ici.",
        tags,
        needs: needs.map((label, i) => ({
          id: String(i),
          label,
          fulfilled: false,
        })),
        visibility,
        participation,
        state: "active",
        highfiveCount: 0,
        membersCount: 1,
        teamPreview: [],
        owner: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
        },
      }
    : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 py-12">
      <PageHeader title="Nouveau projet" />

      <StepIndicator current={step} />

      {step === 1 && (
        <Section title="Ton idée">
          <Field label="Titre" htmlFor={titleId} required>
            <Input
              id={titleId}
              value={title}
              maxLength={70}
              placeholder="Le nom de ton projet"
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field
            label="Accroche"
            htmlFor={taglineId}
            required
            description={`Une phrase pour résumer globalement le projet. ${tagline.length}/140`}
          >
            <Input
              id={taglineId}
              value={tagline}
              maxLength={140}
              placeholder="Ce qu'on lira dans le fil"
              onChange={(e) => setTagline(e.target.value)}
            />
          </Field>
        </Section>
      )}

      {step === 2 && (
        <>
          <Section title="De quoi ça parle">
            <Field label="Thèmes" required description="1 à 5">
              <TagPicker selected={tags} onChange={setTags} searchable />
            </Field>
          </Section>

          <Section title="Ce que tu cherches">
            <Field
              label="Profils recherchés"
              description="Optionnel, maximum 6"
            >
              <ul className="flex flex-col gap-2">
                {needs.map((label, index) => (
                  <li
                    key={`${label}-${index}`}
                    className="flex items-center gap-2"
                  >
                    <span className="flex-1 text-body-sm text-foreground">
                      {label}
                    </span>
                    <IconButton
                      aria-label="Retirer ce profil"
                      size="xs"
                      onClick={() =>
                        setNeeds((current) =>
                          current.filter((_, i) => i !== index),
                        )
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
                    id={newNeedId}
                    value={newNeed}
                    maxLength={40}
                    placeholder="quelqu'un pour la photo…"
                    onChange={(e) => setNewNeed(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addNeed();
                      }
                    }}
                  />
                  <Button variant="outline" onClick={addNeed}>
                    Ajouter
                  </Button>
                </div>
              )}
            </Field>
          </Section>
        </>
      )}

      {step === 3 && (
        <>
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

          {previewProject && (
            <Section title="Aperçu de la carte">
              <div className="pointer-events-none">
                <ProjectCard project={previewProject} />
              </div>
            </Section>
          )}
        </>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={() => setStep((s) => (s - 1) as Step)}
          >
            Précédent
          </Button>
        ) : (
          <div />
        )}

        <div className="flex gap-3">
          {step < 3 && (
            <Button
              disabled={!canGoNext}
              onClick={() => setStep((s) => (s + 1) as Step)}
            >
              Suivant
            </Button>
          )}
          {step === 3 && (
            <>
              <Button
                variant="outline"
                disabled={title.trim().length < 3 || isSubmitting}
                onClick={handleSaveDraft}
              >
                Garder en brouillon
              </Button>
              <Button
                disabled={!canPublish || isSubmitting}
                onClick={handlePublish}
              >
                Publier le projet
              </Button>
            </>
          )}
        </div>
      </div>

      {(createProject.isError || publishProject.isError) && (
        <p className="text-body-sm text-danger-fg" role="alert">
          Le projet n'a pas pu être enregistré. Réessaie.
        </p>
      )}
    </div>
  );
}
