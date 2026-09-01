import { ProjectRole } from "@plic-mti-highfive/shared-types";
import type { MinimalProfileDto, ProjectDto } from "@/api/types";
import { getAllProjects, getProjectById } from "./mockProjects";
import { getAllUsers } from "./mockUsers";

/**
 * Composition des equipes, source de verite unique partagee par le service
 * projet (membres, nombre de contributeurs) et le service utilisateur (projets
 * crees / collaborations). Sans ce referentiel commun, chaque service inventait
 * sa propre reponse : les cartes affichaient « 0 contributeurs » et les profils
 * « aucun projet », alors que le backend renvoie de vraies equipes.
 *
 * Tout est derive des index, donc stable d'un rechargement a l'autre : une
 * donnee tiree au hasard ne serait pas une donnee « dynamique », juste une
 * donnee fausse a chaque rendu.
 */
export interface MockMembership {
  userId: string;
  role: ProjectRole;
}

/** Roles attribues aux membres non-proprietaires, en boucle. */
const SIDE_ROLES: ProjectRole[] = [
  ProjectRole.ADMIN,
  ProjectRole.MEMBER,
  ProjectRole.MEMBER,
  ProjectRole.VIEWER,
];

function buildMemberships(): Record<string, MockMembership[]> {
  const projects = getAllProjects();
  const users = getAllUsers();
  const result: Record<string, MockMembership[]> = {};

  projects.forEach((project, index) => {
    const owner = users[index % users.length];
    const team: MockMembership[] = [
      { userId: owner.id, role: ProjectRole.OWNER },
    ];

    // 2 a 5 equipiers, pris a distance fixe du proprietaire.
    const teamSize = 2 + (index % 4);
    for (let i = 1; i <= teamSize; i++) {
      const member = users[(index + i * 3) % users.length];
      if (member.id === owner.id) continue;
      if (team.some((m) => m.userId === member.id)) continue;
      team.push({ userId: member.id, role: SIDE_ROLES[i % SIDE_ROLES.length] });
    }

    result[project.id] = team;
  });

  return result;
}

export const mockMemberships: Record<string, MockMembership[]> =
  buildMemberships();

export function getProjectMemberships(projectId: string): MockMembership[] {
  return mockMemberships[projectId] ?? [];
}

export function getProjectOwnerId(projectId: string): string | undefined {
  return mockMemberships[projectId]?.find((m) => m.role === ProjectRole.OWNER)
    ?.userId;
}

/** Profil public du proprietaire, tel que le backend l'imbrique dans un projet. */
export function getProjectOwnerProfile(
  projectId: string,
): MinimalProfileDto | undefined {
  const ownerId = getProjectOwnerId(projectId);
  if (!ownerId) return undefined;
  const owner = getAllUsers().find((u) => u.id === ownerId);
  if (!owner) return undefined;

  const username = owner.email.split("@")[0];
  return {
    userId: owner.id,
    username,
    displayName: username,
    avatar: owner.profile?.avatarPath || "",
  };
}

/** Projet enrichi comme le renvoie l'API : proprietaire + taille d'equipe. */
export function getProjectWithOwner(projectId: string): ProjectDto | undefined {
  const project = getProjectById(projectId);
  if (!project) return undefined;
  return {
    ...project,
    owner: getProjectOwnerProfile(projectId),
    membersCount: getProjectMemberships(projectId).length,
  };
}

/** Projets dont l'utilisateur est proprietaire. */
export function getProjectIdsOwnedBy(userId: string): string[] {
  return Object.entries(mockMemberships)
    .filter(([, team]) =>
      team.some((m) => m.userId === userId && m.role === ProjectRole.OWNER),
    )
    .map(([projectId]) => projectId);
}

/** Projets auxquels l'utilisateur participe sans en etre proprietaire. */
export function getProjectIdsJoinedBy(userId: string): string[] {
  return Object.entries(mockMemberships)
    .filter(([, team]) =>
      team.some((m) => m.userId === userId && m.role !== ProjectRole.OWNER),
    )
    .map(([projectId]) => projectId);
}
