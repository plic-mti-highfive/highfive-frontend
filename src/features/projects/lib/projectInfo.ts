import type { Need, Project, ProjectUpdateInput } from "@/domain";

/** Champs du projet modifiables dans l'onglet Infos de l'editeur de la fiche. */
export interface ProjectInfoDraft {
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  needs: Need[];
}

export const INFO_TITLE_MIN = 3;
export const INFO_NEED_MIN = 3;
export const INFO_NEEDS_MAX = 6;

export const INFO_FIELD_IDS = {
  title: "edit-info-title",
  tagline: "edit-info-tagline",
  tags: "edit-info-tags",
} as const;

export function toInfoDraft(project: Project): ProjectInfoDraft {
  return {
    title: project.title,
    tagline: project.tagline,
    description: project.description ?? "",
    tags: project.tags,
    needs: project.needs,
  };
}

export function isInfoDirty(
  draft: ProjectInfoDraft,
  project: Project,
): boolean {
  return JSON.stringify(draft) !== JSON.stringify(toInfoDraft(project));
}

export interface InfoIssue {
  inputId: string;
  label: string;
  message: string;
}

/** Problemes bloquant l'enregistrement des infos, dans l'ordre de la page. */
export function getInfoIssues(draft: ProjectInfoDraft): InfoIssue[] {
  const issues: InfoIssue[] = [];
  if (draft.title.trim().length < INFO_TITLE_MIN) {
    issues.push({
      inputId: INFO_FIELD_IDS.title,
      label: "Titre",
      message: `Le titre doit faire au moins ${INFO_TITLE_MIN} caractères.`,
    });
  }
  if (draft.tagline.trim().length === 0) {
    issues.push({
      inputId: INFO_FIELD_IDS.tagline,
      label: "Accroche",
      message: "L'accroche ne peut pas être vide.",
    });
  }
  if (draft.tags.length === 0) {
    issues.push({
      inputId: INFO_FIELD_IDS.tags,
      label: "Thèmes",
      message: "Choisis au moins un thème.",
    });
  }
  return issues;
}

export function toUpdateInput(draft: ProjectInfoDraft): ProjectUpdateInput {
  const description = draft.description.trim();
  return {
    title: draft.title.trim(),
    tagline: draft.tagline.trim(),
    description: description ? description : undefined,
    tags: draft.tags,
    needs: draft.needs,
  };
}

/** Le projet tel qu'il serait avec le brouillon : alimente l'apercu live de l'editeur. */
export function applyInfoDraft(
  project: Project,
  draft: ProjectInfoDraft,
): Project {
  const description = draft.description.trim();
  return {
    ...project,
    title: draft.title.trim(),
    tagline: draft.tagline.trim(),
    description: description ? description : undefined,
    tags: draft.tags,
    needs: draft.needs,
  };
}
