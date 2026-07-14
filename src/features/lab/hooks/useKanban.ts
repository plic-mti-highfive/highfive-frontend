import { useEffect, useState } from "react";
import type {
  KanbanColumnId,
  KanbanTicket,
  KanbanColumnDef,
  CustomTag,
} from "../types";
import { DEFAULT_COLUMNS } from "../utils/kanbanConfig";
import type { TicketDto } from "@/api/types/project.types";
import { projectService } from "@/api/services";
import { TicketStatus } from "@plic-mti-highfive/shared-types";

const INITIAL_COLUMNS: KanbanColumnDef[] = DEFAULT_COLUMNS.map((c) => ({
  ...c,
  bgColor: c.bgColor,
}));

const INITIAL_TAGS: CustomTag[] = [
  { id: "tag-1", label: "Idée", color: "#3EC6F5" },
  { id: "tag-2", label: "Urgent", color: "#E0305A" },
  { id: "tag-3", label: "Recherche", color: "#C24BFF" },
  { id: "tag-4", label: "Créatif", color: "#FF6B1A" },
];

function ticketStatusToColumnId(status: TicketStatus): KanbanColumnId {
  switch (status) {
    case TicketStatus.IN_PROGRESS:
    case TicketStatus.IN_REVIEW:
      return "in-progress";
    case TicketStatus.DONE:
      return "done";
    default:
      return "todo";
  }
}

