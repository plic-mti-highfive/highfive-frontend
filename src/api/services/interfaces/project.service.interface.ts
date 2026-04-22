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

export interface IProjectService {
  // Projects
  createProject(dto: CreateProjectDto): Promise<ProjectDto>
  getProjects(query?: ListProjectsQuery): Promise<PaginatedResponse<ProjectDto>>
  getProjectById(id: string): Promise<ProjectDto>
  updateProject(id: string, dto: UpdateProjectDto): Promise<ProjectDto>
  deleteProject(id: string): Promise<void>

  // Members
  getProjectMembers(projectId: string): Promise<ProjectMemberDto[]>
  addProjectMember(projectId: string, dto: AddProjectMemberDto): Promise<ProjectMemberDto>
  updateProjectMember(
    projectId: string,
    userId: string,
    dto: UpdateProjectMemberDto,
  ): Promise<ProjectMemberDto>
  removeProjectMember(projectId: string, userId: string): Promise<void>

  // Tasks
  createTask(projectId: string, dto: CreateTaskDto): Promise<TaskDto>
  getProjectTasks(projectId: string): Promise<TaskDto[]>
  getTaskById(projectId: string, taskId: string): Promise<TaskDto>
  updateTask(projectId: string, taskId: string, dto: UpdateTaskDto): Promise<TaskDto>

  // Messages
  createMessage(projectId: string, dto: CreateProjectMessageDto): Promise<ProjectMessageDto>
  getProjectMessages(projectId: string): Promise<ProjectMessageDto[]>
}
