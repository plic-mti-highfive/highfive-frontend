import { DEMO_NOW } from "./ids";

/**
 * Doc 23 §11 : "courbe irreguliere entre 2 et 14 par jour, pic a 14 le jour
 * d'un article local." Cette courbe represente l'historique complet de la
 * plateforme (30 jours), independant du nombre de comptes reellement
 * modelises dans ce jeu de demo (12) — ecart documente dans le rapport :
 * le reste des `usersCount`/`activeProjectsCount` de `/api/admin/stats` est
 * calcule en direct depuis le store mock, seule cette serie reste
 * synthetique.
 */
const PATTERN = [
  3, 4, 2, 5, 6, 4, 3, 5, 7, 6, 4, 3, 2, 5, 6, 14, 8, 5, 4, 3, 6, 7, 5, 4, 3, 2,
  4, 5, 6, 4,
];

export const SIGNUPS_LAST_30_DAYS: { date: string; count: number }[] =
  PATTERN.map((count, index) => {
    const daysFromStart = PATTERN.length - 1 - index;
    const date = new Date(
      DEMO_NOW.getTime() - daysFromStart * 24 * 60 * 60 * 1000,
    );
    return { date: date.toISOString().slice(0, 10), count };
  });
