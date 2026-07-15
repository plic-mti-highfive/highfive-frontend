import type { Project } from "@shared/types";
import { HeroCard } from "@shared/components/projects";

interface FeaturedLayoutProps {
  hero: Project;
}

export function FeaturedLayout({ hero }: FeaturedLayoutProps) {
  return (
    <section>
      <h2 className="text-xl font-bold text-foreground mb-5">
        Projets de la semaine
      </h2>
      <HeroCard project={hero} />
    </section>
  );
}
