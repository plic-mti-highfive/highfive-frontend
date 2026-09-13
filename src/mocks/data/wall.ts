import { wallSchema, type Wall } from "@/domain";
import { hoursAgo } from "./ids";
import { PROJECTS } from "./projects";

/** Un Mur par projet (doc 04 §10), cree avec le projet. */
export const WALLS: Wall[] = PROJECTS.map((project) =>
  wallSchema.parse({
    projectId: project.id,
    updatedAt: hoursAgo(1),
  }),
);
