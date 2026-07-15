import { useState, useEffect } from "react";
import type {
  ProjectDto,
  ProjectMemberDto,
  TicketDto,
  ProjectMessageDto,
} from "@/api/types";
import { projectService } from "@/api/services";

const SIMILAR_LIMIT = 4;

export function useProjectDetail(projectId: string) {
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [members, setMembers] = useState<ProjectMemberDto[]>([]);
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [messages, setMessages] = useState<ProjectMessageDto[]>([]);
  const [similarProjects, setSimilarProjects] = useState<ProjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjectData() {
      try {
        setIsLoading(true);
        setError(null);

        const [projectData, membersData, ticketsData, messagesData] =
          await Promise.all([
            projectService.getProjectById(projectId),
            projectService.getProjectMembers(projectId),
            projectService.getProjectTickets(projectId),
            projectService.getProjectMessages(projectId),
          ]);

        setProject(projectData);
        setMembers(membersData);
        setTickets(ticketsData);
        setMessages(messagesData);
        setSimilarProjects(await loadSimilar(projectData));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
      } finally {
        setIsLoading(false);
      }
    }

    /**
     * Projets partageant au moins un tag, le projet courant exclu. La page
     * affichait auparavant quatre projets fabriques a la main (« Projet Open
     * Source similaire 1 »…) dont les identifiants ne menaient nulle part.
     * Faute de tags, la section reste vide plutot que d'inventer du contenu.
     */
    async function loadSimilar(current: ProjectDto): Promise<ProjectDto[]> {
      const tags = current.tags ?? [];
      if (tags.length === 0) return [];

      try {
        const response = await projectService.getProjects({
          tags: [tags[0]],
          limit: SIMILAR_LIMIT + 1,
        });
        return response.data
          .filter((p) => p.id !== current.id)
          .slice(0, SIMILAR_LIMIT);
      } catch {
        // Section secondaire : son echec ne doit pas emporter la page projet.
        return [];
      }
    }

    loadProjectData();
  }, [projectId]);

  return {
    project,
    members,
    tickets,
    messages,
    similarProjects,
    isLoading,
    error,
  };
}
