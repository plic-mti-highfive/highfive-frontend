import type { KanbanPriority } from "../types";

export const PRIORITY_CONFIG: Record<
  KanbanPriority,
  { color: string; label: string }
> = {
  high: { color: "#E0305A", label: "Haute" },
  medium: { color: "#B85A00", label: "Moyenne" },
  low: { color: "#2A8C1E", label: "Basse" },
};

/** Default columns for a new project - 3 universal stages */
export const DEFAULT_COLUMNS = [
  { id: "todo", label: "À faire", accentColor: "#3EC6F5", bgColor: "#D4F1FF" },
  {
    id: "in-progress",
    label: "En cours",
    accentColor: "#FF6B1A",
    bgColor: "#FFE5D1",
  },
  { id: "done", label: "Terminé", accentColor: "#5ED651", bgColor: "#DFFBD4" },
];

/** Palette for user-created tags (cycles through on creation) */
export const TAG_COLOR_PALETTE = [
  "#3EC6F5", // sky
  "#FF6B1A", // orange
  "#C24BFF", // purple
  "#E0305A", // rose
  "#5ED651", // green
  "#F5C842", // yellow
  "#1A8CFF", // blue
  "#FF4FCB", // pink
];

const ASSIGNEE_COLORS = [
  { bg: "#FFE8F1", text: "#CC0055" },
  { bg: "#FFF0E6", text: "#AA3A00" },
  { bg: "#E5F8FF", text: "#0A6080" },
  { bg: "#F5E8FF", text: "#7000B8" },
  { bg: "#EDFCE8", text: "#1A7010" },
];

export function getAssigneeColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return ASSIGNEE_COLORS[Math.abs(hash) % ASSIGNEE_COLORS.length];
}

export function assigneeInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Returns a light bg tint for a solid hex color */
export function tagBg(hex: string) {
  return hex + "22";
}
