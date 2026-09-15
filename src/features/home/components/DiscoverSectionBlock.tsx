import { Link } from "react-router-dom";

import { Section } from "@shared/ui";
import { ProjectCard } from "@shared/components/projects";
import type { DiscoverSection, DiscoverSectionId } from "@/domain";
import { discoverSeeAllHref } from "../lib/searchHref";

/**
 * Libelles des sections (doc 03 vocabulaire) : cote front, jamais renvoyes
 * par l'API (voir docs/v2/API-ROUTES.md, `DiscoverSection`).
 */
const SECTION_LABELS: Record<DiscoverSectionId, string> = {
  for_you: "Pour toi",
  starting: "Nouveaux projets",
  trending_highfives: "Projets aimés de la semaine",
  needs_help: "Ils cherchent des profils",
  near_your_projects: "Projets similaires aux tiens",
};

/**
 * Une section du fil Decouvrir (doc 12 E-01, retour utilisateur "Decouvrir
 * connecte trop pauvre") : titre, 3 a 6 `ProjectCard`, lien "Voir plus" vers
 * `/recherche` avec les parametres fournis par le serveur (`seeAll`).
 */
export function DiscoverSectionBlock({
  section,
}: {
  section: DiscoverSection;
}) {
  if (section.items.length === 0) return null;

  return (
    <Section
      title={SECTION_LABELS[section.id]}
      actions={
        <Link
          to={discoverSeeAllHref(section.seeAll)}
          className="shrink-0 text-body-sm font-medium text-foreground outline-none transition-colors duration-fast hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          Voir plus
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {section.items.map((project) => (
          <ProjectCard key={project.id} project={project} variant="feed" />
        ))}
      </div>
    </Section>
  );
}
