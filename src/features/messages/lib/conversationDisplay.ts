import type {
  ConversationDetail,
  ConversationSummary,
  UserSummary,
} from "@/domain";

type ConversationLike = Pick<
  ConversationSummary | ConversationDetail,
  "type" | "participants" | "title" | "projectTitle"
>;

export interface ConversationDisplay {
  /** Titre affiche (nom de l'autre personne, du groupe ou du canal). */
  title: string;
  /** Sous-titre optionnel (nombre de membres, pour groupe/canal). */
  subtitle?: string;
  /** Personnes a afficher en avatar (l'utilisateur courant est retire). */
  avatarPeople: UserSummary[];
}

/**
 * Deduit le titre/avatar d'une conversation a partir de son type (R-MSG1..3) :
 * direct -> l'autre personne, group -> son titre ou les noms des membres,
 * channel -> le nom du projet qu'il miroite.
 */
export function getConversationDisplay(
  conversation: ConversationLike,
  currentUserId: string,
): ConversationDisplay {
  const others = conversation.participants.filter(
    (person) => person.id !== currentUserId,
  );

  if (conversation.type === "direct") {
    const other = others[0];
    return {
      title: other
        ? (other.displayName ?? `@${other.username}`)
        : "Conversation",
      avatarPeople: other ? [other] : [],
    };
  }

  if (conversation.type === "channel") {
    if (conversation.projectTitle) {
      return {
        title: conversation.projectTitle,
        subtitle: "Canal du projet",
        avatarPeople: others,
      };
    }
    return {
      title: conversation.title ?? "Canal de l'équipe",
      subtitle: `${conversation.participants.length} membres`,
      avatarPeople: others,
    };
  }

  const names = others.map(
    (person) => person.displayName ?? `@${person.username}`,
  );
  return {
    title:
      conversation.title ??
      (names.length ? names.slice(0, 3).join(", ") : "Groupe"),
    subtitle: `${conversation.participants.length} personnes`,
    avatarPeople: others,
  };
}
