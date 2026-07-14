import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { LayoutTemplate, Kanban } from "lucide-react";
import { Header } from "@features/layout";
import { Footer } from "@features/layout";
import { KanbanBoard } from "../components/KanbanBoard";
import { TicketDrawer } from "../components/TicketDrawer";
import { useKanban } from "../hooks/useKanban";
import type { Member } from "../data/members";
import { getAssigneeColor, assigneeInitials } from "../utils/kanbanConfig";
import type { KanbanColumnId } from "../types";
import { projectService } from "@/api";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@shared/components/ui/breadcrumb";

export default function LabPage() {
  const { projectId } = useParams<{ projectId: string }>();
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
      <Header />
      <div className="bg-background" style={{ height: "2.75rem" }} />
      <main className="relative z-0 flex flex-col min-h-screen bg-background">
        <div className="flex-1 max-w-7xl w-full mx-auto px-6 pb-12">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-5">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={(props) => (
                    <Link {...props} to={`/projects/${projectId}`}>
                      Projet #{projectId}
                    </Link>
                  )}
                />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Tableau de bord</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Project context bar */}
          <div className="flex items-center justify-between gap-6 mb-6 pb-6 border-b border-border">
            <div>
              <h1 className="text-heading-lg font-semibold text-foreground">
                Tableau de bord
              </h1>
            </div>

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

              {/* Status */}
              <span className="px-3 py-1 rounded-full text-ui-sm font-bold bg-[var(--color-orange-light)] text-[var(--color-orange-dark)] dark:bg-orange-500/20 dark:text-orange-400">
                En cours
              </span>
            </div>
          </div>

          {/* Tool switcher */}
          <div className="flex items-center gap-2 mb-8">
            {/* Kanban - active */}
            <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-foreground text-background shadow-sm cursor-default select-none">
              <Kanban size={16} className="shrink-0" />
              <span className="text-ui-md font-bold">Kanban</span>
            </div>

            {/* Moodboard - inactive */}
            <Link
              to={`/projects/${projectId}/moodboard`}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors select-none"
            >
              <LayoutTemplate size={16} className="shrink-0" />
              <span className="text-ui-md font-bold">Moodboard</span>
            </Link>
          </div>

          {/* Kanban board */}
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
      </main>
      <Footer />

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
