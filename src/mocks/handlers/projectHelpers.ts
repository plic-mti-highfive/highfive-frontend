import type { Project } from "@/domain";
import { getDb } from "../db";
import { toUserSummary } from "./utils";

/** Construit un `ProjectSummary` a partir d'un `Project` + son porteur + son equipe. */
export function toProjectSummary(project: Project) {
  const db = getDb();
  const owner = db.users.findOne((u) => u.id === project.ownerId);
  if (!owner)
    throw new Error(`Porteur introuvable pour le projet ${project.slug}`);
  const membersCount = db.memberships.find(
    (m) => m.projectId === project.id,
  ).length;
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    tagline: project.tagline,
    tags: project.tags,
    visibility: project.visibility,
    participation: project.participation,
    state: project.state,
    highfiveCount: project.highfiveCount,
    membersCount,
    owner: toUserSummary(owner),
  };
}

/** R-V1 : visible dans le fil/recherche/tendances si public + actif. */
export function isDiscoverable(project: Project): boolean {
  return project.visibility === "public" && project.state === "active";
}

/** R-V2/R-V3/R-PR2/R-PR5 : ce qu'un visiteur/membre peut voir sur la fiche. */
export function canView(
  project: Project,
  viewerId: string | undefined,
): boolean {
  if (project.state === "draft") return viewerId === project.ownerId;
  if (project.visibility === "public") return true;
  // prive : porteur, co-porteur, membre ou observateur uniquement (R-V3).
  if (!viewerId) return false;
  const db = getDb();
  return Boolean(
    db.memberships.findOne(
      (m) => m.projectId === project.id && m.userId === viewerId,
    ),
  );
}
