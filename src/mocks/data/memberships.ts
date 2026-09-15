import { membershipSchema, type Membership } from "@/domain";
import { daysAgo } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

function membership(
  slug: string,
  userId: string,
  role: Membership["role"],
  joinedDaysAgo: number,
): Membership {
  const project = PROJECT_BY_SLUG.get(slug);
  if (!project) throw new Error(`Projet inconnu dans le jeu de demo : ${slug}`);
  return membershipSchema.parse({
    projectId: project.id,
    userId,
    role,
    joinedAt: daysAgo(joinedDaysAgo),
    blocked: false,
  });
}

/**
 * R-M1 : exactement un `owner` par projet. Chaque projet du jeu de demo a
 * au moins la ligne d'appartenance de son porteur ; les projets 1 a 5 sont
 * etoffes d'une equipe complete pour illustrer l'onglet Equipe et Le Lab.
 */
export const MEMBERSHIPS: Membership[] = [
  // Fresque murale collaborative (6 membres, doc 23 §4/§7)
  membership("fresque-murale-collaborative", u.alexRivera.id, "owner", 90),
  membership("fresque-murale-collaborative", u.sophieMartin.id, "member", 25),
  membership("fresque-murale-collaborative", u.camillePetit.id, "member", 60),
  membership("fresque-murale-collaborative", u.marcLeroy.id, "co_owner", 80),
  membership("fresque-murale-collaborative", u.thomasDupont.id, "member", 40),
  membership(
    "fresque-murale-collaborative",
    u.claraMartinez.id,
    "observer",
    10,
  ),

  // Jardin partage derriere l'ecole
  membership("jardin-partage-derriere-lecole", u.camillePetit.id, "owner", 240),
  membership("jardin-partage-derriere-lecole", u.alexRivera.id, "member", 180),
  membership("jardin-partage-derriere-lecole", u.sophieMartin.id, "member", 90),
  membership("jardin-partage-derriere-lecole", u.annickR.id, "member", 200),

  // Maree basse, jeu video (projet du moment)
  membership("maree-basse-jeu-video", u.nadiaK.id, "owner", 40),
  membership("maree-basse-jeu-video", u.enzoB.id, "co_owner", 38),
  membership("maree-basse-jeu-video", u.marcLeroy.id, "member", 30),
  membership("maree-basse-jeu-video", u.lisaMoreau.id, "member", 20),

  // Repair cafe du mois
  membership("repair-cafe-du-mois", u.thomasDupont.id, "owner", 320),
  membership("repair-cafe-du-mois", u.yanisF.id, "member", 150),
  membership("repair-cafe-du-mois", u.enzoB.id, "member", 100),

  // Distribution de soupe l'hiver
  membership("distribution-de-soupe-lhiver", u.annickR.id, "owner", 260),
  membership("distribution-de-soupe-lhiver", u.claraMartinez.id, "member", 200),
  membership("distribution-de-soupe-lhiver", u.lisaMoreau.id, "member", 150),

  // Album de reprises au local (projet prive de demo)
  membership("album-de-reprises-au-local", u.marcLeroy.id, "owner", 65),
  membership("album-de-reprises-au-local", u.nadiaK.id, "member", 50),
];

/**
 * Pour les autres projets du jeu de demo, seule la ligne d'appartenance du
 * porteur est generee : le detail de l'equipe n'est pas illustre partout
 * (voir le rapport final, ecart documente). `projectSummary.membersCount`
 * reste une valeur affichee independante du nombre de lignes en base, comme
 * tout compteur cote serveur (R-X2).
 */
const OWNER_ONLY_SLUGS = [
  "cine-club-de-quartier",
  "podcast-des-metiers-oublies",
  "cours-de-langue-par-echange",
  "console-retro-en-bois",
  "remise-en-etat-du-bowl",
  "carte-des-bancs-publics",
  "chorale-improvisee-du-mardi",
  "refuge-a-herissons",
  "bibliotheque-de-rue",
  "atelier-serigraphie",
  "velo-ecole-pour-adultes",
  "fanzine-du-lycee",
  "repair-velo-mobile",
  "club-dechecs-du-mercredi",
  "verger-conservatoire",
  "atelier-couture-solidaire",
  "fresques-sonores",
  "nettoyage-des-berges",
  "cours-de-code-pour-aines",
];

for (const slug of OWNER_ONLY_SLUGS) {
  const project = PROJECT_BY_SLUG.get(slug);
  if (!project) continue;
  MEMBERSHIPS.push(
    membershipSchema.parse({
      projectId: project.id,
      userId: project.ownerId,
      role: "owner",
      joinedAt: project.createdAt,
      blocked: false,
    }),
  );
}
