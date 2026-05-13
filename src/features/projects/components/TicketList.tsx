import { useNavigate } from "react-router-dom";
import { Kanban } from "lucide-react";
import type { TicketDto, ProjectMemberDto } from "@/api/types";
import { TicketStatus } from "@plic-mti-highfive/shared-types";
import { TicketCard } from "./TicketCard";

interface TicketListProps {
  tickets: TicketDto[];
  members: ProjectMemberDto[];
  projectId: string;
}

export function TicketList({ tickets, members, projectId }: TicketListProps) {
  const navigate = useNavigate();

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
          <button
            onClick={() => navigate(`/projects/${projectId}/lab`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Kanban size={18} />
            Accéder au lab
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun ticket pour le moment.</p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <button
          onClick={() => navigate(`/projects/${projectId}/lab`)}
          className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          <Kanban size={18} />
          Accéder au lab
        </button>
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
