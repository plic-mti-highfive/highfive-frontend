import {
  adminActionSchema,
  reportSchema,
  type AdminAction,
  type Report,
} from "@/domain";
import {
  COMMENTS,
  criticalComment,
  hiddenSpamComment,
  spamComment,
} from "./comments";
import { daysAgo, hoursAgo, nextId } from "./ids";
import * as u from "./users";

const rudeComment = COMMENTS.find(
  (c) => c.authorId === u.compteSupprime.id && c.body.startsWith("Franchement"),
)!;

/**
 * File de modération (doc 23 §11, R-S2) : trois signalements distincts sur la
 * même cible la remontent en tête de file ; quatre signalements en attente au
 * total. Les signalements traités (acceptés ou rejetés) y côtoient ces
 * lignes pour montrer l'historique.
 */
export const REPORTS: Report[] = [
  // En attente : un commentaire de démarchage, signalé trois fois.
  reportSchema.parse({
    id: nextId(),
    reporterId: u.yanisF.id,
    targetType: "comment",
    targetId: spamComment.id,
    reason: "spam",
    detail: "Même texte que sur d'autres fiches, avec un lien de démarchage.",
    status: "new",
    createdAt: hoursAgo(4),
  }),
  reportSchema.parse({
    id: nextId(),
    reporterId: u.nadiaK.id,
    targetType: "comment",
    targetId: spamComment.id,
    reason: "spam",
    status: "new",
    createdAt: hoursAgo(3),
  }),
  reportSchema.parse({
    id: nextId(),
    reporterId: u.enzoB.id,
    targetType: "comment",
    targetId: spamComment.id,
    reason: "spam",
    status: "new",
    createdAt: hoursAgo(1),
  }),
  // En attente : un commentaire désagréable, signalé une seule fois.
  reportSchema.parse({
    id: nextId(),
    reporterId: u.hugoLemaire.id,
    targetType: "comment",
    targetId: rudeComment.id,
    reason: "other",
    detail: "Ton agressif et décourageant envers un projet qui démarre.",
    status: "new",
    createdAt: hoursAgo(150),
  }),
  // Traité : le commentaire de démarchage masqué, puis le compte suspendu.
  reportSchema.parse({
    id: nextId(),
    reporterId: u.sophieMartin.id,
    targetType: "comment",
    targetId: hiddenSpamComment.id,
    reason: "spam",
    status: "handled",
    handledBy: u.annickR.id,
    createdAt: hoursAgo(690),
  }),
  reportSchema.parse({
    id: nextId(),
    reporterId: u.yanisF.id,
    targetType: "user",
    targetId: u.fabriceV.id,
    reason: "scam",
    detail:
      "Propose des dépannages payants dans les commentaires et les demandes.",
    status: "handled",
    handledBy: u.annickR.id,
    createdAt: hoursAgo(220),
  }),
  // Rejeté : une critique franche n'est pas du harcèlement.
  reportSchema.parse({
    id: nextId(),
    reporterId: u.marcLeroy.id,
    targetType: "comment",
    targetId: criticalComment.id,
    reason: "harassment",
    status: "rejected",
    handledBy: u.annickR.id,
    createdAt: hoursAgo(390),
  }),
  // Rejeté : un compte légitime, signalé comme faux.
  reportSchema.parse({
    id: nextId(),
    reporterId: u.karimHaddad.id,
    targetType: "user",
    targetId: u.oceaneL.id,
    reason: "other",
    detail: "Je crois que ce compte est un faux.",
    status: "rejected",
    handledBy: u.annickR.id,
    createdAt: daysAgo(15),
  }),
];

/** R-S4 : journal d'action passé, distinct des signalements en attente ci-dessus. */
export const ADMIN_ACTIONS: AdminAction[] = [
  adminActionSchema.parse({
    id: nextId(),
    adminId: u.annickR.id,
    type: "suspend_account",
    targetType: "user",
    targetId: u.oceaneL.id,
    reason: "Suspension préventive le temps de vérifier un signalement.",
    createdAt: daysAgo(14),
  }),
  adminActionSchema.parse({
    id: nextId(),
    adminId: u.annickR.id,
    type: "reactivate_account",
    targetType: "user",
    targetId: u.oceaneL.id,
    reason: "Compte légitime, signalement non fondé.",
    createdAt: daysAgo(12),
  }),
  adminActionSchema.parse({
    id: nextId(),
    adminId: u.annickR.id,
    type: "reject_report",
    targetType: "comment",
    targetId: criticalComment.id,
    reason: "Critique recevable, aucune infraction constatée.",
    createdAt: hoursAgo(380),
  }),
  adminActionSchema.parse({
    id: nextId(),
    adminId: u.annickR.id,
    type: "hide_comment",
    targetType: "comment",
    targetId: hiddenSpamComment.id,
    reason: "Démarchage commercial.",
    createdAt: hoursAgo(680),
  }),
  adminActionSchema.parse({
    id: nextId(),
    adminId: u.annickR.id,
    type: "suspend_account",
    targetType: "user",
    targetId: u.fabriceV.id,
    reason: "Démarchage commercial répété après avertissement.",
    createdAt: hoursAgo(200),
  }),
];
