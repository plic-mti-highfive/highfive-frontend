import { Section } from "@shared/ui";
import { ProjectCard } from "@shared/components/projects/ProjectCard";
import { useProjects } from "@/api/queries/projects";
import type { Project } from "@/domain";

/**
 * "Projets proches" (doc 13 E-10 sidebar). Le contrat n'expose pas de route
 * de similarite dediee : on reutilise `GET /projects` filtre par les memes
 * tags, ce qui reste fidele a l'intention ("proche" = memes themes) sans
 * inventer de route hors de `docs/v2/API-ROUTES.md`.
 */
export function NearbyProjects({ project }: { project: Project }) {
  const { data } = useProjects({ tags: project.tags, limit: 5 });
  const nearby = (data?.items ?? [])
    .filter((item) => item.slug !== project.slug)
    .slice(0, 4);

  if (nearby.length === 0) return null;

  return (
    <Section title="Projets proches">
      <div className="flex flex-col gap-3">
        {nearby.map((item) => (
          <ProjectCard key={item.id} project={item} />
        ))}
      </div>
    </Section>
  );
}
