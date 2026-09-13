import { notificationSchema, type Notification } from "@/domain";
import { COMMENTS } from "./comments";
import { canalFresque } from "./conversations";
import { hoursAgo, daysAgo, minutesAgo, nextId } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import { TASKS } from "./tasks";
import * as u from "./users";

const fresque = PROJECT_BY_SLUG.get("fresque-murale-collaborative")!;
const album = PROJECT_BY_SLUG.get("album-de-reprises-au-local")!;
const repairCafe = PROJECT_BY_SLUG.get("repair-cafe-du-mois")!;

const thomasComment = COMMENTS.find((c) => c.authorId === u.thomasDupont.id)!;
const repeindreMurNord = TASKS.find(
  (t) => t.title === "Repeindre le mur nord",
)!;

function notification(input: Omit<Notification, "id" | "read">): Notification {
  return notificationSchema.parse({ id: nextId(), ...input, read: false });
}

/**
 * Doc 23 §8, destinataire alex.rivera (utilisateur connecte de demo). Deux
 * libelles du doc referencent "alex.rivera" ou "marc.leroy" comme acteurs
 * de facon ambigue avec les roles fixes dans ce jeu de demo (alex = porteur
 * de Fresque murale, marc = porteur d'Album de reprises) ; adaptes pour
 * rester coherents avec les appartenances (voir rapport, ecarts).
 */
export const NOTIFICATIONS: Notification[] = [
  // "Sophie et 4 autres ont highfive Fresque murale collaborative"
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
  }),
  // "Camille t'a mentionné dans Le Canal de Fresque murale"
  notification({
    recipientId: u.alexRivera.id,
    type: "mention",
    actorIds: [u.camillePetit.id],
    targetType: "message",
    targetId: canalFresque.id,
    createdAt: daysAgo(3),
  }),
];
