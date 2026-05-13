import { useState, useRef } from "react";
import { Plus, MousePointerClick, Trash2 } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import type { KanbanTicket, KanbanColumnId, CustomTag } from "../types";

interface KanbanColumnProps {
  id: KanbanColumnId;
  label: string;
  accentColor: string;
  bgColor: string;
  tickets: KanbanTicket[];
  customTags: CustomTag[];
  onAddTicket: (columnId: KanbanColumnId, title: string) => void;
  onDeleteTicket: (ticketId: string, columnId: KanbanColumnId) => void;
  onDragStart: (ticketId: string, columnId: KanbanColumnId) => void;
  onDrop: (targetColumnId: KanbanColumnId, dropIndex?: number) => void;
  onOpenTicket: (ticketId: string, columnId: KanbanColumnId) => void;
  onDeleteColumn: (columnId: KanbanColumnId) => void;
}

export function KanbanColumn({
  id,
  label,
  accentColor,
  bgColor,
  tickets,
  customTags,
  onAddTicket,
  onDeleteTicket,
  onDragStart,
  onDrop,
  onOpenTicket,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleSubmit = () => {
    if (newTitle.trim()) {
      onAddTicket(id, newTitle);
      setNewTitle("");
    }
    setAdding(false);
  };

  const isEmpty = tickets.length === 0 && !adding;

  const calculateDropIndex = (e: React.DragEvent) => {
    const containerRect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY - containerRect.top;

    let insertIndex = 0;
    for (let i = 0; i < tickets.length; i++) {
      const cardElement = cardRefs.current.get(tickets[i].id);
      if (!cardElement) continue;

      const cardRect = cardElement.getBoundingClientRect();
      const cardMiddle = cardRect.top + cardRect.height / 2 - containerRect.top;

      if (mouseY < cardMiddle) {
        insertIndex = i;
        break;
      }
      insertIndex = i + 1;
    }

    return insertIndex;
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
        const index = calculateDropIndex(e);
        setDropIndex(index);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsOver(false);
          setDropIndex(null);
        }
      }}
      onDrop={() => {
        setIsOver(false);
        onDrop(id, dropIndex ?? undefined);
        setDropIndex(null);
      }}
      className={`relative flex flex-col rounded-2xl transition-all duration-150 ${
        isOver ? "ring-2 ring-[var(--color-rose)]" : ""
      }`}
      style={{ width: "280px", minHeight: "220px" }}
    >
      {/* Background avec adaptation light/dark */}
      <div
        className="absolute inset-0 rounded-2xl dark:opacity-20"
        style={{ backgroundColor: bgColor }}
      />
      {/* Column header */}
      <div className="relative group/header flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-ui-md text-foreground dark:text-card-foreground truncate">
            {label}
          </span>
          <span
            className="text-label font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0"
            style={{ backgroundColor: accentColor + "28", color: accentColor }}
          >
            {tickets.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-body-sm text-muted-foreground dark:text-card-foreground/60">
                Supprimer ?
              </span>
              <button
                onClick={() => onDeleteColumn(id)}
                className="text-ui-sm font-semibold px-2 py-0.5 rounded-lg bg-red-500 text-white cursor-pointer hover:bg-red-600 transition-colors"
              >
                Oui
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-ui-sm font-semibold px-2 py-0.5 rounded-lg border border-border text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
              >
                Non
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="opacity-0 group-hover/header:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 cursor-pointer transition-all"
              aria-label={`Supprimer la colonne ${label}`}
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-ui-sm font-bold transition-all cursor-pointer hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]"
            style={{ backgroundColor: accentColor + "22", color: accentColor }}
            aria-label={`Ajouter un ticket dans ${label}`}
          >
            <Plus size={12} strokeWidth={2.5} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Cards list */}
      <div className="relative flex-1 flex flex-col gap-2.5 px-3 pb-3">
        {/* Empty state */}
        {isEmpty && (
          <div
            className="flex flex-col items-center justify-center py-7 px-4 rounded-xl border-2 border-dashed text-center transition-colors"
            style={{ borderColor: accentColor + "50" }}
          >
            <MousePointerClick
              size={20}
              className="mb-2 opacity-40"
              style={{ color: accentColor }}
            />
            <p className="text-body-sm font-medium text-foreground dark:text-card-foreground mb-1">
              Aucun ticket
            </p>
            <p className="text-body-sm text-muted-foreground dark:text-card-foreground/60 mb-3 leading-snug">
              Ajoutez un ticket pour démarrer !
            </p>
            <button
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 text-ui-sm font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:opacity-90 active:scale-[0.97]"
              style={{
                backgroundColor: accentColor + "20",
                color: accentColor,
              }}
            >
              <Plus size={12} />
              Ajouter un ticket
            </button>
          </div>
        )}

        {tickets.map((ticket, index) => (
          <div key={ticket.id} className="relative">
            {/* Drop indicator */}
            {dropIndex === index && (
              <div className="absolute -top-1.5 left-0 right-0 h-0.5 bg-[var(--color-rose)] rounded-full shadow-[0_0_8px_rgba(224,48,90,0.6)]" />
            )}
            <div ref={(el) => el && cardRefs.current.set(ticket.id, el)}>
              <KanbanCard
                ticket={ticket}
                columnId={id}
                customTags={customTags}
                onDelete={onDeleteTicket}
                onDragStart={onDragStart}
                onOpen={onOpenTicket}
              />
            </div>
            {/* Drop indicator at the end after last card */}
            {dropIndex === tickets.length && index === tickets.length - 1 && (
              <div className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-[var(--color-rose)] rounded-full shadow-[0_0_8px_rgba(224,48,90,0.6)]" />
            )}
          </div>
        ))}

        {/* Inline add form */}
        {adding ? (
          <div className="bg-card dark:bg-card/80 rounded-xl border border-border p-3 shadow-sm">
            <textarea
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewTitle("");
                }
              }}
              placeholder="Titre du ticket…"
              rows={2}
              className="w-full resize-none text-body-md text-foreground bg-transparent outline-none placeholder:text-muted-foreground focus-visible:outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSubmit}
                className="flex-1 text-ui-md py-1.5 rounded-lg text-background bg-foreground hover:opacity-80 active:opacity-70 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Ajouter
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setNewTitle("");
                }}
                className="px-3 py-1.5 rounded-lg text-ui-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          !isEmpty && (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-muted-foreground dark:text-card-foreground/60 hover:text-foreground dark:hover:text-card-foreground text-body-sm py-2 px-2 rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose)]"
            >
              <Plus size={13} />
              Ajouter un ticket
            </button>
          )
        )}
      </div>
    </div>
  );
}
