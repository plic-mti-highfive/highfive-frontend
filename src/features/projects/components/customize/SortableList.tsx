import type { CSSProperties, ReactNode } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";

import { buttonVariants } from "@shared/ui";
import { cn } from "@shared/lib/cn";

/**
 * Liste reordonnable par glisser-deposer (dnd-kit), en amelioration des
 * boutons ↑/↓ qui restent toujours disponibles (WCAG 2.5.7 : toute action
 * de glissement a une alternative sans glisser). La poignee seule declenche
 * le glisser, a la souris, au tactile ou au clavier (Espace, fleches,
 * Espace). Les annonces et consignes sont en francais. Aucune animation de
 * transition : l'element suit le pointeur, les autres changent de place net.
 */
export function SortableList<T extends { id: string }>({
  items,
  getLabel,
  onReorder,
  renderItem,
  className,
  itemClassName,
}: {
  items: T[];
  /** Nom lisible d'un element, pour les annonces vocales et le nom de la poignee. */
  getLabel: (item: T) => string;
  /** Appelee avec la nouvelle liste apres un depot (jamais si la position n'a pas change). */
  onReorder: (items: T[]) => void;
  /** Rend le contenu d'un element ; `handle` est la poignee a placer ou l'on veut. */
  renderItem: (item: T, index: number, handle: ReactNode) => ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  const sensors = useSensors(
    // Un petit seuil : un simple clic sur la poignee n'est pas un glisser.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const labelOf = (id: string | number) => {
    const item = items.find((candidate) => candidate.id === id);
    return item ? getLabel(item) : "Élément";
  };
  const positionOf = (id: string | number) =>
    items.findIndex((candidate) => candidate.id === id) + 1;
  const total = items.length;

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      `${labelOf(active.id)} saisi, position ${positionOf(active.id)} sur ${total}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${labelOf(active.id)} déplacé en position ${positionOf(over.id)} sur ${total}.`
        : `${labelOf(active.id)} n'est plus au-dessus d'une position.`,
    onDragEnd: ({ active, over }) =>
      over
        ? `${labelOf(active.id)} déposé en position ${positionOf(over.id)} sur ${total}.`
        : `${labelOf(active.id)} déposé à sa position d'origine.`,
    onDragCancel: ({ active }) =>
      `Déplacement annulé. ${labelOf(active.id)} reste en position ${positionOf(active.id)} sur ${total}.`,
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            "Pour réordonner : appuie sur Espace pour saisir, déplace avec les flèches haut et bas, puis Espace pour déposer ou Échap pour annuler.",
        },
      }}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol className={className}>
          {items.map((item, index) => (
            <SortableRow
              key={item.id}
              id={item.id}
              label={getLabel(item)}
              className={itemClassName}
            >
              {(handle) => renderItem(item, index, handle)}
            </SortableRow>
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  label,
  className,
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: (handle: ReactNode) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useSortable({ id, transition: null });

  // Variables CSS dynamiques uniquement (V2-2), construites hors JSX.
  const dragStyle = {
    "--drag-x": `${transform?.x ?? 0}px`,
    "--drag-y": `${transform?.y ?? 0}px`,
  } as CSSProperties;

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Réordonner « ${label} » (glisser)`}
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "cursor-grab touch-none transition-none",
        isDragging && "cursor-grabbing",
      )}
    >
      <GripVertical size={16} aria-hidden="true" />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={dragStyle}
      className={cn(
        "[transform:translate3d(var(--drag-x),var(--drag-y),0)]",
        isDragging && "relative z-sticky opacity-90 shadow-overlay",
        className,
      )}
    >
      {children(handle)}
    </li>
  );
}
