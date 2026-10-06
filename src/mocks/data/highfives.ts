import { highfiveSchema, type Highfive } from "@/domain";
import { hoursAgo, minutesAgo } from "./ids";
import { PROJECT_BY_SLUG, PROJECTS } from "./projects";
import * as u from "./users";

function highfive(slug: string, userId: string, givenAt: string): Highfive {
  const project = PROJECT_BY_SLUG.get(slug);
  if (!project) throw new Error(`Projet inconnu dans le jeu de demo : ${slug}`);
  return highfiveSchema.parse({ projectId: project.id, userId, givenAt });
}

/**
 * Lignes explicites : celles que racontent les notifications d'alex.rivera et
 * les highfives qu'il a lui-même donnés (le bouton s'affiche « donné »).
 */
const EXPLICIT: Highfive[] = [
  // "Sophie et 4 autres ont highfivé Fresque murale collaborative il y a 10 min"
  highfive("fresque-murale-collaborative", u.sophieMartin.id, minutesAgo(10)),
  highfive("fresque-murale-collaborative", u.thomasDupont.id, minutesAgo(12)),
  highfive("fresque-murale-collaborative", u.claraMartinez.id, minutesAgo(15)),
  highfive("fresque-murale-collaborative", u.lisaMoreau.id, minutesAgo(20)),
  highfive("fresque-murale-collaborative", u.enzoB.id, minutesAgo(22)),
  highfive("maree-basse-jeu-video", u.alexRivera.id, hoursAgo(5)),
  highfive("maree-basse-jeu-video", u.sophieMartin.id, hoursAgo(6)),
  highfive("jardin-partage-derriere-lecole", u.alexRivera.id, hoursAgo(30)),
  highfive("jardin-partage-derriere-lecole", u.sophieMartin.id, hoursAgo(31)),
  highfive("jardin-partage-derriere-lecole", u.mathildeD.id, hoursAgo(33)),
  highfive("repair-cafe-du-mois", u.alexRivera.id, hoursAgo(50)),
  highfive("carte-des-bancs-publics", u.yasmineT.id, hoursAgo(120)),
  highfive("carte-des-bancs-publics", u.sophieMartin.id, hoursAgo(122)),
  highfive("carte-des-bancs-publics", u.karimHaddad.id, hoursAgo(125)),
  highfive("cine-club-de-quartier", u.alexRivera.id, hoursAgo(200)),
  highfive("chorale-improvisee-du-mardi", u.alexRivera.id, hoursAgo(310)),
  highfive("podcast-des-metiers-oublies", u.alexRivera.id, hoursAgo(420)),
  highfive("verger-conservatoire", u.alexRivera.id, hoursAgo(900)),
];

/** Personnes susceptibles de highfiver : comptes actifs (ni suspendu, ni supprimé). */
const GIVERS = u.USERS.filter(
  (user) => user.accountStatus === "active" && user.id !== u.alexRivera.id,
);
const GENERATED_PER_PROJECT = 8;

/**
 * R-H1/R-H3 : chaque projet reçoit quelques highfives réels, répartis dans le
 * temps (le plus récent d'abord) à partir d'un point de départ qui change d'un
 * projet à l'autre, sans jamais donner deux fois et sans que le porteur
 * highfive son propre projet (R-H2). `project.highfiveCount` (doc 23) reste un
 * compteur serveur indépendant (R-X2) : il dépasse les lignes ci-dessous,
 * comme sur une plateforme qui a plus d'historique que ce que le jeu de démo
 * peut représenter.
 */
function generated(): Highfive[] {
  const rows: Highfive[] = [];
  const taken = new Set(EXPLICIT.map((h) => `${h.projectId}:${h.userId}`));
  PROJECTS.forEach((project, projectIndex) => {
    const target = Math.min(project.highfiveCount, GENERATED_PER_PROJECT);
    const existing = EXPLICIT.filter((h) => h.projectId === project.id).length;
    let added = 0;
    for (
      let step = 0;
      step < GIVERS.length && existing + added < target;
      step++
    ) {
      const giver = GIVERS[(projectIndex * 3 + step) % GIVERS.length]!;
      const key = `${project.id}:${giver.id}`;
      if (giver.id === project.ownerId || taken.has(key)) continue;
      taken.add(key);
      const wanted = hoursAgo(14 + added * 41 + projectIndex * 7);
      const floor = [project.createdAt, giver.createdAt].sort().at(-1)!;
      rows.push(
        highfiveSchema.parse({
          projectId: project.id,
          userId: giver.id,
          givenAt: wanted < floor ? floor : wanted,
        }),
      );
      added += 1;
    }
  });
  return rows;
}

export const HIGHFIVES: Highfive[] = [...EXPLICIT, ...generated()];
