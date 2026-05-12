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

  // Tickets
  createTicket(projectId: string, dto: CreateTicketDto): Promise<TicketDto>
  getProjectTickets(projectId: string): Promise<TicketDto[]>
  getTicketById(projectId: string, ticketId: string): Promise<TicketDto>
  updateTicket(projectId: string, ticketId: string, dto: UpdateTicketDto): Promise<TicketDto>

  // Messages
  createMessage(projectId: string, dto: CreateProjectMessageDto): Promise<ProjectMessageDto>
  getProjectMessages(projectId: string): Promise<ProjectMessageDto[]>
}
