import type { BadgeProps } from "@shared/ui";
import type { MembershipRole, Participation, ProjectState } from "@/domain";

/** Vocabulaire doc 03/04 : jamais "Owner"/"Draft"/etc. dans l'interface. */

export const STATE_LABEL: Record<ProjectState, string> = {
  draft: "Brouillon",
  active: "Ouvert",
  done: "Terminé",
  archived: "Archivé",
};

export const STATE_TONE: Record<
  ProjectState,
  NonNullable<BadgeProps["tone"]>
> = {
  draft: "neutral",
  active: "success",
  done: "info",
  archived: "neutral",
};

export const PARTICIPATION_LABEL: Record<Participation, string> = {
  open: "Ouvert à tous",
  on_request: "Sur demande",
  on_invite: "Sur invitation",
};

export const ROLE_LABEL: Record<MembershipRole, string> = {
  owner: "Porteur",
  co_owner: "Co-porteur",
  member: "Membre",
  observer: "Observateur",
};
