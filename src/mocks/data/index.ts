import { TAGS } from "@/domain";
import type { DemoDataset } from "../db";
import { ANNOUNCEMENTS } from "./announcements";
import { COMMENTS } from "./comments";
import { CONVERSATIONS, MESSAGES } from "./conversations";
import { buildCustomizationImages } from "./customizationFixtures";
import { FILES } from "./files";
import { HIGHFIVES } from "./highfives";
import { MEMBERSHIPS } from "./memberships";
import { NOTIFICATIONS } from "./notifications";
import { PROJECTS } from "./projects";
import { ADMIN_ACTIONS, REPORTS } from "./reports";
import { INVITATIONS, JOIN_REQUESTS } from "./requests";
import { COLUMNS, TASKS } from "./tasks";
import { USERS } from "./users";
import { WALLS } from "./wall";

export { PROJECT_BY_SLUG, PROJECT_OF_THE_MOMENT } from "./projects";
export { DEMO_LOGIN } from "./users";
export { SIGNUPS_LAST_30_DAYS } from "./adminStats";
export * from "./ids";

/**
 * Jeu de demo complet (doc 23) : ~25 projets, 12 comptes, 24 tags,
 * appartenances, taches, annonces, commentaires, conversations,
 * notifications, activite etalee sur 30 jours avant 2026-09-13.
 * Utilise a la fois pour amorcer le store MSW (`seedDb`) et pour le test
 * d'integrite `data.test.ts`.
 */
export const demoDataset: DemoDataset = {
  users: USERS,
  tags: TAGS,
  projects: PROJECTS,
  memberships: MEMBERSHIPS,
  joinRequests: JOIN_REQUESTS,
  invitations: INVITATIONS,
  highfives: HIGHFIVES,
  announcements: ANNOUNCEMENTS,
  comments: COMMENTS,
  columns: COLUMNS,
  tasks: TASKS,
  walls: WALLS,
  files: FILES,
  customizationImages: buildCustomizationImages(
    new Map(PROJECTS.map((project) => [project.slug, project.id])),
  ),
  conversations: CONVERSATIONS,
  messages: MESSAGES,
  notifications: NOTIFICATIONS,
  reports: REPORTS,
  adminActions: ADMIN_ACTIONS,
};
