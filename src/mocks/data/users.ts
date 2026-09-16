import { currentUserSchema } from "@/domain";
import type { DbUser } from "../db";
import { daysAgo, hoursAgo, nextId } from "./ids";

/**
 * Personnes du jeu de demo (doc 23 §1). `passwordHash` est en clair : c'est
 * un mock, jamais un vrai hash, jamais expose par un handler.
 */
function avatarFor(username: string): string {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(username)}`;
}

function makeUser(input: {
  username: string;
  displayName?: string;
  email: string;
  bio?: string;
  interests?: string[];
  platformRole?: "member" | "admin";
  accountStatus?: "active" | "suspended" | "deleted";
  createdAt: string;
  lastVisitAt: string;
  password: string;
}): DbUser {
  const user = currentUserSchema.parse({
    id: nextId(),
    username: input.username,
    displayName: input.displayName,
    avatar: avatarFor(input.username),
    bio: input.bio,
    interests: input.interests ?? [],
    email: input.email,
    accountStatus: input.accountStatus ?? "active",
    platformRole: input.platformRole ?? "member",
    createdAt: input.createdAt,
    lastVisitAt: input.lastVisitAt,
  });
  return { ...user, passwordHash: input.password };
}

export const alexRivera = makeUser({
  username: "alex.rivera",
  displayName: "Alex Rivera",
  email: "alex.rivera@example.com",
  bio: "Je peins des murs, surtout ceux qui en ont besoin.",
  interests: ["dessin", "quartier"],
  createdAt: daysAgo(210),
  lastVisitAt: hoursAgo(1),
  password: "demo1234",
});

export const camillePetit = makeUser({
  username: "camille.petit",
  displayName: "Camille Petit",
  email: "camille.petit@example.com",
  bio: "Jardinière du dimanche, très sérieuse le dimanche.",
  interests: ["jardinage", "quartier", "animaux"],
  createdAt: daysAgo(300),
  lastVisitAt: hoursAgo(5),
  password: "demo1234",
});

export const sophieMartin = makeUser({
  username: "sophie.martin",
  displayName: "Sophie Martin",
  email: "sophie.martin@example.com",
  bio: "Nouvelle par ici. Je photographie ce qui se construit.",
  interests: ["photo", "dessin", "quartier"],
  createdAt: daysAgo(28),
  lastVisitAt: hoursAgo(2),
  password: "demo1234",
});

export const thomasDupont = makeUser({
  username: "thomas.dupont",
  displayName: "Thomas Dupont",
  email: "thomas.dupont@example.com",
  bio: "Je répare des choses que les gens allaient jeter.",
  interests: ["reparation", "bricolage"],
  createdAt: daysAgo(400),
  lastVisitAt: daysAgo(5),
  password: "demo1234",
});

export const marcLeroy = makeUser({
  username: "marc.leroy",
  displayName: "Marc Leroy",
  email: "marc.leroy@example.com",
  bio: "Son, montage, et beaucoup trop de câbles.",
  interests: ["musique", "video"],
  createdAt: daysAgo(180),
  lastVisitAt: daysAgo(1),
  password: "demo1234",
});

export const claraMartinez = makeUser({
  username: "clara.martinez",
  displayName: "Clara Martinez",
  email: "clara.martinez@example.com",
  bio: "Prof de maths le jour, chorale le mardi.",
  interests: ["entraide-scolaire", "musique"],
  createdAt: daysAgo(150),
  lastVisitAt: daysAgo(3),
  password: "demo1234",
});

export const lisaMoreau = makeUser({
  username: "lisa.moreau",
  displayName: "Lisa Moreau",
  email: "lisa.moreau@example.com",
  bio: "J'écris des trucs, parfois je les finis.",
  interests: ["ecriture", "histoire"],
  createdAt: daysAgo(120),
  lastVisitAt: daysAgo(2),
  password: "demo1234",
});

export const enzoB = makeUser({
  username: "enzo.b",
  displayName: "Enzo Bailly",
  email: "enzo.b@example.com",
  bio: "Je construis des machins dans le jardin de mes parents.",
  interests: ["bricolage", "jeu-video", "code"],
  createdAt: daysAgo(90),
  lastVisitAt: hoursAgo(8),
  password: "demo1234",
});

export const nadiaK = makeUser({
  username: "nadia.k",
  displayName: "Nadia Kessler",
  email: "nadia.k@example.com",
  bio: "Je code des petits jeux moches mais jouables.",
  interests: ["jeu-video", "code"],
  createdAt: daysAgo(95),
  lastVisitAt: hoursAgo(3),
  password: "demo1234",
});

export const yanisF = makeUser({
  username: "yanis.f",
  displayName: "Yanis Fournier",
  email: "yanis.f@example.com",
  bio: "Skate, béton, et un peu de soudure.",
  interests: ["sport", "bricolage"],
  createdAt: daysAgo(60),
  lastVisitAt: daysAgo(4),
  password: "demo1234",
});

export const annickR = makeUser({
  username: "annick.r",
  displayName: "Annick Roux",
  email: "annick.r@example.com",
  bio: "Je travaille à la mairie et j'essaie de faire se rencontrer les gens.",
  interests: ["quartier", "evenement", "solidarite"],
  platformRole: "admin",
  createdAt: daysAgo(500),
  lastVisitAt: hoursAgo(6),
  password: "demo1234",
});

/** R-P2 : compte supprime, anonymise, contenus detaches. */
export const compteSupprime = makeUser({
  username: "compte-supprime",
  email: `compte-supprime-${nextId()}@deleted.invalid`,
  accountStatus: "deleted",
  createdAt: daysAgo(600),
  lastVisitAt: daysAgo(200),
  password: "",
});

export const USERS: DbUser[] = [
  alexRivera,
  camillePetit,
  sophieMartin,
  thomasDupont,
  marcLeroy,
  claraMartinez,
  lisaMoreau,
  enzoB,
  nadiaK,
  yanisF,
  annickR,
  compteSupprime,
];

/** Utilisateur connecte de demo : alex.rivera@example.com / demo1234 (voir docs/v2/API-ROUTES.md). */
export const DEMO_LOGIN = {
  email: "alex.rivera@example.com",
  password: "demo1234",
};
