import { useState, useEffect, useMemo } from "react";
import { projectService } from "@/api";
import { ProjectStatus } from "@plic-mti-highfive/shared-types";
import type { ProjectDto } from "@/api/types";

/**
 * Charge le catalogue des projets actifs et en tire des classements.
 *
 * Ce hook ne compose pas les sections affichees : c'est le role de
 * `useHomeFeed`, seul endroit a connaitre toutes les listes de la page et donc
 * capable de garantir qu'aucun projet n'y apparait deux fois.
 */
export function useHomeProjects() {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await projectService.getProjects({
          status: ProjectStatus.ACTIVE,
          limit: 50,
        });
        setProjects(response.data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Erreur inconnue lors du chargement des projets";
        const enhancedError = new Error(message);
        enhancedError.stack = err instanceof Error ? err.stack : undefined;
        setError(enhancedError);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  /**
   * Classements sur des criteres reellement disponibles. Les sections etaient
   * auparavant de simples tranches du meme tableau — slice(8, 12) pour « Se
   * terminent bientot », slice(12, 16) pour « Projets qui ont reussi » — sans
   * rapport avec leur titre, et pour cause : le backend n'expose ni date de fin
   * ni notion de reussite.
   */
  const rankings = useMemo(
    () => ({
      byHighfives: [...projects].sort(
        (a, b) => (b.highfiveCount ?? 0) - (a.highfiveCount ?? 0),
      ),
      byTeamSize: [...projects].sort(
        (a, b) => (b.membersCount ?? 0) - (a.membersCount ?? 0),
      ),
      byDate: [...projects].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      ),
    }),
    [projects],
  );

  return { ...rankings, isLoading, error };
}
