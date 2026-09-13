import {
  invitationSchema,
  joinRequestSchema,
  type Invitation,
  type JoinRequest,
} from "@/domain";
import { daysAgo, hoursAgo, nextId } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

const fresque = PROJECT_BY_SLUG.get("fresque-murale-collaborative")!;
const album = PROJECT_BY_SLUG.get("album-de-reprises-au-local")!;

/** "marc.leroy veut rejoindre Fresque murale collaborative" (doc 23 §8) — mais marc est deja co-porteur dans ce jeu de demo, donc c'est yanis.f qui postule ici pour rester coherent avec les appartenances. */
export const JOIN_REQUESTS: JoinRequest[] = [
  joinRequestSchema.parse({
    id: nextId(),
    projectId: fresque.id,
    userId: u.yanisF.id,
    message: "Je peux aider le samedi, j'ai un peu de temps ce mois-ci.",
    status: "pending",
    createdAt: hoursAgo(2),
  }),
  joinRequestSchema.parse({
    id: nextId(),
    projectId: fresque.id,
    userId: u.enzoB.id,
    status: "accepted",
    createdAt: daysAgo(30),
  }),
];

/** "alex.rivera t'invite dans Album de reprises au local" (doc 23 §8) : ici marc, porteur du projet, invite alex. */
export const INVITATIONS: Invitation[] = [
  invitationSchema.parse({
    id: nextId(),
    projectId: album.id,
    senderId: u.marcLeroy.id,
    recipientId: u.alexRivera.id,
    proposedRole: "member",
    message: "On a besoin d'un batteur, tu serais parfait.",
    status: "pending",
    expiresAt: daysAgo(-25), // dans 25 jours
    createdAt: daysAgo(1),
  }),
];
