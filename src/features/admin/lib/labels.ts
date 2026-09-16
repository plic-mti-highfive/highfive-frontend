import type {
  AccountStatus,
  ProjectState,
  ReportReason,
  ReportTargetType,
} from "@/domain";

/** Vocabulaire du doc 03 (glossaire) — casse de phrase, aucun jargon technique. */
export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Actif",
  suspended: "Suspendu",
  deleted: "Supprimé",
};

export const PROJECT_STATE_LABELS: Record<ProjectState, string> = {
  draft: "Brouillon",
  active: "Actif",
  done: "Terminé",
  archived: "Archivé",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  hateful_content: "Contenu haineux",
  harassment: "Harcèlement",
  scam: "Arnaque",
  sexual_content: "Contenu sexuel",
  spam: "Spam",
  other: "Autre",
};

export const REPORT_TARGET_TYPE_LABELS: Record<ReportTargetType, string> = {
  project: "projet",
  comment: "commentaire",
  message: "message",
  user: "personne",
};
