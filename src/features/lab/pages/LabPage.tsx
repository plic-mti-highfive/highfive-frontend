import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { KanbanBoard } from "../components/KanbanBoard";
import { TicketDrawer } from "../components/TicketDrawer";
import { useKanban } from "../hooks/useKanban";
import type { Member } from "../data/members";
import { getAssigneeColor, assigneeInitials } from "../utils/kanbanConfig";
import type { KanbanColumnId } from "../types";
import { projectService } from "@/api";

/**
 * Les Tâches, montee sous LabLayout (src/app/layouts/LabLayout.tsx, V2 item 3)
 * qui porte desormais la barre de projet (titre, retour, onglets Le
 * Mur/Les Tâches) : cette page ne garde que le contenu propre a l'onglet.
 */
export default function LabPage() {
  // TODO(v2-L4) : route "/projets/:slug/lab/taches" (param renomme projectId
  // -> slug) ; le service ci-dessous attend encore un id technique, a migrer.
  const { slug: projectId } = useParams<{ slug: string }>();
  const {
    tickets,
    columns,
    customTags,
    addTicket,
    moveTicket,
    deleteTicket,
    updateTicket,
    addColumn,
    deleteColumn,
    addCustomTag,
    addChecklist,
    toggleChecklist,
    addComment,
  } = useKanban(projectId);
  const [openTicket, setOpenTicket] = useState<{
    ticketId: string;
    columnId: KanbanColumnId;
  } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!projectId) return;
    projectService
      .getProjectMembers(projectId)
      .then((data) => {
        setMembers(
          data.map((m) => ({ name: m.user?.email?.split("@")[0] ?? m.userId })),
        );
      })
      .catch((err) => console.error("Error loading project members:", err));
  }, [projectId]);

  const { total, done } = useMemo(() => {
    const all = Object.values(tickets).flat();
    return { total: all.length, done: tickets.done.length };
  }, [tickets]);

  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

  const activeTicket = openTicket
    ? (tickets[openTicket.columnId]?.find(
        (t) => t.id === openTicket.ticketId,
      ) ?? null)
    : null;

  function handleDrawerMove(
    ticketId: string,
    from: KanbanColumnId,
    to: KanbanColumnId,
  ) {
    moveTicket(ticketId, from, to);
    setOpenTicket({ ticketId, columnId: to });
  }

  return (
    <>
      <div className="h-full overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-7xl">
          {/* Barre de contexte de l'onglet */}
          <div className="flex items-center justify-between gap-6 mb-6 pb-6 border-b border-border">
            <h1 className="text-heading-lg font-semibold text-foreground">
              Les Tâches
            </h1>

            <div className="flex items-center gap-5">
              {/* Members */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {members.map((m) => {
                    const c = getAssigneeColor(m.name);
                    return (
                      <span
                        key={m.name}
                        title={m.name}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-background"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {assigneeInitials(m.name)}
                      </span>
                    );
                  })}
                </div>
                <span className="text-body-sm text-muted-foreground">
                  {members.length} membres
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2.5 min-w-[120px]">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: "var(--color-apple)",
                    }}
                  />
                </div>
                <span className="text-body-sm font-semibold text-foreground tabular-nums">
                  {done}/{total}
                </span>
              </div>
            </div>
          </div>

          <KanbanBoard
            columns={columns}
            tickets={tickets}
            customTags={customTags}
            addTicket={addTicket}
            moveTicket={moveTicket}
            deleteTicket={deleteTicket}
            onOpenTicket={(ticketId, columnId) =>
              setOpenTicket({ ticketId, columnId })
            }
            onAddColumn={addColumn}
            onDeleteColumn={deleteColumn}
          />
        </div>
      </div>

      <TicketDrawer
        ticket={activeTicket}
        columnId={openTicket?.columnId ?? null}
        isOpen={openTicket !== null}
        members={members}
        columns={columns}
        customTags={customTags}
        onClose={() => setOpenTicket(null)}
        onUpdate={updateTicket}
        onMoveColumn={handleDrawerMove}
        onDelete={(id, col) => {
          deleteTicket(id, col);
          setOpenTicket(null);
        }}
        onAddTag={addCustomTag}
        onAddChecklist={addChecklist}
        onToggleChecklist={toggleChecklist}
        onAddComment={addComment}
      />
    </>
  );
}
