import { useState, useEffect } from "react";
import type {
  ProjectDto,
  ProjectMemberDto,
  TicketDto,
  ProjectMessageDto,
} from "@/api/types";
import { projectService } from "@/api/services";

export function useProjectDetail(projectId: string) {
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [members, setMembers] = useState<ProjectMemberDto[]>([]);
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [messages, setMessages] = useState<ProjectMessageDto[]>([]);
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
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProjectData();
  }, [projectId]);

  return { project, members, tickets, messages, isLoading, error };
}
