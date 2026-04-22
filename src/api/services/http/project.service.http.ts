import type { IProjectService } from '../interfaces'
import type {
  ProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectMemberDto,
  AddProjectMemberDto,
  UpdateProjectMemberDto,
  TaskDto,
  CreateTaskDto,
  UpdateTaskDto,
  ListProjectsQuery,
  PaginatedResponse,
  ProjectMessageDto,
  CreateProjectMessageDto,
} from '../../types'
import { httpClient } from '../../http-client'

export class ProjectServiceHttp implements IProjectService {
  // Projects
  async createProject(dto: CreateProjectDto): Promise<ProjectDto> {
    return httpClient.post<ProjectDto>('/projects', dto)
  }

  async getProjects(query?: ListProjectsQuery): Promise<PaginatedResponse<ProjectDto>> {
    return httpClient.get<PaginatedResponse<ProjectDto>>('/projects', {
      params: query as Record<string, string | number | boolean>,
    })
  }

  async getProjectById(id: string): Promise<ProjectDto> {
    return httpClient.get<ProjectDto>(`/projects/${id}`)
  }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<ProjectDto> {
    return httpClient.patch<ProjectDto>(`/projects/${id}`, dto)
  }

  async deleteProject(id: string): Promise<void> {
    return httpClient.delete(`/projects/${id}`)
  }

  // Members
  async getProjectMembers(projectId: string): Promise<ProjectMemberDto[]> {
    return httpClient.get<ProjectMemberDto[]>(`/projects/${projectId}/members`)
  }

  async addProjectMember(
    projectId: string,
    dto: AddProjectMemberDto,
  ): Promise<ProjectMemberDto> {
    return httpClient.post<ProjectMemberDto>(`/projects/${projectId}/members`, dto)
  }

  async updateProjectMember(
    projectId: string,
    userId: string,
    dto: UpdateProjectMemberDto,
  ): Promise<ProjectMemberDto> {
    return httpClient.patch<ProjectMemberDto>(`/projects/${projectId}/members/${userId}`, dto)
  }

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    return httpClient.delete(`/projects/${projectId}/members/${userId}`)
  }

  // Tasks
  async createTask(projectId: string, dto: CreateTaskDto): Promise<TaskDto> {
    return httpClient.post<TaskDto>(`/projects/${projectId}/tasks`, dto)
  }

  async getProjectTasks(projectId: string): Promise<TaskDto[]> {
    return httpClient.get<TaskDto[]>(`/projects/${projectId}/tasks`)
  }

  async getTaskById(projectId: string, taskId: string): Promise<TaskDto> {
    return httpClient.get<TaskDto>(`/projects/${projectId}/tasks/${taskId}`)
  }

  async updateTask(
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskDto> {
    return httpClient.patch<TaskDto>(`/projects/${projectId}/tasks/${taskId}`, dto)
  }

  // Messages
  async createMessage(projectId: string, dto: CreateProjectMessageDto): Promise<ProjectMessageDto> {
    return httpClient.post<ProjectMessageDto>(`/projects/${projectId}/messages`, dto)
  }

  async getProjectMessages(projectId: string): Promise<ProjectMessageDto[]> {
    return httpClient.get<ProjectMessageDto[]>(`/projects/${projectId}/messages`)
  }
}
