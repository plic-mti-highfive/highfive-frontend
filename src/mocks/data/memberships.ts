import { membershipSchema, type Membership } from "@/domain";
import type { DbUser } from "../db";
import { daysAgo } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

type Role = Membership["role"];
type TeamEntry = [user: DbUser, role: Role, joinedDaysAgo: number];

const USER_BY_ID = new Map(u.USERS.map((user) => [user.id, user]));

/**
 * Une personne ne peut pas avoir rejoint un projet avant qu'il existe, ni
 * avant d'avoir créé son compte : `joinedAt` est borné par les deux dates.
 */
function joinedAt(
  projectCreatedAt: string,
  userId: string,
  joinedDaysAgo: number,
): string {
  const floor = [projectCreatedAt, USER_BY_ID.get(userId)?.createdAt ?? ""]
    .sort()
    .at(-1)!;
  const wanted = daysAgo(joinedDaysAgo);
  return wanted < floor ? floor : wanted;
}

/**
 * R-M1 : exactement un `owner` par projet, ajouté automatiquement à partir de
 * `Project.ownerId`. Les autres rôles sont décrits ici, projet par projet. Les
 * compteurs affichés (`membersCount`, avatars de la carte) sont calculés sur
 * ces lignes : un projet dont l'équipe est vide a l'air abandonné.
 */
