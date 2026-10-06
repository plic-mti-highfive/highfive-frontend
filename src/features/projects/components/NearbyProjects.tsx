import { Section } from "@shared/ui";
import { ProjectCard } from "@shared/components/projects/ProjectCard";
import { useProjects } from "@/api/queries/projects";
import type { Project } from "@/domain";

/**
 * "Dans le meme esprit" (doc 13 E-10 "projets similaires"), en bande pleine
 * largeur sous l'apercu. Le contrat n'expose pas de route de similarite
 * dediee : on reutilise `GET /projects` filtre par les memes tags, ce qui
 * reste fidele a l'intention ("proche" = memes themes) sans inventer de route
 * hors de `docs/v2/API-ROUTES.md`.
 */
export function NearbyProjects({
  project,
  accentMarker = false,
}: {
  project: Project;
  accentMarker?: boolean;
}) {
  const { data } = useProjects({ tags: project.tags, limit: 4 });
  const nearby = (data?.items ?? [])
    .filter((item) => item.slug !== project.slug)
    .slice(0, 3);

  if (nearby.length === 0) return null;

  return (
    <Section
      title="Dans le même esprit"
      accentMarker={accentMarker}
      className="border-t border-border pt-10"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nearby.map((item) => (
          <ProjectCard key={item.id} project={item} />
        ))}
      </div>
    </Section>
  );
}