export function useKanban(projectId: string | undefined) {
  const [columns, setColumns] = useState<KanbanColumnDef[]>(INITIAL_COLUMNS);
  const [customTags, setCustomTags] = useState<CustomTag[]>(INITIAL_TAGS);

  const [tickets, setTickets] = useState<
    Record<KanbanColumnId, KanbanTicket[]>
  >({
    todo: [],
    "in-progress": [],
    done: [],
  });
  const [isLoading, setIsLoading] = useState(!!projectId);

  useEffect(() => {
    if (!projectId) return;

    async function fetchTickets() {
      try {
        setIsLoading(true);
        const data: TicketDto[] = await projectService.getProjectTickets(
          projectId!,
        );

        const groupedTickets: Record<KanbanColumnId, KanbanTicket[]> = {
          todo: [],
          "in-progress": [],
          done: [],
        };

        data.forEach((ticket: TicketDto) => {
          const colId = ticketStatusToColumnId(ticket.status);

          // Adaptation TicketDto -> KanbanTicket
          groupedTickets[colId].push({
            id: ticket.id,
            title: ticket.title,
            priority: undefined, // TODO
            assignee: ticket.assigneeId ?? undefined,
            tags: [], // TODO
            checklistItems:
              ticket.checklistItems?.map((item) => ({
                id: item.id,
                text: item.content,
                done: item.isCompleted,
              })) ?? [],
            ticketComments:
              ticket.comments?.map((comment) => ({
                id: comment.id,
                author: comment.author?.displayName ?? "Inconnu",
                text: comment.content,
                createdAt: comment.createdAt,
              })) ?? [],
          });
        });

        setTickets(groupedTickets);
      } catch (error) {
        console.error("Error fetching tickets", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTickets();
  }, [projectId]);

  // ---------- Ticket Operations ----------

  async function addTicket(columnId: KanbanColumnId, title: string) {
    if (!title.trim() || !projectId) return;

    const apiStatus: TicketStatus =
      columnId === "in-progress"
        ? TicketStatus.IN_PROGRESS
        : columnId === "done"
          ? TicketStatus.DONE
          : TicketStatus.TODO;

    try {
      const newTicket: TicketDto = await projectService.createTicket(
        projectId,
        {
          title: title.trim(),
          status: apiStatus,
        },
      );

      setTickets((prev) => ({
        ...prev,
        [columnId]: [
          ...(prev[columnId] ?? []),
          {
            id: newTicket.id,
            title: newTicket.title,
            checklistItems: [],
            ticketComments: [],
          },
        ],
      }));
    } catch (error) {
      console.error("Error creating ticket", error);
    }
  }

  function moveTicket(
    ticketId: string,
    from: KanbanColumnId,
    to: KanbanColumnId,
    toIndex?: number,
  ) {
    setTickets((prev) => {
      const ticket = prev[from]?.find((t) => t.id === ticketId);
      if (!ticket) return prev;

      if (from === to) {
        const newList = [...prev[from]];
        const currentIndex = newList.findIndex((t) => t.id === ticketId);
        if (currentIndex === -1) return prev;
        newList.splice(currentIndex, 1);
        const insertIndex = toIndex !== undefined ? toIndex : newList.length;
        newList.splice(insertIndex, 0, ticket);
        return { ...prev, [from]: newList };
      }

      const targetList = [...(prev[to] ?? [])];
      const insertIndex = toIndex !== undefined ? toIndex : targetList.length;
      targetList.splice(insertIndex, 0, ticket);

      if (from !== to && projectId) {
        const apiStatus: TicketStatus =
          to === "in-progress"
            ? TicketStatus.IN_PROGRESS
            : to === "done"
              ? TicketStatus.DONE
              : TicketStatus.TODO;

        projectService
          .updateTicket(projectId, ticketId, { status: apiStatus })
          .catch((err) => console.error("Error moving ticket:", err));
      }

      return {
        ...prev,
        [from]: prev[from].filter((t) => t.id !== ticketId),
        [to]: targetList,
      };
    });
  }

  function deleteTicket(ticketId: string, columnId: KanbanColumnId) {
    setTickets((prev) => ({
      ...prev,
      [columnId]: prev[columnId].filter((t) => t.id !== ticketId),
    }));
  }

  function updateTicket(
    ticketId: string,
    columnId: KanbanColumnId,
    updates: Partial<KanbanTicket>,
  ) {
    setTickets((prev) => ({
      ...prev,
      [columnId]: prev[columnId].map((t) =>
        t.id === ticketId ? { ...t, ...updates } : t,
      ),
    }));
    if (projectId && updates.title !== undefined) {
      projectService
        .updateTicket(projectId, ticketId, { title: updates.title })
        .catch((err) => console.error("Error updating ticket:", err));
    }
  }

  // ---------- Checklist Operations ----------

  async function addChecklist(
    ticketId: string,
    columnId: KanbanColumnId,
    content: string,
  ) {
    if (!projectId) return;
    try {
      const newItem = await projectService.addChecklistItem(
        projectId,
        ticketId,
        { content },
      );
      setTickets((prev) => ({
        ...prev,
        [columnId]: prev[columnId].map((t) =>
          t.id === ticketId
            ? {
                ...t,
                checklistItems: [
                  ...(t.checklistItems ?? []),
                  {
                    id: newItem.id,
                    text: newItem.content,
                    done: newItem.isCompleted,
                  },
                ],
              }
            : t,
        ),
      }));
    } catch (err) {
      console.error("Error adding checklist item:", err);
    }
  }

  async function toggleChecklist(
    ticketId: string,
    columnId: KanbanColumnId,
    itemId: string,
    isCompleted: boolean,
  ) {
    if (!projectId) return;
    try {
      setTickets((prev) => ({
        ...prev,
        [columnId]: prev[columnId].map((t) =>
          t.id === ticketId
            ? {
                ...t,
                checklistItems: (t.checklistItems ?? []).map((i) =>
                  i.id === itemId ? { ...i, done: isCompleted } : i,
                ),
              }
            : t,
        ),
      }));
      await projectService.toggleChecklistItem(projectId, itemId, isCompleted);
    } catch (err) {
      console.error("Error toggling checklist item:", err);
    }
  }

  // ---------- Comment Operations ----------

  async function addComment(
    ticketId: string,
    columnId: KanbanColumnId,
    content: string,
  ) {
    if (!projectId) return;
    try {
      const newComment = await projectService.addTicketComment(
        projectId,
        ticketId,
        { content },
      );
      setTickets((prev) => ({
        ...prev,
        [columnId]: prev[columnId].map((t) =>
          t.id === ticketId
            ? {
                ...t,
                ticketComments: [
                  ...(t.ticketComments ?? []),
                  {
                    id: newComment.id,
                    author: newComment.author?.displayName ?? "Vous",
                    text: newComment.content,
                    createdAt: newComment.createdAt,
                  },
                ],
              }
            : t,
        ),
      }));
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  }

  // ---------- Utility Operations ----------

  function addColumn(label: string) {
    const id = crypto.randomUUID();
    const colors = ["#A78BFA", "#34D399", "#F472B6", "#60A5FA", "#FBBF24"];
    const accentColor = colors[columns.length % colors.length];
    const newCol: KanbanColumnDef = {
      id,
      label: label.trim(),
      accentColor,
      bgColor: accentColor + "18",
    };
    setColumns((prev) => [...prev, newCol]);
    setTickets((prev) => ({ ...prev, [id]: [] }));
  }

  function deleteColumn(columnId: KanbanColumnId) {
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
    setTickets((prev) => {
      const updated = { ...prev };
      delete updated[columnId];
      return updated;
    });
  }

  function addCustomTag(label: string, color: string) {
    const id = crypto.randomUUID();
    setCustomTags((prev) => [...prev, { id, label: label.trim(), color }]);
  }

  function deleteCustomTag(tagId: string) {
    setCustomTags((prev) => prev.filter((t) => t.id !== tagId));
    setTickets((prev) => {
      const updated = { ...prev };
      for (const colId of Object.keys(updated)) {
        updated[colId] = updated[colId].map((t) => ({
          ...t,
          tags: t.tags?.filter((id) => id !== tagId),
        }));
      }
      return updated;
    });
  }

  return {
    columns,
    customTags,
    tickets,
    isLoading,
    addTicket,
    moveTicket,
    deleteTicket,
    updateTicket,
    addColumn,
    deleteColumn,
    addCustomTag,
    deleteCustomTag,
    addChecklist,
    toggleChecklist,
    addComment,
  };
}
