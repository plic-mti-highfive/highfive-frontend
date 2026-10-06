import { notificationSchema, type Notification } from "@/domain";
import { COMMENTS, hiddenSpamComment, criticalComment } from "./comments";
import {
  canalFresque,
  directAnnick,
  directMarc,
  messageRequestYanis,
} from "./conversations";
import { daysAgo, hoursAgo, minutesAgo, nextId } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import { TASKS } from "./tasks";
import * as u from "./users";

function project(slug: string) {
  const found = PROJECT_BY_SLUG.get(slug);
  if (!found) throw new Error(`Projet inconnu dans le jeu de demo : ${slug}`);
  return found;
}

function commentStartingWith(prefix: string) {
  const found = COMMENTS.find((c) => c.body.startsWith(prefix));
  if (!found) throw new Error(`Commentaire de demo introuvable : ${prefix}`);
  return found;
}

const fresque = project("fresque-murale-collaborative");
const album = project("album-de-reprises-au-local");
const repairCafe = project("repair-cafe-du-mois");

const thomasComment = COMMENTS.find((c) => c.authorId === u.thomasDupont.id)!;
const repeindreMurNord = TASKS.find(
  (t) => t.title === "Repeindre le mur nord",
)!;

function notification(
  input: Omit<Notification, "id" | "read"> & { read?: boolean },
): Notification {
  return notificationSchema.parse({
    id: nextId(),
    ...input,
    read: input.read ?? false,
  });
}

/**
 * R-N2 : une notification par événement et par cible, avec tous les acteurs
 * regroupés dans `actorIds`. Les premières lignes sont celles d'alex.rivera
 * (compte de démo, doc 23 §8) ; viennent ensuite quelques notifications
 * pour d'autres comptes, afin que changer de compte ne donne pas une cloche
 * vide.
 */
