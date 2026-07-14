import { httpClient } from "../../http-client";
import type {
  CanvasSession,
  GenerateTasksResponse,
  ProposedTask,
} from "../../types/canvas.types";
import type { TicketDto } from "../../types/project.types";

/**
 * Le canvas se joue sur deux canaux : le core (HTTP) pour les droits, le token
 * et l'IA ; le serveur canvas (WebSocket) pour le document lui-meme. Ce service
 * ne couvre que le premier.
 */
export class CanvasServiceHttp {
  /** Ouvre la session : cree le canvas au premier acces et renvoie le token WebSocket. */
  async openSession(projectId: string): Promise<CanvasSession> {
    return httpClient.get<CanvasSession>(`/projects/${projectId}/canvas`);
  }

  /** Propose des taches a partir du canvas. Rien n'est cree a ce stade. */
  async generateTasks(
    projectId: string,
    canvasId: string,
  ): Promise<GenerateTasksResponse> {
    return httpClient.post<GenerateTasksResponse>(
      `/projects/${projectId}/canvas/${canvasId}/generate-tasks`,
      {},
    );
  }

  /** Cree les tickets correspondant aux taches que l'utilisateur a retenues. */
  async acceptTasks(
    projectId: string,
    canvasId: string,
    tasks: ProposedTask[],
  ): Promise<TicketDto[]> {
    return httpClient.post<TicketDto[]>(
      `/projects/${projectId}/canvas/${canvasId}/tasks`,
      { tasks },
    );
  }
}

export const canvasService = new CanvasServiceHttp();
