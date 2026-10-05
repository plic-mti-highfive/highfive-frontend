import type { Project } from "@/domain";
import { getDb } from "../db";
import { toUserSummary } from "./utils";

/** Construit un `ProjectSummary` a partir d'un `Project` + son porteur + son equipe. */
export function toProjectSummary(project: Project) {
  const db = getDb();
  const owner = db.users.findOne((u) => u.id === project.ownerId);
  if (!owner)
    throw new Error(`Porteur introuvable pour le projet ${project.slug}`);
  const memberships = db.memberships.find((m) => m.projectId === project.id);
  const membersCount = memberships.length;
  // Porteur en tete (doc 11 C5), puis quelques membres pour l'AvatarGroup de
  // la carte (ProjectSummary.teamPreview, additif V2-4).
  const teamPreview = memberships
    .slice()
    .sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0))
    .slice(0, 6)
    .map((m) => db.users.findOne((u) => u.id === m.userId))
    .filter((u): u is NonNullable<typeof u> => Boolean(u))
    .map(toUserSummary);
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    tagline: project.tagline,
    tags: project.tags,
    needs: project.needs,
    visibility: project.visibility,
    participation: project.participation,
    state: project.state,
    highfiveCount: project.highfiveCount,
    membersCount,
    teamPreview,
    owner: toUserSummary(owner),
    accent: project.customization?.accent,
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
