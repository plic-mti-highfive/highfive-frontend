import { ProjectStatus, ProjectVisibility, ProjectRole, TaskStatus } from './enums'

// DTOs Project - alignés avec backend

export interface ProjectDto {
  id: string
  tenantId: string
  name: string
  description: string | null
  status: ProjectStatus
  visibility: ProjectVisibility
  highfiveCount?: number
  tags?: string[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateProjectDto {
  name: string
  description?: string
  status?: ProjectStatus
  visibility?: ProjectVisibility
}

export interface UpdateProjectDto {
  name?: string
  description?: string
  status?: ProjectStatus
  visibility?: ProjectVisibility
}

export interface ProjectMemberDto {
  projectId: string
  userId: string
  tenantId: string
  role: ProjectRole
  createdAt: string
  user?: {
    id: string
    email: string
    profile?: {
      avatarPath: string | null
    }
  }
}

export interface AddProjectMemberDto {
  userId: string
  role?: ProjectRole
}

export interface UpdateProjectMemberDto {
  role: ProjectRole
}

export interface TaskDto {
  id: string
  projectId: string
  tenantId: string
  title: string
  description: string | null
  status: TaskStatus
  assigneeId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  status?: TaskStatus
  assigneeId?: string
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: TaskStatus
  assigneeId?: string
}

export interface ListProjectsQuery {
  status?: ProjectStatus
  visibility?: ProjectVisibility
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProjectMessageDto {
  id: string
  projectId: string
  authorId: string
  tenantId: string
  content: string
  attachmentPath: string | null
  replyToId?: string | null
  createdAt: string
  author?: {
    id: string
    email: string
    profile?: {
      bio: string | null
      avatarPath: string | null
    }
  }
}

export interface CreateProjectMessageDto {
  content: string
  attachmentPath?: string
  replyToId?: string | null
}
