import {
  invitationSchema,
  joinRequestSchema,
  type Invitation,
  type JoinRequest,
} from "@/domain";
import type { DbUser } from "../db";
import { daysAgo, hoursAgo, nextId } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

function project(slug: string) {
  const found = PROJECT_BY_SLUG.get(slug);
  if (!found) throw new Error(`Projet inconnu dans le jeu de demo : ${slug}`);
  return found;
}

function joinRequest(input: {
  slug: string;
  user: DbUser;
  status: JoinRequest["status"];
  createdAt: string;
  message?: string;
}): JoinRequest {
  return joinRequestSchema.parse({
    id: nextId(),
    projectId: project(input.slug).id,
    userId: input.user.id,
    message: input.message,
    status: input.status,
    createdAt: input.createdAt,
  });
}

/**
 * Demandes pour rejoindre un projet. `pending` : celles que le porteur voit
 * dans son onglet Équipe ; `accepted` : l'historique (la ligne d'appartenance
 * correspondante existe dans `memberships.ts`) ; `rejected` : refus, sans
 * motif, comme sur la plateforme.
 */
export const JOIN_REQUESTS: JoinRequest[] = [
  // Fresque : yanis.f postule (notification actionnable d'alex.rivera).
  joinRequest({
    slug: "fresque-murale-collaborative",
    user: u.yanisF,
    status: "pending",
    createdAt: hoursAgo(2),
    message: "Je peux aider le samedi, j'ai un peu de temps ce mois-ci.",
  }),
  joinRequest({
    slug: "fresque-murale-collaborative",
    user: u.enzoB,
    status: "accepted",
    createdAt: daysAgo(30),
  }),

  joinRequest({
    slug: "maree-basse-jeu-video",
    user: u.baptisteN,
    status: "pending",
    createdAt: daysAgo(1),
    message:
      "Je joue de la guitare et un peu de synthé, je peux proposer de la musique d'ambiance. J'ai un petit studio chez moi.",
  }),
  joinRequest({
    slug: "maree-basse-jeu-video",
    user: u.hugoLemaire,
    status: "accepted",
    createdAt: daysAgo(14),
    message:
      "Je connais un peu Godot, je peux relire du code et chasser des bugs.",
  }),
  joinRequest({
    slug: "maree-basse-jeu-video",
    user: u.yasmineT,
    status: "accepted",
    createdAt: daysAgo(11),
    message:
      "Les épaves, les algues : je peux dessiner des décors si vous voulez.",
  }),
  joinRequest({
    slug: "repair-cafe-du-mois",
    user: u.karimHaddad,
    status: "pending",
    createdAt: daysAgo(3),
    message:
      "Je ne sais pas souder, mais je sais écouter, tenir la lampe et servir le café.",
  }),
  joinRequest({
    slug: "repair-cafe-du-mois",
    user: u.fabriceV,
    status: "rejected",
    createdAt: daysAgo(9),
    message:
      "Bonjour, je propose mes services de dépannage rapide à domicile, tarifs sur demande.",
  }),
  joinRequest({
    slug: "repair-cafe-du-mois",
    user: u.hugoLemaire,
    status: "accepted",
    createdAt: daysAgo(62),
    message: "Je viens avec mon fer à souder et une grande curiosité.",
  }),
  joinRequest({
    slug: "jardin-partage-derriere-lecole",
    user: u.mathildeD,
    status: "accepted",
    createdAt: daysAgo(63),
    message: "J'habite à deux rues, j'aimerais un coin pour mes aromatiques.",
  }),
  joinRequest({
    slug: "jardin-partage-derriere-lecole",
    user: u.karimHaddad,
    status: "rejected",
    createdAt: daysAgo(20),
    message: "Je voudrais un bac pour mes tomates.",
  }),
  joinRequest({
    slug: "velo-ecole-pour-adultes",
    user: u.amelieVasseur,
    status: "accepted",
    createdAt: daysAgo(102),
    message:
      "Je sais pédaler depuis peu moi-même. Je peux accompagner ceux qui débutent.",
  }),
  joinRequest({
    slug: "remise-en-etat-du-bowl",
    user: u.julienGarnier,
    status: "accepted",
    createdAt: daysAgo(62),
    message: "Le béton, ça me connaît. Je prends la truelle.",
  }),
  joinRequest({
    slug: "verger-conservatoire",
    user: u.oceaneL,
    status: "pending",
    createdAt: daysAgo(2),
    message:
      "Je cherche un projet au long cours. J'ai un petit terrain et du temps le samedi.",
  }),
  joinRequest({
    slug: "cours-de-code-pour-aines",
    user: u.hugoLemaire,
    status: "accepted",
    createdAt: daysAgo(10),
  }),
];

function invitation(input: {
  slug: string;
  sender: DbUser;
  recipient: DbUser;
  role: Invitation["proposedRole"];
  status: Invitation["status"];
  createdDaysAgo: number;
  message?: string;
}): Invitation {
  return invitationSchema.parse({
    id: nextId(),
    projectId: project(input.slug).id,
    senderId: input.sender.id,
    recipientId: input.recipient.id,
    proposedRole: input.role,
    message: input.message,
    status: input.status,
    // Une invitation vit 30 jours.
    expiresAt: daysAgo(input.createdDaysAgo - 30),
    createdAt: daysAgo(input.createdDaysAgo),
  });
}

/** Invitations (projet privé et projets sur demande), dans tous leurs états. */
export const INVITATIONS: Invitation[] = [
  // marc.leroy invite alex.rivera (notification actionnable).
  invitation({
    slug: "album-de-reprises-au-local",
    sender: u.marcLeroy,
    recipient: u.alexRivera,
    role: "member",
    status: "pending",
    createdDaysAgo: 1,
    message: "On a besoin d'un batteur, tu serais parfait.",
  }),
  invitation({
    slug: "album-de-reprises-au-local",
    sender: u.marcLeroy,
    recipient: u.nadiaK,
    role: "member",
    status: "accepted",
    createdDaysAgo: 52,
    message: "On cherche une voix pour les chœurs, ça te dit ?",
  }),
  invitation({
    slug: "album-de-reprises-au-local",
    sender: u.marcLeroy,
    recipient: u.baptisteN,
    role: "co_owner",
    status: "accepted",
    createdDaysAgo: 42,
    message: "Tu fais les arrangements avec moi ?",
  }),
  invitation({
    slug: "album-de-reprises-au-local",
    sender: u.marcLeroy,
    recipient: u.hugoLemaire,
    role: "member",
    status: "rejected",
    createdDaysAgo: 30,
    message: "On a besoin d'un coup de main pour les pistes.",
  }),
  invitation({
    slug: "album-de-reprises-au-local",
    sender: u.marcLeroy,
    recipient: u.karimHaddad,
    role: "observer",
    status: "expired",
    createdDaysAgo: 58,
  }),
  invitation({
    slug: "verger-conservatoire",
    sender: u.camillePetit,
    recipient: u.paulMercier,
    role: "co_owner",
    status: "accepted",
    createdDaysAgo: 152,
    message: "Tu connais les variétés anciennes mieux que personne.",
  }),
];
