import { useOutletContext } from "react-router-dom";
import type { MembershipRole, Project } from "@/domain";
import type { TeamMember } from "@/api/memberships";

/**
 * Contexte transmis par `LabLayout` (coquille atelier) à ses deux onglets
 * (Mur, Étapes) via `<Outlet context={…} />`. Centralise ici ce que
 * la coquille a déjà résolu — projet, mon rôle, lecture seule — pour que
 * chaque page n'ait pas à recalculer l'accès (R-W1, R-PR4).
 */
export interface LabContext {
  slug: string;
  project: Project;
  myRole: MembershipRole;
  /** Observateur (R-W1) ou projet `done` (R-PR4) : édition désactivée. */
  readOnly: boolean;
  members: TeamMember[];
}

export function useLabContext(): LabContext {
  return useOutletContext<LabContext>();
}
