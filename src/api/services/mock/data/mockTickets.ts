import { TicketStatus } from "@plic-mti-highfive/shared-types";
import type { TicketDto } from "@/api/types";
import { getAllProjects } from "./mockProjects";
import { getProjectMemberships } from "./mockMemberships";

/**
 * Tickets de demonstration. Le mock n'en seedait aucun : le Kanban et l'onglet
 * « Taches » restaient donc vides quoi qu'il arrive, alors qu'en mode http le
 * backend renvoie de vrais tickets. Comme le reste des mocks, tout est derive
 * des index pour rester stable entre deux rechargements.
 */
const TICKET_TITLES = [
  "Cadrer le besoin avec l'equipe",
  "Rediger le plan d'action",
  "Preparer le materiel",
  "Contacter les partenaires",
  "Publier l'annonce",
  "Organiser la premiere reunion",
  "Faire le bilan de la semaine",
  "Repartir les roles",
];

const STATUS_CYCLE: TicketStatus[] = [
  TicketStatus.TODO,
  TicketStatus.TODO,
  TicketStatus.IN_PROGRESS,
  TicketStatus.IN_REVIEW,
  TicketStatus.DONE,
];

function buildTickets(): Record<string, TicketDto[]> {
  const result: Record<string, TicketDto[]> = {};

  getAllProjects().forEach((project, index) => {
    const team = getProjectMemberships(project.id);
    // 3 a 6 tickets par projet.
    const count = 3 + (index % 4);
    const tickets: TicketDto[] = [];

    for (let i = 0; i < count; i++) {
      const assignee = team[(index + i) % team.length];
      const createdAt = new Date(
        Date.parse(project.createdAt) + i * 86_400_000,
      ).toISOString();

      tickets.push({
        id: `ticket-${project.id}-${i + 1}`,
        projectId: project.id,
        tenantId: project.tenantId,
        title: TICKET_TITLES[(index + i) % TICKET_TITLES.length],
        description: `Tache ${i + 1} du projet « ${project.name} ».`,
        status: STATUS_CYCLE[(index + i) % STATUS_CYCLE.length],
        assigneeId: assignee?.userId ?? null,
        createdAt,
        updatedAt: createdAt,
        checklistItems: [],
        comments: [],
      });
    }

    result[project.id] = tickets;
  });

  return result;
}

export const mockTickets: Record<string, TicketDto[]> = buildTickets();

export function getProjectTicketsData(projectId: string): TicketDto[] {
  // Copie : le service mock mute ses tickets (ajout, deplacement, suppression)
  // et ne doit pas alterer le jeu de donnees de reference.
  return (mockTickets[projectId] ?? []).map((t) => ({ ...t }));
}
