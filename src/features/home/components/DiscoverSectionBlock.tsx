import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Divider, Section } from "@shared/ui";
import { ProjectCard } from "@shared/components/projects";
import type { DiscoverSection, DiscoverSectionId } from "@/domain";
import { discoverSeeAllHref } from "../lib/searchHref";

const SECTION_LABELS: Record<DiscoverSectionId, string> = {
  for_you: "Pour toi",
  starting: "Nouveaux projets",
  trending_highfives: "Aimés cette semaine",
  needs_help: "Ils cherchent des profils",
  near_your_projects: "Projets similaires aux tiens",
};

/**
 * Variante de `ProjectCard` par section (V2 : donner du rythme à Découvrir,
 * plutôt qu'une répétition de la même carte partout). `starting`/`needs_help`
 * en `list` : volume plus lisible que des cartes pleines pour du contenu
 * récent/annexe. `trending_highfives` en `top` : classement, l'ordre porte du
 * sens. `for_you`/`near_your_projects` gardent `card` (grille), coeur du feed.
 */
const SECTION_VARIANT: Record<DiscoverSectionId, "card" | "list" | "top"> = {
  for_you: "card",
  starting: "list",
  trending_highfives: "top",
  needs_help: "card",
  near_your_projects: "card",
};

export function DiscoverSectionBlock({
  section,
}: {
  section: DiscoverSection;
}) {
  if (section.items.length === 0) return null;

  const variant = SECTION_VARIANT[section.id];

  return (
    <Section
      title={SECTION_LABELS[section.id]}
      titleSize="lg"
      actions={
        <Link
          to={discoverSeeAllHref(section.seeAll)}
          className="flex shrink-0 items-center gap-1 text-body-sm font-medium text-foreground outline-none transition-colors duration-fast hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          Voir plus
          <ArrowRight className="size-3.5" />
        </Link>
      }
    >
      {variant === "card" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {section.items.map((project) => (
            <ProjectCard key={project.id} project={project} variant="card" />
          ))}
        </div>
      )}

      {variant === "list" && (
        <div className="flex flex-col">
          {section.items.map((project, i) => (
            <div key={project.id}>
              <ProjectCard project={project} variant="list" />
              {i < section.items.length - 1 && <Divider />}
            </div>
          ))}
        </div>
      )}

      {variant === "top" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              variant="top"
              rank={i + 1}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
