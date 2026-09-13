import { columnSchema, taskSchema, type Column, type Task } from "@/domain";
import { daysAgo, nextId } from "./ids";
import { PROJECTS } from "./projects";
import * as u from "./users";

/** R-K1 : 3 colonnes par defaut (A faire, En cours, Fait) sur chaque projet. */
export const COLUMNS: Column[] = [];
const columnsBySlug = new Map<string, Column[]>();

for (const project of PROJECTS) {
  const trio = [
    columnSchema.parse({
      id: nextId(),
      projectId: project.id,
      label: "À faire",
      order: 0,
    }),
    columnSchema.parse({
      id: nextId(),
      projectId: project.id,
      label: "En cours",
      order: 1,
    }),
    columnSchema.parse({
      id: nextId(),
      projectId: project.id,
      label: "Fait",
      order: 2,
    }),
  ];
  COLUMNS.push(...trio);
  columnsBySlug.set(project.slug, trio);
}

function columnId(
  slug: string,
  label: "À faire" | "En cours" | "Fait",
): string {
  const columns = columnsBySlug.get(slug);
  const column = columns?.find((c) => c.label === label);
  if (!column) throw new Error(`Colonne "${label}" introuvable pour ${slug}`);
  return column.id;
}

function task(input: {
  slug: string;
  column: "À faire" | "En cours" | "Fait";
  title: string;
  details?: string;
  assigneeIds?: string[];
  dueDate?: string;
  order: number;
  createdBy: string;
  createdDaysAgo: number;
  wallOriginId?: string;
}): Task {
  return taskSchema.parse({
    id: nextId(),
    columnId: columnId(input.slug, input.column),
    title: input.title,
    details: input.details,
    assigneeIds: input.assigneeIds ?? [],
    dueDate: input.dueDate,
    order: input.order,
    createdBy: input.createdBy,
    createdAt: daysAgo(input.createdDaysAgo),
    wallOriginId: input.wallOriginId,
  });
}

const fresqueSlug = "fresque-murale-collaborative";

/** Doc 23 §4 : taches du projet 1, y compris l'echeance depassee et le lien vers Le Mur. */
export const TASKS: Task[] = [
  task({
    slug: fresqueSlug,
    column: "À faire",
    title: "Repeindre le mur nord",
    order: 0,
    createdBy: u.alexRivera.id,
    createdDaysAgo: 12,
    wallOriginId: "wall-idea-fresque-trois-panneaux",
  }),
  task({
    slug: fresqueSlug,
    column: "À faire",
    title: "Trouver de la peinture extérieure",
    order: 1,
    createdBy: u.alexRivera.id,
    createdDaysAgo: 20,
    dueDate: "2026-05-12",
  }),
  task({
    slug: fresqueSlug,
    column: "À faire",
    title: "Prévenir les riverains",
    order: 2,
    createdBy: u.alexRivera.id,
    createdDaysAgo: 10,
    wallOriginId: "wall-idea-accord-mairie",
  }),
  task({
    slug: fresqueSlug,
    column: "En cours",
    title: "Demander l'accord de la mairie",
    assigneeIds: [u.alexRivera.id],
    order: 0,
    createdBy: u.marcLeroy.id,
    createdDaysAgo: 9,
  }),
  task({
    slug: fresqueSlug,
    column: "En cours",
    title: "Faire le relevé des dimensions",
    assigneeIds: [u.sophieMartin.id, u.camillePetit.id],
    order: 1,
    createdBy: u.camillePetit.id,
    createdDaysAgo: 5,
  }),
  task({
    slug: fresqueSlug,
    column: "Fait",
    title: "Publier l'annonce",
    order: 0,
    createdBy: u.alexRivera.id,
    createdDaysAgo: 25,
  }),
  task({
    slug: fresqueSlug,
    column: "Fait",
    title: "Réserver la nacelle",
    order: 1,
    createdBy: u.alexRivera.id,
    createdDaysAgo: 22,
  }),
  task({
    slug: fresqueSlug,
    column: "Fait",
    title: "Choisir les couleurs",
    order: 2,
    createdBy: u.marcLeroy.id,
    createdDaysAgo: 30,
  }),

  // Un peu de realisme sur trois autres projets actifs.
  task({
    slug: "jardin-partage-derriere-lecole",
    column: "À faire",
    title: "Réparer le composteur",
    order: 0,
    createdBy: u.camillePetit.id,
    createdDaysAgo: 6,
  }),
  task({
    slug: "jardin-partage-derriere-lecole",
    column: "En cours",
    title: "Planifier le planning d'arrosage d'été",
    assigneeIds: [u.annickR.id],
    order: 0,
    createdBy: u.camillePetit.id,
    createdDaysAgo: 3,
  }),
  task({
    slug: "maree-basse-jeu-video",
    column: "En cours",
    title: "Finir le niveau 2",
    assigneeIds: [u.nadiaK.id, u.enzoB.id],
    order: 0,
    createdBy: u.nadiaK.id,
    createdDaysAgo: 4,
  }),
  task({
    slug: "maree-basse-jeu-video",
    column: "Fait",
    title: "Prototype jouable a 60 fps",
    order: 0,
    createdBy: u.nadiaK.id,
    createdDaysAgo: 1,
  }),
  task({
    slug: "repair-cafe-du-mois",
    column: "À faire",
    title: "Commander des piles pour les testeurs",
    order: 0,
    createdBy: u.thomasDupont.id,
    createdDaysAgo: 2,
  }),
];
