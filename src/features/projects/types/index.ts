export type Mode = "ai" | "manual";

export type Step =
  | "choose"
  | "ai-pitch"
  | "ai-generating"
  | "manual-name"
  | "manual-desc"
  | "manual-tags"
  | "done";

export interface ProjectForm {
  name: string;
  description: string;
  tags: string[];
}

export const MANUAL_STEPS: Step[] = [
  "manual-name",
  "manual-desc",
  "manual-tags",
];
