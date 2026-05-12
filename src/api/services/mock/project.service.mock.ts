import type { IProjectService } from '../interfaces'
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
import { ProjectStatus, ProjectVisibility, ProjectRole, TicketStatus } from '@plic-mti-highfive/shared-types'
import { delay, generateId } from './utils'
import { getAllProjects } from './data'

class MockProjectDb {
  private projects: Map<string, ProjectDto> = new Map()
  private members: Map<string, ProjectMemberDto[]> = new Map()
  private tickets: Map<string, TicketDto[]> = new Map()
  private messages: Map<string, ProjectMessageDto[]> = new Map()

  constructor() {
    const allProjects = getAllProjects()
    const mockUsers = [
      { id: 'user-1', email: 'marie.dupont@example.com', avatar: null },
      { id: 'user-2', email: 'jean.martin@example.com', avatar: null },
      { id: 'user-3', email: 'sophie.bernard@example.com', avatar: null },
      { id: 'user-4', email: 'lucas.petit@example.com', avatar: null },
    ]

    allProjects.forEach((project, index) => {
      this.projects.set(project.id, project)
      const creatorUser = mockUsers[index % mockUsers.length]
      const member: ProjectMemberDto = {
        projectId: project.id,
        userId: creatorUser.id,
        tenantId: 'default-tenant',
        role: ProjectRole.OWNER,
        createdAt: project.createdAt,
        user: {
          id: creatorUser.id,
          email: creatorUser.email,
          profile: {
            avatarPath: creatorUser.avatar,
          },
        },
      }
      this.members.set(project.id, [member])
    })
  }

  getAllProjects(): ProjectDto[] {
    return Array.from(this.projects.values())
  }

  getProject(id: string): ProjectDto | undefined {
    return this.projects.get(id)
  }

  addProject(project: ProjectDto): void {
    this.projects.set(project.id, project)
  }

  updateProject(id: string, updates: Partial<ProjectDto>): ProjectDto | undefined {
    const existing = this.projects.get(id)
    if (!existing) return undefined
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
    this.projects.set(id, updated)
    return updated
  }

  deleteProject(id: string): boolean {
    return this.projects.delete(id)
  }

  getMembers(projectId: string): ProjectMemberDto[] {
    return this.members.get(projectId) || []
  }

  addMember(projectId: string, member: ProjectMemberDto): void {
    const members = this.members.get(projectId) || []
    members.push(member)
    this.members.set(projectId, members)
  }

  updateMember(
    projectId: string,
    userId: string,
    updates: Partial<ProjectMemberDto>,
  ): ProjectMemberDto | undefined {
    const members = this.members.get(projectId) || []
    const index = members.findIndex((m) => m.userId === userId)
    if (index === -1) return undefined
    const updated = { ...members[index], ...updates }
    members[index] = updated
    this.members.set(projectId, members)
    return updated
  }

  removeMember(projectId: string, userId: string): boolean {
    const members = this.members.get(projectId) || []
    const filtered = members.filter((m) => m.userId !== userId)
    this.members.set(projectId, filtered)
    return filtered.length < members.length
  }

  getTickets(projectId: string): TicketDto[] {
    return this.tickets.get(projectId) || []
  }

  addTicket(projectId: string, ticket: TicketDto): void {
    const tickets = this.tickets.get(projectId) || []
    tickets.push(ticket)
    this.tickets.set(projectId, tickets)
  }

  getTicket(projectId: string, ticketId: string): TicketDto | undefined {
    const tickets = this.tickets.get(projectId) || []
    return tickets.find((t) => t.id === ticketId)
  }

  updateTicket(
    projectId: string,
    ticketId: string,
    updates: Partial<TicketDto>,
  ): TicketDto | undefined {
    const tickets = this.tickets.get(projectId) || []
    const index = tickets.findIndex((t) => t.id === ticketId)
    if (index === -1) return undefined
    const updated = { ...tickets[index], ...updates, updatedAt: new Date().toISOString() }
    tickets[index] = updated
    this.tickets.set(projectId, tickets)
    return updated
  }

  getMessages(projectId: string): ProjectMessageDto[] {
    return this.messages.get(projectId) || []
  }

  addMessage(projectId: string, message: ProjectMessageDto): void {
    const messages = this.messages.get(projectId) || []
    messages.push(message)
    this.messages.set(projectId, messages)
  }
}

const db = new MockProjectDb()

