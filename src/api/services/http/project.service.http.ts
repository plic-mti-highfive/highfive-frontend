import type { IProjectService } from "../interfaces";
import type {
  ProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectMemberDto,
  AddProjectMemberDto,
  UpdateProjectMemberDto,
  TicketDto,
  CreateTicketDto,
  UpdateTicketDto,
  ListProjectsQuery,
  PaginatedResponse,
  ProjectMessageDto,
  CreateProjectMessageDto,
} from "../../types";
import { httpClient } from "../../http-client";

export class ProjectServiceHttp implements IProjectService {
  // Projects
  async createProject(dto: CreateProjectDto): Promise<ProjectDto> {
    return httpClient.post<ProjectDto>("/projects", dto);
  }

  async getProjects(
    query?: ListProjectsQuery,
  ): Promise<PaginatedResponse<ProjectDto>> {
    const { page, limit, ...rest } = query ?? {};
    const resolvedLimit = limit ?? 20;
    const offset = page !== undefined ? (page - 1) * resolvedLimit : 0;
    return httpClient.get<PaginatedResponse<ProjectDto>>("/projects", {
      params: { ...rest, offset, limit: resolvedLimit } as Record<
        string,
        string | number | boolean
      >,
    });
  }

  async getProjectById(id: string): Promise<ProjectDto> {
    return httpClient.get<ProjectDto>(`/projects/${id}`);
  }

  async getProjectsByIds(ids: string[]): Promise<ProjectDto[]> {
    if (ids.length === 0) {
      return [];
    }
    return httpClient.post<ProjectDto[]>("/projects/batch", { ids });
  }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<ProjectDto> {
    return httpClient.patch<ProjectDto>(`/projects/${id}`, dto);
  }

  async deleteProject(id: string): Promise<void> {
    return httpClient.delete(`/projects/${id}`);
  }

  // Members
  async getProjectMembers(projectId: string): Promise<ProjectMemberDto[]> {
    return httpClient.get<ProjectMemberDto[]>(`/projects/${projectId}/members`);
  }

  async addProjectMember(
    projectId: string,
    dto: AddProjectMemberDto,
  ): Promise<ProjectMemberDto> {
    return httpClient.post<ProjectMemberDto>(
      `/projects/${projectId}/members`,
      dto,
    );
  }

  async updateProjectMember(
    projectId: string,
    userId: string,
    dto: UpdateProjectMemberDto,
  ): Promise<ProjectMemberDto> {
    return httpClient.patch<ProjectMemberDto>(
      `/projects/${projectId}/members/${userId}`,
      dto,
    );
  }

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    return httpClient.delete(`/projects/${projectId}/members/${userId}`);
  }

  // Tickets
  async createTicket(
    projectId: string,
    dto: CreateTicketDto,
  ): Promise<TicketDto> {
    return httpClient.post<TicketDto>(`/projects/${projectId}/tickets`, dto);
  }

  async getProjectTickets(projectId: string): Promise<TicketDto[]> {
    const response = await httpClient.get<PaginatedResponse<TicketDto>>(
      `/projects/${projectId}/tickets`,
    );
    return response.data;
  }

  async getTicketById(projectId: string, ticketId: string): Promise<TicketDto> {
    return httpClient.get<TicketDto>(
      `/projects/${projectId}/tickets/${ticketId}`,
    );
  }

  async updateTicket(
    projectId: string,
    ticketId: string,
    dto: UpdateTicketDto,
  ): Promise<TicketDto> {
    return httpClient.patch<TicketDto>(
      `/projects/${projectId}/tickets/${ticketId}`,
      dto,
    );
  }

  // Messages
  async createMessage(
    projectId: string,
    dto: CreateProjectMessageDto,
  ): Promise<ProjectMessageDto> {
    return httpClient.post<ProjectMessageDto>(
      `/projects/${projectId}/messages`,
      dto,
    );
  }

  async getProjectMessages(projectId: string): Promise<ProjectMessageDto[]> {
    return httpClient.get<ProjectMessageDto[]>(
      `/projects/${projectId}/messages`,
    );
  }
}
