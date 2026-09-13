import { projectFileSchema, type ProjectFile } from "@/domain";
import { daysAgo, nextId } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

function file(input: {
  slug: string;
  uploadedBy: string;
  name: string;
  size: number;
  mimeType: string;
  daysAgo: number;
}): ProjectFile {
  const project = PROJECT_BY_SLUG.get(input.slug);
  if (!project)
    throw new Error(`Projet inconnu dans le jeu de demo : ${input.slug}`);
  return projectFileSchema.parse({
    id: nextId(),
    projectId: project.id,
    uploadedBy: input.uploadedBy,
    name: input.name,
    size: input.size,
    mimeType: input.mimeType,
    uploadedAt: daysAgo(input.daysAgo),
  });
}

/** R-F1/R-F2 : quelques fichiers realistes (images, PDF), sous les plafonds de taille. */
export const FILES: ProjectFile[] = [
  file({
    slug: "fresque-murale-collaborative",
    uploadedBy: u.alexRivera.id,
    name: "relevé-dimensions-mur-nord.pdf",
    size: 812_000,
    mimeType: "application/pdf",
    daysAgo: 5,
  }),
  file({
    slug: "fresque-murale-collaborative",
    uploadedBy: u.sophieMartin.id,
    name: "photo-mur-avant.jpg",
    size: 2_400_000,
    mimeType: "image/jpeg",
    daysAgo: 3,
  }),
  file({
    slug: "maree-basse-jeu-video",
    uploadedBy: u.nadiaK.id,
    name: "moodboard-fonds-marins.png",
    size: 1_100_000,
    mimeType: "image/png",
    daysAgo: 8,
  }),
];
