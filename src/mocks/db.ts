/**
 * Store en memoire pour MSW (L3). Chaque collection est typee par un schema
 * du domaine (`src/domain`) ; `resetDb()` recharge le jeu de demo initial
 * (utilise par le test d'integrite et par les handlers qui reinitialisent
 * entre deux runs de dev si besoin).
 */
import type {
  Announcement,
  AdminAction,
  Column,
  Comment,
  Conversation,
  CurrentUser,
  Highfive,
  Invitation,
  JoinRequest,
  Membership,
  Message,
  Notification,
  NotificationPreference,
  Project,
  ProjectFile,
  Report,
  Tag,
  Task,
  Wall,
} from "@/domain";

/**
 * Enregistrement interne d'une personne : la forme complete (`CurrentUser`,
 * avec email/statut/role) est stockee cote "serveur" mock ; les handlers ne
 * renvoient que la projection publique (`User`/`UserSummary`) sauf sur
 * `/api/me`. Un seul champ prive ajoute au domaine : le mot de passe,
 * jamais expose par aucun handler.
 */
export type DbUser = CurrentUser & { passwordHash: string };

class Table<T> {
  private rows: T[];

  private readonly matches: (row: T, criteria: Partial<T>) => boolean;

  constructor(
    initial: T[],
    matches: (row: T, criteria: Partial<T>) => boolean,
  ) {
    this.rows = [...initial];
    this.matches = matches;
  }

  all(): T[] {
    return [...this.rows];
  }

  find(predicate: (row: T) => boolean): T[] {
    return this.rows.filter(predicate);
  }

  findOne(predicate: (row: T) => boolean): T | undefined {
    return this.rows.find(predicate);
  }

  where(criteria: Partial<T>): T[] {
    return this.rows.filter((row) => this.matches(row, criteria));
  }

  insert(row: T): T {
    this.rows.push(row);
    return row;
  }

  update(predicate: (row: T) => boolean, patch: Partial<T>): T | undefined {
    const index = this.rows.findIndex(predicate);
    if (index === -1) return undefined;
    this.rows[index] = { ...this.rows[index], ...patch };
    return this.rows[index];
  }

  remove(predicate: (row: T) => boolean): number {
    const before = this.rows.length;
    this.rows = this.rows.filter((row) => !predicate(row));
    return before - this.rows.length;
  }

  replaceAll(rows: T[]): void {
    this.rows = [...rows];
  }
}

function byShallowEquality<T>(row: T, criteria: Partial<T>): boolean {
  return Object.entries(criteria).every(
    ([key, value]) => (row as Record<string, unknown>)[key] === value,
  );
}

export interface MockDatabase {
  users: Table<DbUser>;
  tags: Table<Tag>;
  projects: Table<Project>;
  memberships: Table<Membership>;
  joinRequests: Table<JoinRequest>;
  invitations: Table<Invitation>;
  highfives: Table<Highfive>;
  announcements: Table<Announcement>;
  comments: Table<Comment>;
  columns: Table<Column>;
  tasks: Table<Task>;
  walls: Table<Wall>;
  files: Table<ProjectFile>;
  conversations: Table<Conversation>;
  messages: Table<Message>;
  notifications: Table<Notification>;
  notificationPreferences: Table<NotificationPreference & { userId: string }>;
  reports: Table<Report>;
  adminActions: Table<AdminAction>;
  /** Jeton -> userId, "en memoire" (mission L3). Le client porte le jeton en Bearer (tokenStorage). */
  sessions: Map<string, string>;
}

export interface DemoDataset {
  users: DbUser[];
  tags: Tag[];
  projects: Project[];
  memberships: Membership[];
  joinRequests: JoinRequest[];
  invitations: Invitation[];
  highfives: Highfive[];
  announcements: Announcement[];
  comments: Comment[];
  columns: Column[];
  tasks: Task[];
  walls: Wall[];
  files: ProjectFile[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  reports: Report[];
  adminActions: AdminAction[];
}

let currentDataset: DemoDataset | undefined;

function buildDb(dataset: DemoDataset): MockDatabase {
  return {
    users: new Table(dataset.users, byShallowEquality),
    tags: new Table(dataset.tags, byShallowEquality),
    projects: new Table(dataset.projects, byShallowEquality),
    memberships: new Table(dataset.memberships, byShallowEquality),
    joinRequests: new Table(dataset.joinRequests, byShallowEquality),
    invitations: new Table(dataset.invitations, byShallowEquality),
    highfives: new Table(dataset.highfives, byShallowEquality),
    announcements: new Table(dataset.announcements, byShallowEquality),
    comments: new Table(dataset.comments, byShallowEquality),
    columns: new Table(dataset.columns, byShallowEquality),
    tasks: new Table(dataset.tasks, byShallowEquality),
    walls: new Table(dataset.walls, byShallowEquality),
    files: new Table(dataset.files, byShallowEquality),
    conversations: new Table(dataset.conversations, byShallowEquality),
    messages: new Table(dataset.messages, byShallowEquality),
    notifications: new Table(dataset.notifications, byShallowEquality),
    notificationPreferences: new Table<
      NotificationPreference & { userId: string }
    >([], byShallowEquality),
    reports: new Table(dataset.reports, byShallowEquality),
    adminActions: new Table(dataset.adminActions, byShallowEquality),
    sessions: new Map(),
  };
}

let db: MockDatabase | undefined;

/** Initialise (ou reinitialise) le store a partir d'un jeu de demo. */
export function seedDb(dataset: DemoDataset): MockDatabase {
  currentDataset = dataset;
  db = buildDb(dataset);
  return db;
}

/** Acces au store courant. Doit etre initialise via `seedDb` avant usage (voir `data/index.ts`). */
export function getDb(): MockDatabase {
  if (!db) {
    throw new Error(
      "Le store mock n'est pas initialise : appeler seedDb() au demarrage.",
    );
  }
  return db;
}

/** Reinitialise le store sur le dernier jeu de demo charge (utile entre deux tests). */
export function resetDb(): MockDatabase {
  if (!currentDataset) {
    throw new Error(
      "Aucun jeu de demo charge : appeler seedDb() au moins une fois.",
    );
  }
  return seedDb(currentDataset);
}
