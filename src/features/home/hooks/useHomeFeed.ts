import { useMemo } from "react";
import type { ProjectDto } from "@/api/types";
import type { Project } from "@shared/types";
import { adaptProjects } from "@shared/utils/projectAdapter";
import { useHomeProjects } from "./useHomeProjects";
import { useHomeTrendingAndRecommended } from "./useHomeTrendingAndRecommended";

const FEED_SIZE = 4;

/**
 * Compose le fil de la page d'accueil.
 *
 * Centralise ici parce que c'est le seul point qui voit a la fois les sections
 * issues du catalogue et celles du service de recommandation : tant que chaque
 * hook deduplicait dans son coin, le projet mis en avant reapparaissait dans
 * « Projets tendance » et les listes se recoupaient. Les sections se servent
 * dans l'ordre d'affichage, chacune ignorant ce que les precedentes ont pris.
 */
export function useHomeFeed() {
  const { byHighfives, byTeamSize, byDate, isLoading, error } =
    useHomeProjects();
  // Les recommandations n'alimentent que deux sections : leur indisponibilite
  // ne doit pas faire echouer la page, ces sections disparaissent simplement.
  const { recommended, trending } = useHomeTrendingAndRecommended();

  return useMemo(() => {
    const seen = new Set<string>();

    const take = (source: ProjectDto[], count: number): Project[] => {
      const picked: ProjectDto[] = [];
      for (const dto of source) {
        if (picked.length === count) break;
        if (seen.has(dto.id)) continue;
        seen.add(dto.id);
        picked.push(dto);
      }
      return adaptProjects(picked);
    };

    const takeAdapted = (source: Project[], count: number): Project[] => {
      const picked: Project[] = [];
      for (const project of source) {
        if (picked.length === count) break;
        const id = String(project.id);
        if (seen.has(id)) continue;
        seen.add(id);
        picked.push(project);
      }
      return picked;
    };

    // L'ordre des appels suit l'ordre d'affichage de la page.
    return {
      featured: take(byHighfives, 1)[0] ?? null,
      recommended: takeAdapted(recommended, FEED_SIZE),
      trending: takeAdapted(trending, FEED_SIZE),
      popular: take(byHighfives, FEED_SIZE),
      active: take(byTeamSize, FEED_SIZE),
      recent: take(byDate, FEED_SIZE),
      isLoading,
      error,
    };
  }, [
    byHighfives,
    byTeamSize,
    byDate,
    recommended,
    trending,
    isLoading,
    error,
  ]);
}
