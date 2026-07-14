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
  ProjectNewsDto,
  CreateProjectNewsDto,
  ChecklistItemDto,
  CreateChecklistItemDto,
  CreateTicketCommentDto,
  TicketCommentDto,
} from "../../types";
import {
  ProjectStatus,
  ProjectVisibility,
  ProjectRole,
  TicketStatus,
} from "@plic-mti-highfive/shared-types";
import { delay, generateId } from "./utils";
import { getAllProjects } from "./data";

class MockProjectDb {
  private projects: Map<string, ProjectDto> = new Map();
  private members: Map<string, ProjectMemberDto[]> = new Map();
  private tickets: Map<string, TicketDto[]> = new Map();
  private messages: Map<string, ProjectMessageDto[]> = new Map();
  private news: Map<string, ProjectNewsDto[]> = new Map();

  constructor() {
    const allProjects = getAllProjects();
    const mockUsers = [
      { id: "user-1", email: "marie.dupont@example.com", avatar: null },
      { id: "user-2", email: "jean.martin@example.com", avatar: null },
      { id: "user-3", email: "sophie.bernard@example.com", avatar: null },
      { id: "user-4", email: "lucas.petit@example.com", avatar: null },
    ];

    allProjects.forEach((project, index) => {
      this.projects.set(project.id, project);
      const creatorUser = mockUsers[index % mockUsers.length];
      const member: ProjectMemberDto = {
        projectId: project.id,
        userId: creatorUser.id,
        tenantId: "default-tenant",
        role: ProjectRole.OWNER,
        createdAt: project.createdAt,
        user: {
          id: creatorUser.id,
          email: creatorUser.email,
          profile: {
            avatarPath: creatorUser.avatar,
          },
        },
      };
      this.members.set(project.id, [member]);

      // Seed news for the first project only (demo)
      if (index === 0) {
        const author = {
          userId: creatorUser.id,
          username: creatorUser.email.split("@")[0],
          displayName: creatorUser.email.split("@")[0],
          avatar: creatorUser.avatar ?? "",
        };
        this.news.set(project.id, [
          {
            id: "news-1",
            projectId: project.id,
            authorId: creatorUser.id,
            tenantId: "default-tenant",
            title: "Lancement officiel du projet 🚀",
            content:
              "Nous sommes ravis de vous annoncer le lancement officiel de ce projet ! Après plusieurs semaines de préparation, nous ouvrons maintenant les contributions à tous les membres. Consultez les tickets disponibles et n'hésitez pas à nous contacter si vous avez des questions.",
            createdAt: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            updatedAt: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            author,
          },
          {
            id: "news-2",
            projectId: project.id,
            authorId: creatorUser.id,
            tenantId: "default-tenant",
            title: "Première milestone atteinte",
            content:
              "L'équipe a franchi une étape importante cette semaine : le module d'authentification est désormais complet et les tests passent à 100 %. Merci à tous les contributeurs pour leur implication. La prochaine étape sera l'intégration de l'API principale.",
            createdAt: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            updatedAt: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            author,
          },
          {
            id: "news-3",
            projectId: project.id,
            authorId: creatorUser.id,
            tenantId: "default-tenant",
            title: "Appel à contributeurs — design UI",
            content:
              'Nous recherchons des contributeurs avec des compétences en design pour nous aider à améliorer l\'interface utilisateur. Si vous êtes intéressé(e), rejoignez le projet et prenez un ticket labellisé "design". Toutes les contributions sont les bienvenues !',
            createdAt: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            updatedAt: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            author,
          },
        ]);
      }
    });
  }

  getAllProjects(): ProjectDto[] {
    return Array.from(this.projects.values());
  }

  getProject(id: string): ProjectDto | undefined {
    return this.projects.get(id);
  }

  addProject(project: ProjectDto): void {
    this.projects.set(project.id, project);
  }

