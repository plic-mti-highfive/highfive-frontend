/**
 * Projet tel que l'affichent les cartes.
 *
 * `successRate` et `daysLeft` ont ete retires : le backend n'expose ni date de
 * fin ni notion de reussite, et aucun ecran ne les affichait. Chaque feature
 * les remplissait donc avec une constante differente (100 sur l'accueil, 0
 * ailleurs) — une donnee inventee, jamais lue. Le jour ou le domaine portera
 * ces notions, elles reviendront ici alimentees par l'API.
 */
export interface Project {
  id: number | string;
  name: string;
  description: string;
  tags?: string[];
  author: string;
  authorId?: string;
  authorAvatar?: string;
  contributorsCount: number;
  highfiveCount?: number;
  thumbnailUrl?: string;
}