export const NOTIFICATIONS: Notification[] = [
  // "Sophie et 4 autres ont highfivé Fresque murale collaborative"
  notification({
    recipientId: u.alexRivera.id,
    type: "highfive_received",
    actorIds: [
      u.sophieMartin.id,
      u.thomasDupont.id,
      u.claraMartinez.id,
      u.lisaMoreau.id,
      u.enzoB.id,
    ],
    targetType: "project",
    targetId: fresque.id,
    createdAt: minutesAgo(10),
  }),
  // "yanis.f veut rejoindre Fresque murale collaborative" [actionnable]
  notification({
    recipientId: u.alexRivera.id,
    type: "join_request_received",
    actorIds: [u.yanisF.id],
    targetType: "project",
    targetId: fresque.id,
    createdAt: hoursAgo(2),
  }),
  // "Thomas a commenté Fresque murale collaborative"
  notification({
    recipientId: u.alexRivera.id,
    type: "comment_on_project",
    actorIds: [u.thomasDupont.id],
    targetType: "comment",
    targetId: thomasComment.id,
    createdAt: hoursAgo(3),
  }),
  // "Camille t'a confié « Repeindre le mur nord »"
  notification({
    recipientId: u.alexRivera.id,
    type: "task_assigned",
    actorIds: [u.camillePetit.id],
    targetType: "task",
    targetId: repeindreMurNord.id,
    createdAt: hoursAgo(5),
  }),
  // Nouveau message d'une personne : non lu.
  notification({
    recipientId: u.alexRivera.id,
    type: "message_received",
    actorIds: [u.marcLeroy.id],
    targetType: "message",
    targetId: directMarc.id,
    createdAt: hoursAgo(12),
  }),
  // Demande de message de yanis.f (R-MSG7).
  notification({
    recipientId: u.alexRivera.id,
    type: "message_received",
    actorIds: [u.yanisF.id],
    targetType: "message",
    targetId: messageRequestYanis.id,
    createdAt: hoursAgo(20),
  }),
  // "marc.leroy t'invite dans Album de reprises au local" [actionnable]
  notification({
    recipientId: u.alexRivera.id,
    type: "invitation_received",
    actorIds: [u.marcLeroy.id],
    targetType: "project",
    targetId: album.id,
    createdAt: daysAgo(1),
  }),
  // "Nouvelle annonce dans Repair café du mois"
  notification({
    recipientId: u.alexRivera.id,
    type: "announcement_on_followed_project",
    actorIds: [u.thomasDupont.id],
    targetType: "project",
    targetId: repairCafe.id,
    createdAt: daysAgo(2),
    read: true,
  }),
  // "Camille t'a mentionné dans Le Canal de Fresque murale"
  notification({
    recipientId: u.alexRivera.id,
    type: "mention",
    actorIds: [u.camillePetit.id],
    targetType: "message",
    targetId: canalFresque.id,
    createdAt: daysAgo(3),
    read: true,
  }),
  // "Thomas a répondu à ton commentaire"
  notification({
    recipientId: u.alexRivera.id,
    type: "reply_to_comment",
    actorIds: [u.thomasDupont.id],
    targetType: "comment",
    targetId: commentStartingWith("@alex.rivera Parfait, merci").id,
    createdAt: hoursAgo(100),
    read: true,
  }),
  notification({
    recipientId: u.alexRivera.id,
    type: "message_received",
    actorIds: [u.annickR.id],
    targetType: "message",
    targetId: directAnnick.id,
    createdAt: hoursAgo(40),
    read: true,
  }),
  // "Paul et 4 autres ont rejoint Nettoyage des berges"
  notification({
    recipientId: u.alexRivera.id,
    type: "new_member",
    actorIds: [
      u.paulMercier.id,
      u.mathildeD.id,
      u.oceaneL.id,
      u.camillePetit.id,
      u.enzoB.id,
    ],
    targetType: "project",
    targetId: project("nettoyage-des-berges").id,
    createdAt: daysAgo(8),
    read: true,
  }),
  // "Camille a accepté ta demande pour Verger conservatoire"
  notification({
    recipientId: u.alexRivera.id,
    type: "join_request_accepted",
    actorIds: [u.camillePetit.id],
    targetType: "project",
    targetId: project("verger-conservatoire").id,
    createdAt: daysAgo(40),
    read: true,
  }),
  // "Yasmine et 2 autres ont highfivé Carte des bancs publics"
  notification({
    recipientId: u.alexRivera.id,
    type: "highfive_received",
    actorIds: [u.yasmineT.id, u.sophieMartin.id, u.karimHaddad.id],
    targetType: "project",
    targetId: project("carte-des-bancs-publics").id,
    createdAt: daysAgo(5),
    read: true,
  }),

  // --- Autres comptes de démonstration (mot de passe : demo1234) ---------
  notification({
    recipientId: u.camillePetit.id,
    type: "join_request_received",
    actorIds: [u.oceaneL.id],
    targetType: "project",
    targetId: project("verger-conservatoire").id,
    createdAt: daysAgo(2),
  }),
  notification({
    recipientId: u.camillePetit.id,
    type: "comment_on_project",
    actorIds: [u.oceaneL.id],
    targetType: "comment",
    targetId: commentStartingWith("Est-ce qu'on peut venir juste regarder").id,
    createdAt: hoursAgo(26),
  }),
  notification({
    recipientId: u.camillePetit.id,
    type: "highfive_received",
    actorIds: [u.alexRivera.id, u.sophieMartin.id, u.mathildeD.id],
    targetType: "project",
    targetId: project("jardin-partage-derriere-lecole").id,
    createdAt: hoursAgo(30),
    read: true,
  }),
  notification({
    recipientId: u.thomasDupont.id,
    type: "join_request_received",
    actorIds: [u.karimHaddad.id],
    targetType: "project",
    targetId: repairCafe.id,
    createdAt: daysAgo(3),
  }),
  notification({
    recipientId: u.thomasDupont.id,
    type: "reply_to_comment",
    actorIds: [u.alexRivera.id],
    targetType: "comment",
    targetId: commentStartingWith("Non, tout est fourni").id,
    createdAt: hoursAgo(116),
    read: true,
  }),
  notification({
    recipientId: u.nadiaK.id,
    type: "join_request_received",
    actorIds: [u.baptisteN.id],
    targetType: "project",
    targetId: project("maree-basse-jeu-video").id,
    createdAt: daysAgo(1),
  }),
  notification({
    recipientId: u.nadiaK.id,
    type: "comment_on_project",
    actorIds: [u.hugoLemaire.id],
    targetType: "comment",
    targetId: criticalComment.id,
    createdAt: hoursAgo(400),
    read: true,
  }),
  notification({
    recipientId: u.nadiaK.id,
    type: "highfive_received",
    actorIds: [u.alexRivera.id, u.sophieMartin.id],
    targetType: "project",
    targetId: project("maree-basse-jeu-video").id,
    createdAt: hoursAgo(5),
  }),
  // Décision d'administration visible par la personne concernée.
  notification({
    recipientId: u.fabriceV.id,
    type: "admin_decision",
    actorIds: [u.annickR.id],
    targetType: "comment",
    targetId: hiddenSpamComment.id,
    createdAt: daysAgo(20),
  }),
];
