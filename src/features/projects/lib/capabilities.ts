import type { MembershipRole } from "@/domain";
import type { TeamMember } from "@/api/memberships";

/**
 * Capacites calculees cote client depuis le role d'appartenance (doc 05 §3).
 * Le contrat v2 n'expose pas encore d'objet `ProjectAbilities` calcule cote
 * serveur (R-IMP1 ideal) : on derive ici depuis `TeamMember[]` + l'id de la
 * personne connectee, en restant au plus pres de la matrice de droits. A
 * remplacer par un objet serveur si `src/domain/project.ts` en expose un jour
 * un (signale dans le rapport de mission).
 */
export interface ProjectCapabilities {
  role: MembershipRole | undefined;
  isMember: boolean;
  /** Modifier titre, accroche, description, tags, besoins. */
  canEdit: boolean;
  /** Personnaliser la fiche (banniere, accent, sections, galerie) : porteur seul. */
  canCustomize: boolean;
  /** Publier, archiver, transferer : porteur seul. */
  canPublish: boolean;
  canArchive: boolean;
  canTransfer: boolean;
  canDelete: boolean;
  /** Terminer, rouvrir : porteur et co-porteur. */
  canCompleteOrReopen: boolean;
  canManageTeam: boolean;
  canModerateComments: boolean;
  canPostAnnouncement: boolean;
  canPinAnnouncement: boolean;
  /** R-H2 : le porteur ne peut pas highfiver son propre projet. */
  canHighfive: boolean;
  canComment: boolean;
}

export function getMembershipRole(
  members: TeamMember[] | undefined,
  userId: string | undefined,
): MembershipRole | undefined {
  if (!userId || !members) return undefined;
  return members.find((member) => member.userId === userId)?.role;
}

export function getProjectCapabilities(
  role: MembershipRole | undefined,
  isAuthenticated: boolean,
): ProjectCapabilities {
  const isOwner = role === "owner";
  const isOwnerOrCoOwner = role === "owner" || role === "co_owner";

  return {
    role,
    isMember: role !== undefined,
    canEdit: isOwnerOrCoOwner,
    canCustomize: isOwner,
    canPublish: isOwner,
    canArchive: isOwner,
    canTransfer: isOwner,
    canDelete: isOwner,
    canCompleteOrReopen: isOwnerOrCoOwner,
    canManageTeam: isOwnerOrCoOwner,
    canModerateComments: isOwnerOrCoOwner,
    canPostAnnouncement: isOwnerOrCoOwner,
    canPinAnnouncement: isOwnerOrCoOwner,
    canHighfive: isAuthenticated && !isOwner,
    canComment: isAuthenticated,
  };
}
