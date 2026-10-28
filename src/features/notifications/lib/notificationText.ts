import type {
  NotificationTarget,
  NotificationType,
  UserSummary,
} from "@/domain";

/** R-N2 : "Sophie et 4 autres" — les acteurs sont deja regroupes par le serveur. */
export function formatActors(actors: UserSummary[]): string {
  const names = actors.map(
    (actor) => actor.displayName ?? `@${actor.username}`,
  );
  if (names.length === 0) return "Quelqu'un";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} et ${names[1]}`;
  return `${names[0]} et ${names.length - 1} autres`;
}

/** Phrase d'action, accordee au singulier/pluriel selon le nombre d'acteurs (doc 17, tutoiement). */
export function actionPhrase(type: NotificationType, plural: boolean): string {
  switch (type) {
    case "highfive_received":
      return plural ? "ont highfivé" : "a highfivé";
    case "comment_on_project":
      return plural ? "ont commenté" : "a commenté";
    case "reply_to_comment":
      return plural
        ? "ont répondu à ton commentaire sur"
        : "a répondu à ton commentaire sur";
    case "join_request_received":
      return plural ? "veulent rejoindre" : "veut rejoindre";
    case "join_request_accepted":
      return plural
        ? "ont accepté ta demande pour rejoindre"
        : "a accepté ta demande pour rejoindre";
    case "join_request_rejected":
      return plural
        ? "ont refusé ta demande pour rejoindre"
        : "a refusé ta demande pour rejoindre";
    case "invitation_received":
      return plural ? "t'invitent à rejoindre" : "t'invite à rejoindre";
    case "new_member":
      return plural ? "ont rejoint" : "a rejoint";
    case "announcement_on_followed_project":
      return plural
        ? "ont publié une annonce dans"
        : "a publié une annonce dans";
    case "task_assigned":
      return plural ? "t'ont confié" : "t'a confié";
    case "mention":
      return plural ? "t'ont mentionné dans" : "t'a mentionné dans";
    case "message_received":
      return plural ? "t'ont envoyé un message" : "t'a envoyé un message";
    case "admin_decision":
      return "a pris une décision concernant ton compte";
  }
}

/** R-N3 : libelle de la cible a accoler a la phrase d'action. */
export function targetLabel(target: NotificationTarget): string | undefined {
  switch (target.type) {
    case "project":
    case "comment":
      return target.projectTitle;
    case "task":
      return `« ${target.taskTitle} »`;
    case "message":
      return target.conversationTitle ?? "la conversation";
  }
}

/** R-N3 : route FR exacte (doc 06/V2-9) vers laquelle la notification pointe. */
export function targetHref(target: NotificationTarget): string {
  switch (target.type) {
    case "project":
    case "comment":
      return `/projets/${target.projectSlug}`;
    case "task":
      return `/projets/${target.projectSlug}/lab/etapes`;
    case "message":
      return `/messages/${target.conversationId}`;
  }
}