  updateProject(
    id: string,
    updates: Partial<ProjectDto>,
  ): ProjectDto | undefined {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  deleteProject(id: string): boolean {
    return this.projects.delete(id);
  }

  getMembers(projectId: string): ProjectMemberDto[] {
    return this.members.get(projectId) || [];
  }

  addMember(projectId: string, member: ProjectMemberDto): void {
    const members = this.members.get(projectId) || [];
    members.push(member);
    this.members.set(projectId, members);
  }

  updateMember(
    projectId: string,
    userId: string,
    updates: Partial<ProjectMemberDto>,
  ): ProjectMemberDto | undefined {
    const members = this.members.get(projectId) || [];
    const index = members.findIndex((m) => m.userId === userId);
    if (index === -1) return undefined;
    const updated = { ...members[index], ...updates };
    members[index] = updated;
    this.members.set(projectId, members);
    return updated;
  }

  removeMember(projectId: string, userId: string): boolean {
    const members = this.members.get(projectId) || [];
    const filtered = members.filter((m) => m.userId !== userId);
    this.members.set(projectId, filtered);
    return filtered.length < members.length;
  }

  getTickets(projectId: string): TicketDto[] {
    return this.tickets.get(projectId) || [];
  }

  addTicket(projectId: string, ticket: TicketDto): void {
    const tickets = this.tickets.get(projectId) || [];
    tickets.push(ticket);
    this.tickets.set(projectId, tickets);
  }

  getTicket(projectId: string, ticketId: string): TicketDto | undefined {
    const tickets = this.tickets.get(projectId) || [];
    return tickets.find((t) => t.id === ticketId);
  }

  updateTicket(
    projectId: string,
    ticketId: string,
    updates: Partial<TicketDto>,
  ): TicketDto | undefined {
    const tickets = this.tickets.get(projectId) || [];
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index === -1) return undefined;
    const updated = {
      ...tickets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    tickets[index] = updated;
    this.tickets.set(projectId, tickets);
    return updated;
  }

  getMessages(projectId: string): ProjectMessageDto[] {
    return this.messages.get(projectId) || [];
  }

  addMessage(projectId: string, message: ProjectMessageDto): void {
    const messages = this.messages.get(projectId) || [];
    messages.push(message);
    this.messages.set(projectId, messages);
  }

  getNews(projectId: string): ProjectNewsDto[] {
    return this.news.get(projectId) || [];
  }

  addNews(projectId: string, item: ProjectNewsDto): void {
    const items = this.news.get(projectId) || [];
    items.push(item);
    this.news.set(projectId, items);
  }
}

const db = new MockProjectDb();

export class ProjectServiceMock implements IProjectService {
  async addChecklistItem(
    projectId: string,
    ticketId: string,
    dto: CreateChecklistItemDto,
  ): Promise<ChecklistItemDto> {
    await delay(300);
    const ticket = db.getTicket(projectId, ticketId);
    if (!ticket) throw new Error("Ticket not found");

    const checklistItem: ChecklistItemDto = {
      id: generateId(),
      ticketId,
      tenantId: "default-tenant",
      content: dto.content,
      isCompleted: dto.isCompleted || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    ticket.checklistItems = ticket.checklistItems || [];
    ticket.checklistItems.push(checklistItem);
    db.updateTicket(projectId, ticketId, {
      checklistItems: ticket.checklistItems,
    });

    return checklistItem;
  }
  async toggleChecklistItem(
    projectId: string,
    itemId: string,
    isCompleted: boolean,
  ): Promise<ChecklistItemDto> {
    await delay(300);
    const ticket = db.getTicket(projectId, itemId);
    if (!ticket) throw new Error("Ticket not found");

    const checklistItem = ticket.checklistItems?.find((i) => i.id === itemId);
    if (!checklistItem) throw new Error("Checklist item not found");

    const updatedItem = { ...checklistItem, isCompleted };
    db.updateTicket(projectId, itemId, {
      checklistItems: ticket.checklistItems?.map((i) =>
        i.id === itemId ? updatedItem : i,
      ),
    });

    return updatedItem;
  }
  async addTicketComment(
    projectId: string,
    ticketId: string,
    dto: CreateTicketCommentDto,
  ): Promise<TicketCommentDto> {
    await delay(300);
    const ticket = db.getTicket(projectId, ticketId);
    if (!ticket) throw new Error("Ticket not found");

    const comment: TicketCommentDto = {
      id: generateId(),
      ticketId,
      authorId: "current-user-id",
      tenantId: "default-tenant",
      content: dto.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    ticket.comments = ticket.comments || [];
    ticket.comments.push(comment);
    db.updateTicket(projectId, ticketId, { comments: ticket.comments });

    return comment;
  }

  async createProject(dto: CreateProjectDto): Promise<ProjectDto> {
    await delay(500);
    const project: ProjectDto = {
      id: generateId(),
      tenantId: "default-tenant",
      name: dto.name,
      description: dto.description || null,
      status: dto.status || ProjectStatus.DRAFT,
      visibility: dto.visibility || ProjectVisibility.PRIVATE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    db.addProject(project);
    return project;
  }

  async getProjects(
    query?: ListProjectsQuery,
  ): Promise<PaginatedResponse<ProjectDto>> {
    await delay(300);
    let projects = db.getAllProjects();
    if (query?.status) {
      projects = projects.filter((p) => p.status === query.status);
    }
    if (query?.visibility) {
      projects = projects.filter((p) => p.visibility === query.visibility);
    }
    const limit = query?.limit || 20;
    const offset = query?.offset || 0;
    const paginatedProjects = projects.slice(offset, offset + limit);
    return {
      data: paginatedProjects,
      total: projects.length,
      page: Math.ceil(offset / limit) + 1,
      limit,
      totalPages: Math.ceil(projects.length / limit),
    };
  }

  async getProjectById(id: string): Promise<ProjectDto> {
    await delay(200);
    const project = db.getProject(id);
    if (!project) throw new Error("Project not found");
    return project;
  }

  async getProjectsByIds(ids: string[]): Promise<ProjectDto[]> {
    if (ids.length === 0) {
      return [];
    }
    await delay(250);
    const projects = ids
      .map((id) => db.getProject(id))
      .filter((p): p is ProjectDto => p !== undefined);
    return projects;
  }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<ProjectDto> {
    await delay(400);
    const updated = db.updateProject(id, dto);
    if (!updated) throw new Error("Project not found");
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await delay(300);
    const success = db.deleteProject(id);
    if (!success) throw new Error("Project not found");
  }

  async getProjectMembers(projectId: string): Promise<ProjectMemberDto[]> {
    await delay(200);
    return db.getMembers(projectId);
  }

  async addProjectMember(
    projectId: string,
    dto: AddProjectMemberDto,
  ): Promise<ProjectMemberDto> {
    await delay(400);
    const member: ProjectMemberDto = {
      projectId,
      userId: dto.userId,
      tenantId: "default-tenant",
      role: dto.role || ProjectRole.MEMBER,
      createdAt: new Date().toISOString(),
    };
    db.addMember(projectId, member);
    return member;
  }

  async updateProjectMember(
    projectId: string,
    userId: string,
    dto: UpdateProjectMemberDto,
  ): Promise<ProjectMemberDto> {
    await delay(400);
    const updated = db.updateMember(projectId, userId, dto);
    if (!updated) throw new Error("Member not found");
    return updated;
  }

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await delay(300);
    const success = db.removeMember(projectId, userId);
    if (!success) throw new Error("Member not found");
  }

  async createTicket(
    projectId: string,
    dto: CreateTicketDto,
  ): Promise<TicketDto> {
    await delay(400);
    const ticket: TicketDto = {
      id: generateId(),
      projectId,
      tenantId: "default-tenant",
      title: dto.title,
      description: dto.description || null,
      status: dto.status || TicketStatus.TODO,
      assigneeId: dto.assigneeId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.addTicket(projectId, ticket);
    return ticket;
  }

  async getProjectTickets(projectId: string): Promise<TicketDto[]> {
    await delay(200);
    return db.getTickets(projectId);
  }

  async getTicketById(projectId: string, ticketId: string): Promise<TicketDto> {
    await delay(200);
    const ticket = db.getTicket(projectId, ticketId);
    if (!ticket) throw new Error("Ticket not found");
    return ticket;
  }

  async updateTicket(
    projectId: string,
    ticketId: string,
    dto: UpdateTicketDto,
  ): Promise<TicketDto> {
    await delay(400);
    const updated = db.updateTicket(projectId, ticketId, dto);
    if (!updated) throw new Error("Ticket not found");
    return updated;
  }

  async createMessage(
    projectId: string,
    dto: CreateProjectMessageDto,
  ): Promise<ProjectMessageDto> {
    await delay(400);
    const message: ProjectMessageDto = {
      id: generateId(),
      projectId,
      authorId: "current-user-id",
      tenantId: "default-tenant",
      content: dto.content,
      attachmentPath: dto.attachmentPath || null,
      replyToId: dto.replyToId || null,
      createdAt: new Date().toISOString(),
      author: {
        userId: "current-user-id",
        username: "currentuser",
        displayName: "Current User",
        avatar: "",
      },
    };
    db.addMessage(projectId, message);
    return message;
  }

  async getProjectMessages(projectId: string): Promise<ProjectMessageDto[]> {
    await delay(200);
    return db.getMessages(projectId);
  }

  async createNews(
    projectId: string,
    dto: CreateProjectNewsDto,
  ): Promise<ProjectNewsDto> {
    await delay(400);
    const item: ProjectNewsDto = {
      id: generateId(),
      projectId,
      authorId: "current-user-id",
      tenantId: "default-tenant",
      title: dto.title,
      content: dto.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        userId: "current-user-id",
        username: "currentuser",
        displayName: "Current User",
        avatar: "",
      },
    };
    db.addNews(projectId, item);
    return item;
  }

  async getProjectNews(projectId: string): Promise<ProjectNewsDto[]> {
    await delay(200);
    return db.getNews(projectId);
  }
}
