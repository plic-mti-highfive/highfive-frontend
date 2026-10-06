import { TAGS, type Project } from "@/domain";
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
 * `lastActivityAt` ne peut pas etre anterieure a ce que l'equipe a publie : on
 * garde la valeur de depart du projet (`lastActivityHoursAgo`) comme plancher et
 * on la remonte jusqu'au contenu le plus recent (annonce, commentaire, tache,
 * message du canal, fichier). Les highfives et les arrivees ne comptent pas :
 * un projet termine qui recoit un highfive n'est pas pour autant redevenu actif.
 */
function withDerivedActivity(projects: Project[]): Project[] {
  const projectOfColumn = new Map(COLUMNS.map((c) => [c.id, c.projectId]));
  const projectOfConversation = new Map(
    CONVERSATIONS.filter((c) => c.projectId).map((c) => [c.id, c.projectId!]),
  );
  const newest = new Map<string, string>();
  const see = (projectId: string | undefined, at: string) => {
    if (!projectId) return;
    const known = newest.get(projectId);
    if (!known || at > known) newest.set(projectId, at);
  };
  for (const a of ANNOUNCEMENTS) see(a.projectId, a.publishedAt);
  for (const c of COMMENTS) see(c.projectId, c.publishedAt);
  for (const t of TASKS) see(projectOfColumn.get(t.columnId), t.createdAt);
  for (const m of MESSAGES)
    see(projectOfConversation.get(m.conversationId), m.sentAt);
  for (const f of FILES) see(f.projectId, f.uploadedAt);
  return projects.map((project) => {
    const latest = newest.get(project.id);
    return latest && latest > project.lastActivityAt
      ? { ...project, lastActivityAt: latest }
      : project;
  });
}

/**
 * Jeu de demo complet (doc 23, etoffe) : 25 projets aux equipes completes et a
 * l'activite etalee, 25 comptes, 24 tags, annonces, commentaires en fils,
 * taches, conversations, notifications, signalements. Les dates sont relatives
 * a 2026-09-13. Utilise a la fois pour amorcer le store MSW (`seedDb`) et pour
 * les tests d'integrite `data.test.ts`.
 */
export const demoDataset: DemoDataset = {
  users: USERS,
  tags: TAGS,
  projects: withDerivedActivity(PROJECTS),
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
