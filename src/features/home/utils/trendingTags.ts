import type { Project } from "@shared/types";

export interface TrendingTag {
  tag: string;
  count: number;
}

/**
 * Dérive les tags les plus fréquents à partir des projets déjà chargés
 * sur la home page (pas d'endpoint dédié côté API pour l'instant).
 */
export function computeTrendingTags(
  projects: Project[],
  limit = 5,
): TrendingTag[] {
  const counts = new Map<string, number>();

  for (const project of projects) {
    for (const tag of project.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
