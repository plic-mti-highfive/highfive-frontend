import type { MembershipRole } from "@/domain";

/**
 * Comparaison de rôles côté client pour la coquille atelier (doc 05 §3.3) :
 * miroir minimal de `ROLE_RANK`/`hasAtLeastRole` de
 * `src/mocks/handlers/utils.ts`, dupliqué ici plutôt qu'exporté depuis les
 * mocks pour ne pas faire dépendre le code applicatif de la couche mock.
 */
const ROLE_RANK: Record<MembershipRole, number> = {
  observer: 0,
  member: 1,
  co_owner: 2,
  owner: 3,
};

export function hasAtLeastRole(
  role: MembershipRole | undefined,
  minimum: MembershipRole,
): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}
