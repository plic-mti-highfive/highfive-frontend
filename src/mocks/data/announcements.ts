import { announcementSchema, type Announcement } from "@/domain";
import { daysAgo, nextId } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

function announcement(input: {
  slug: string;
  authorId: string;
  title: string;
  body: string;
  pinned?: boolean;
  publishedDaysAgo: number;
}): Announcement {
  const project = PROJECT_BY_SLUG.get(input.slug);
  if (!project)
    throw new Error(`Projet inconnu dans le jeu de demo : ${input.slug}`);
  return announcementSchema.parse({
    id: nextId(),
    projectId: project.id,
    authorId: input.authorId,
    title: input.title,
    body: input.body,
    pinned: input.pinned ?? false,
    publishedAt: daysAgo(input.publishedDaysAgo),
  });
}

/** Doc 23 §6 : deux annonces sur le projet 1, dont une epinglee (R-A2). */
export const ANNOUNCEMENTS: Announcement[] = [
  announcement({
    slug: "fresque-murale-collaborative",
    authorId: u.alexRivera.id,
    title: "On a l'accord de la mairie",
    body: "Le service technique nous laisse Tableau blanc jusqu'en septembre. On commence samedi 14, rendez-vous à 9 h devant le gymnase. Apportez de vieux vêtements.",
    pinned: true,
    publishedDaysAgo: 3,
  }),
  announcement({
    slug: "fresque-murale-collaborative",
    authorId: u.alexRivera.id,
    title: "Il nous manque quelqu'un pour la photo",
    body: "On voudrait garder une trace de chaque samedi. Pas besoin de matériel pro.",
    publishedDaysAgo: 11,
  }),
  announcement({
    slug: "repair-cafe-du-mois",
    authorId: u.thomasDupont.id,
    title: "Nouvelle session ce samedi",
    body: "Apportez ce qui grince, ce qui ne s'allume plus, ou ce qui prend la poussière. On regarde tout.",
    publishedDaysAgo: 2,
  }),
];
