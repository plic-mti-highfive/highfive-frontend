import type { KanbanPriority } from "../types";
import {
  ACCENT_NAMES,
  getAccent,
  resolveAccentColor,
} from "@shared/lib/accent";

// Couleurs dérivées de la roue d'accent (src/shared/lib/accent.ts) : plus
// aucune valeur hex en dur ici, tout est résolu depuis les tokens CSS de
// src/index.css. Les noms/formes exportés restent inchangés pour ne pas
// casser les appelants (KanbanCard, TicketDrawer, useKanban, LabPage).

export const PRIORITY_CONFIG: Record<
  KanbanPriority,
  { color: string; label: string }
> = {
  high: { color: resolveAccentColor("rose", "dark"), label: "Haute" },
  medium: { color: resolveAccentColor("orange", "dark"), label: "Moyenne" },
  low: { color: resolveAccentColor("apple", "dark"), label: "Basse" },
};

/** Colonnes par défaut d'un nouveau projet - 3 étapes universelles. */
export const DEFAULT_COLUMNS = [
  {
    id: "todo",
    label: "À faire",
    accentColor: resolveAccentColor("sky"),
    bgColor: resolveAccentColor("sky", "light"),
  },
  {
    id: "in-progress",
    label: "En cours",
    accentColor: resolveAccentColor("orange"),
    bgColor: resolveAccentColor("orange", "light"),
  },
  {
    id: "done",
    label: "Terminé",
    accentColor: resolveAccentColor("apple"),
    bgColor: resolveAccentColor("apple", "light"),
  },
];

/** Palette proposée pour les étiquettes créées à la main (cycle la roue d'accent). */
export const TAG_COLOR_PALETTE = ACCENT_NAMES.map((accent) =>
  resolveAccentColor(accent),
);

export function getAssigneeColor(name: string): { bg: string; text: string } {
  const accent = getAccent(name);
  return {
    bg: resolveAccentColor(accent, "light"),
    text: resolveAccentColor(accent, "dark"),
  };
}

export function assigneeInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Teinte de fond légère pour une couleur pleine donnée (résolue depuis un token). */
export function tagBg(hex: string) {
  return hex + "22";
}
