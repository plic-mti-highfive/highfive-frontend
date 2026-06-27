import type {
  ProjectStatus,
  ProjectVisibility,
  ProjectRole,
  TicketStatus,
} from "@plic-mti-highfive/shared-types";
import type { MinimalProfileDto } from "./user.types";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------- Project ----------

export interface ProjectDto {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  highfiveCount?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  owner?: MinimalProfileDto;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  tags?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  tags?: string[];
}

export interface ListProjectsQuery {
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  search?: string;
  tags?: string[];
  sortBy?: "date" | "name" | "popularity";
  sortOrder?: "ASC" | "DESC";
  limit?: number;
  offset?: number;
}

// ---------- Member ----------

export interface ProjectMemberDto {
  projectId: string;
  userId: string;
  tenantId: string;
  role: ProjectRole;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    profile?: {
      avatarPath: string | null;
    };
  };
}

export interface AddProjectMemberDto {
  userId: string;
  role?: ProjectRole;
}

export interface UpdateProjectMemberDto {
  role: ProjectRole;
}

// ---------- Ticket ----------

export interface TicketDto {
  id: string;
  projectId: string;
  tenantId: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  checklistItems?: ChecklistItemDto[];
  comments?: TicketCommentDto[];
}

export interface CreateTicketDto {
  title: string;
  description?: string;
  status?: TicketStatus;
  assigneeId?: string;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  status?: TicketStatus;
  assigneeId?: string;
}

// Checklist

export interface ChecklistItemDto {
  id: string;
  ticketId: string;
  tenantId: string;
  content: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChecklistItemDto {
  content: string;
  isCompleted?: boolean;
}

// Comments

export interface TicketCommentDto {
  id: string;
  ticketId: string;
  authorId: string;
  tenantId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: MinimalProfileDto;
}

export interface CreateTicketCommentDto {
  content: string;
}

// ---------- Message ----------

export interface ProjectMessageDto {
  id: string;
  projectId: string;
  authorId: string;
  tenantId: string;
  content: string;
  attachmentPath: string | null;
  replyToId?: string | null;
  createdAt: string;
  author?: MinimalProfileDto;
}

export interface CreateProjectMessageDto {
  content: string;
  attachmentPath?: string;
  replyToId?: string | null;
}