const TEAMS: Record<string, TeamEntry[]> = {
  "fresque-murale-collaborative": [
    [u.marcLeroy, "co_owner", 80],
    [u.camillePetit, "member", 60],
    [u.thomasDupont, "member", 40],
    [u.enzoB, "member", 29],
    [u.sophieMartin, "member", 25],
    [u.yasmineT, "member", 45],
    [u.claraMartinez, "observer", 10],
  ],
  "jardin-partage-derriere-lecole": [
    [u.annickR, "member", 200],
    [u.alexRivera, "member", 180],
    [u.paulMercier, "co_owner", 170],
    [u.amelieVasseur, "member", 120],
    [u.sophieMartin, "member", 90],
    [u.mathildeD, "member", 60],
    [u.julienGarnier, "observer", 30],
  ],
  "maree-basse-jeu-video": [
    [u.enzoB, "co_owner", 38],
    [u.marcLeroy, "member", 30],
    [u.lisaMoreau, "member", 20],
    [u.alexRivera, "member", 16],
    [u.hugoLemaire, "member", 12],
    [u.yasmineT, "member", 9],
  ],
  "repair-cafe-du-mois": [
    [u.julienGarnier, "co_owner", 250],
    [u.alexRivera, "member", 120],
    [u.yanisF, "member", 150],
    [u.enzoB, "member", 100],
    [u.hugoLemaire, "member", 60],
  ],
  "distribution-de-soupe-lhiver": [
    [u.amelieVasseur, "co_owner", 220],
    [u.claraMartinez, "member", 200],
    [u.lisaMoreau, "member", 150],
    [u.camillePetit, "member", 120],
    [u.karimHaddad, "member", 40],
    [u.alexRivera, "observer", 100],
  ],
  "cine-club-de-quartier": [
    [u.lisaMoreau, "member", 100],
    [u.yasmineT, "member", 90],
    [u.baptisteN, "member", 70],
    [u.karimHaddad, "member", 60],
    [u.sophieMartin, "member", 20],
  ],
  "podcast-des-metiers-oublies": [
    [u.karimHaddad, "member", 55],
    [u.marcLeroy, "member", 50],
    [u.paulMercier, "member", 40],
  ],
  "cours-de-langue-par-echange": [
    [u.annickR, "member", 180],
    [u.karimHaddad, "member", 70],
    [u.amelieVasseur, "member", 90],
    [u.yasmineT, "member", 60],
  ],
  "console-retro-en-bois": [
    [u.julienGarnier, "member", 45],
    [u.yanisF, "member", 40],
    [u.hugoLemaire, "member", 30],
    [u.nadiaK, "member", 20],
  ],
  "album-de-reprises-au-local": [
    [u.nadiaK, "member", 50],
    [u.baptisteN, "co_owner", 40],
  ],
  "remise-en-etat-du-bowl": [
    [u.enzoB, "member", 70],
    [u.julienGarnier, "member", 60],
    [u.thomasDupont, "member", 50],
    [u.alexRivera, "member", 40],
  ],
  "carte-des-bancs-publics": [
    [u.sophieMartin, "member", 30],
    [u.annickR, "observer", 28],
    [u.paulMercier, "member", 25],
    [u.karimHaddad, "member", 20],
    [u.oceaneL, "member", 12],
  ],
  "chorale-improvisee-du-mardi": [
    [u.baptisteN, "co_owner", 80],
    [u.lisaMoreau, "member", 90],
    [u.annickR, "member", 85],
    [u.alexRivera, "member", 60],
    [u.yasmineT, "member", 50],
    [u.camillePetit, "member", 40],
    [u.oceaneL, "member", 30],
  ],
  "refuge-a-herissons": [
    [u.mathildeD, "co_owner", 250],
    [u.paulMercier, "member", 240],
    [u.alexRivera, "member", 230],
    [u.amelieVasseur, "member", 200],
  ],
  "bibliotheque-de-rue": [
    [u.julienGarnier, "co_owner", 360],
    [u.claraMartinez, "member", 350],
    [u.thomasDupont, "member", 330],
    [u.lisaMoreau, "member", 300],
  ],
  "velo-ecole-pour-adultes": [
    [u.amelieVasseur, "member", 100],
    [u.thomasDupont, "member", 90],
    [u.julienGarnier, "member", 80],
    [u.claraMartinez, "member", 70],
    [u.alexRivera, "member", 50],
  ],
  "fanzine-du-lycee": [
    [u.claraMartinez, "co_owner", 105],
    [u.yasmineT, "member", 100],
    [u.karimHaddad, "member", 70],
    [u.sophieMartin, "member", 28],
  ],
  "repair-velo-mobile": [
    [u.julienGarnier, "member", 18],
    [u.yanisF, "member", 15],
    [u.hugoLemaire, "member", 10],
  ],
  "club-dechecs-du-mercredi": [
    [u.hugoLemaire, "member", 70],
    [u.paulMercier, "member", 60],
    [u.karimHaddad, "member", 50],
    [u.thomasDupont, "member", 40],
    [u.baptisteN, "member", 25],
  ],
  "verger-conservatoire": [
    [u.paulMercier, "co_owner", 150],
    [u.mathildeD, "member", 120],
    [u.julienGarnier, "member", 90],
    [u.alexRivera, "member", 40],
  ],
  "atelier-couture-solidaire": [
    [u.amelieVasseur, "member", 40],
    [u.claraMartinez, "member", 35],
    [u.oceaneL, "member", 30],
    [u.yasmineT, "member", 20],
  ],
  "fresques-sonores": [
    [u.baptisteN, "member", 200],
    [u.lisaMoreau, "member", 190],
    [u.sophieMartin, "member", 180],
    [u.alexRivera, "member", 150],
  ],
  "nettoyage-des-berges": [
    [u.paulMercier, "member", 14],
    [u.mathildeD, "member", 12],
    [u.oceaneL, "member", 12],
    [u.camillePetit, "member", 10],
    [u.enzoB, "member", 8],
  ],
  "cours-de-code-pour-aines": [
    [u.hugoLemaire, "member", 9],
    [u.claraMartinez, "member", 8],
    [u.karimHaddad, "member", 7],
  ],
  // "atelier-serigraphie" : brouillon, le porteur est seul.
};

export const MEMBERSHIPS: Membership[] = [];

for (const [slug, project] of PROJECT_BY_SLUG) {
  MEMBERSHIPS.push(
    membershipSchema.parse({
      projectId: project.id,
      userId: project.ownerId,
      role: "owner",
      joinedAt: project.createdAt,
      blocked: false,
    }),
  );
  for (const [user, role, joinedDaysAgo] of TEAMS[slug] ?? []) {
    MEMBERSHIPS.push(
      membershipSchema.parse({
        projectId: project.id,
        userId: user.id,
        role,
        joinedAt: joinedAt(project.createdAt, user.id, joinedDaysAgo),
        blocked: false,
      }),
    );
  }
}
