import { highfiveSchema, type Highfive } from "@/domain";
import { hoursAgo, minutesAgo } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

function highfive(slug: string, userId: string, givenAt: string): Highfive {
  const project = PROJECT_BY_SLUG.get(slug);
  if (!project) throw new Error(`Projet inconnu dans le jeu de demo : ${slug}`);
  return highfiveSchema.parse({ projectId: project.id, userId, givenAt });
}

/**
 * R-H1/R-H3 : quelques lignes reelles pour rendre le bouton "Highfive"
 * interactif en demo. `project.highfiveCount` (doc 23) reste un compteur
 * independant, calcule cote serveur (R-X2) — il ne cherche pas a egaler le
 * nombre de lignes ici, comme sur une vraie plateforme avec plus d'historique
 * que ce que le jeu de demo peut representer. Ecart documente au rapport.
 */
export const HIGHFIVES: Highfive[] = [
  // "Sophie et 4 autres ont highfive Fresque murale collaborative il y a 10 min"
  highfive("fresque-murale-collaborative", u.sophieMartin.id, minutesAgo(10)),
  highfive("fresque-murale-collaborative", u.thomasDupont.id, minutesAgo(12)),
  highfive("fresque-murale-collaborative", u.claraMartinez.id, minutesAgo(15)),
  highfive("fresque-murale-collaborative", u.lisaMoreau.id, minutesAgo(20)),
  highfive("fresque-murale-collaborative", u.enzoB.id, minutesAgo(22)),
  highfive("maree-basse-jeu-video", u.alexRivera.id, hoursAgo(5)),
  highfive("maree-basse-jeu-video", u.sophieMartin.id, hoursAgo(6)),
  highfive("jardin-partage-derriere-lecole", u.alexRivera.id, hoursAgo(30)),
  highfive("repair-cafe-du-mois", u.alexRivera.id, hoursAgo(50)),
];