export class ProjectServiceMock implements IProjectService {
  async createProject(dto: CreateProjectDto): Promise<ProjectDto> {
    await delay(500)
    const project: ProjectDto = {
      id: generateId(),
      tenantId: 'default-tenant',
      name: dto.name,
      description: dto.description || null,
      status: dto.status || ProjectStatus.DRAFT,
      visibility: dto.visibility || ProjectVisibility.PRIVATE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    }
    db.addProject(project)
    return project
  }

  async getProjects(query?: ListProjectsQuery): Promise<PaginatedResponse<ProjectDto>> {
    await delay(300)
    let projects = db.getAllProjects()
    if (query?.status) {
      projects = projects.filter((p) => p.status === query.status)
    }
    if (query?.visibility) {
      projects = projects.filter((p) => p.visibility === query.visibility)
    }
    const page = query?.page || 1
    const limit = query?.limit || 20
    const start = (page - 1) * limit
    const paginatedProjects = projects.slice(start, start + limit)
    return {
      data: paginatedProjects,
      total: projects.length,
      page,
      limit,
      totalPages: Math.ceil(projects.length / limit),
    }
  }

  async getProjectById(id: string): Promise<ProjectDto> {
    await delay(200)
    const project = db.getProject(id)
    if (!project) throw new Error('Project not found')
    return project
  }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<ProjectDto> {
    await delay(400)
    const updated = db.updateProject(id, dto)
    if (!updated) throw new Error('Project not found')
    return updated
  }

  async deleteProject(id: string): Promise<void> {
    await delay(300)
    const success = db.deleteProject(id)
    if (!success) throw new Error('Project not found')
  }

  async getProjectMembers(projectId: string): Promise<ProjectMemberDto[]> {
    await delay(200)
    return db.getMembers(projectId)
  }

  async addProjectMember(projectId: string, dto: AddProjectMemberDto): Promise<ProjectMemberDto> {
    await delay(400)
    const member: ProjectMemberDto = {
      projectId,
      userId: dto.userId,
      tenantId: 'default-tenant',
      role: dto.role || ProjectRole.MEMBER,
      createdAt: new Date().toISOString(),
    }
    db.addMember(projectId, member)
    return member
  }

  async updateProjectMember(
    projectId: string,
    userId: string,
    dto: UpdateProjectMemberDto,
  ): Promise<ProjectMemberDto> {
    await delay(400)
    const updated = db.updateMember(projectId, userId, dto)
    if (!updated) throw new Error('Member not found')
    return updated
  }

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await delay(300)
    const success = db.removeMember(projectId, userId)
    if (!success) throw new Error('Member not found')
  }

  async createTicket(projectId: string, dto: CreateTicketDto): Promise<TicketDto> {
    await delay(400)
    const ticket: TicketDto = {
      id: generateId(),
      projectId,
      tenantId: 'default-tenant',
      title: dto.title,
      description: dto.description || null,
      status: dto.status || TicketStatus.TODO,
      assigneeId: dto.assigneeId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    db.addTicket(projectId, ticket)
    return ticket
  }

  async getProjectTickets(projectId: string): Promise<TicketDto[]> {
    await delay(200)
    return db.getTickets(projectId)
  }

  async getTicketById(projectId: string, ticketId: string): Promise<TicketDto> {
    await delay(200)
    const ticket = db.getTicket(projectId, ticketId)
    if (!ticket) throw new Error('Ticket not found')
    return ticket
  }

  async updateTicket(
    projectId: string,
    ticketId: string,
    dto: UpdateTicketDto,
  ): Promise<TicketDto> {
    await delay(400)
    const updated = db.updateTicket(projectId, ticketId, dto)
    if (!updated) throw new Error('Ticket not found')
    return updated
  }

  async createMessage(projectId: string, dto: CreateProjectMessageDto): Promise<ProjectMessageDto> {
    await delay(400)
    const message: ProjectMessageDto = {
      id: generateId(),
      projectId,
      authorId: 'current-user-id',
      tenantId: 'default-tenant',
      content: dto.content,
      attachmentPath: dto.attachmentPath || null,
      replyToId: dto.replyToId || null,
      createdAt: new Date().toISOString(),
      author: {
        id: 'current-user-id',
        email: 'utilisateur@example.com',
        profile: {
          bio: 'Développeur passionné',
          avatarPath: null,
        },
      },
    }
    db.addMessage(projectId, message)
    return message
  }

  async getProjectMessages(projectId: string): Promise<ProjectMessageDto[]> {
    await delay(200)
    return db.getMessages(projectId)
  }
}
