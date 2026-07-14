import { useNavigate } from "react-router-dom";
import { Kanban, PenLine } from "lucide-react";
import type { TicketDto, ProjectMemberDto } from "@/api/types";
import { TicketStatus } from "@plic-mti-highfive/shared-types";
import { TicketCard } from "./TicketCard";

interface TicketListProps {
  tickets: TicketDto[];
  members: ProjectMemberDto[];
  projectId: string;
}

/** Acces au lab (kanban) et au canvas de brainstorming, d'ou l'on genere les taches. */
function ProjectActions({ projectId }: { projectId: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => navigate(`/projects/${projectId}/lab`)}
        className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        <Kanban size={18} />
        Accéder au lab
      </button>
      <button
        onClick={() => navigate(`/projects/${projectId}/canvas`)}
        className="flex items-center gap-2 px-4 py-2.5 border border-foreground text-foreground font-semibold rounded-lg hover:bg-foreground/5 transition-colors"
      >
        <PenLine size={18} />
        Ouvrir le canvas
      </button>
    </div>
  );
}

export function TicketList({ tickets, members, projectId }: TicketListProps) {
  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return undefined;
    const member = members.find((m) => m.userId === assigneeId);
    return member?.user?.email || "Inconnu";
  };

  const groupedTickets = {
    [TicketStatus.TODO]: tickets.filter((t) => t.status === TicketStatus.TODO),
    [TicketStatus.IN_PROGRESS]: tickets.filter(
      (t) => t.status === TicketStatus.IN_PROGRESS,
    ),
    [TicketStatus.IN_REVIEW]: tickets.filter(
      (t) => t.status === TicketStatus.IN_REVIEW,
    ),
    [TicketStatus.DONE]: tickets.filter((t) => t.status === TicketStatus.DONE),
  };

  const statusLabels = {
    [TicketStatus.TODO]: "À faire",
    [TicketStatus.IN_PROGRESS]: "En cours",
    [TicketStatus.IN_REVIEW]: "En révision",
    [TicketStatus.DONE]: "Terminé",
  };

  if (tickets.length === 0) {
    return (
      <>
        <div className="mb-6">
          <ProjectActions projectId={projectId} />
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Aucun ticket pour le moment. Ouvrez le canvas pour brainstormer, puis
            générez les tâches.
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <ProjectActions projectId={projectId} />
      </div>
      {Object.entries(groupedTickets).map(([status, statusTickets]) => {
        if (statusTickets.length === 0) return null;

        return (
          <div key={status}>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              {statusLabels[status as TicketStatus]}
              <span className="text-xs font-normal text-muted-foreground">
                ({statusTickets.length})
              </span>
            </h3>
            <div className="space-y-2">
              {statusTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  assigneeName={getAssigneeName(ticket.assigneeId)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
