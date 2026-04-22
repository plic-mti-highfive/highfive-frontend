// Enums alignés avec le backend (source de vérité)
// Utilisation de const objects au lieu d'enums pour compatibilité avec erasableSyntaxOnly

export const UserStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

export const ProjectStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus]

export const ProjectVisibility = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  INVITATION_ONLY: 'INVITATION_ONLY',
} as const

export type ProjectVisibility = (typeof ProjectVisibility)[keyof typeof ProjectVisibility]

export const ProjectRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const

export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole]

export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
} as const

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export const ConnectionStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  BLOCKED: 'BLOCKED',
} as const

export type ConnectionStatus = (typeof ConnectionStatus)[keyof typeof ConnectionStatus]
