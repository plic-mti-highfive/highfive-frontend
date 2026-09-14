import { Link } from "react-router-dom";

import { Avatar, AvatarGroup, Badge, Card, TagPill } from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { getAccent } from "@shared/lib/accent";
import { getTagById, type ProjectSummary } from "@/domain";
import { preloadProjectDetail, preloadProjectFiche } from "@/app/preload";
import { HighfiveButton } from "./HighfiveButton";

function preloadFiche() {
  void preloadProjectFiche();
  void preloadProjectDetail();
}

const PARTICIPATION_LABEL: Record<ProjectSummary["participation"], string> = {
  open: "Ouvert à tous",
  on_request: "Sur demande",
  on_invite: "Sur invitation",
};

function participationLabel(project: ProjectSummary): string {
  return project.visibility === "private"
    ? "Privé"
    : PARTICIPATION_LABEL[project.participation];
}

export interface ProjectCardProps {
  project: ProjectSummary;
  /** `featured` : "Le projet du moment" (doc 12 E-01), une par page. */
  variant?: "feed" | "featured";
  className?: string;
}

/**
 * Composant le plus important du produit (doc 11 C1) : porte le moment
 * "wow" (doc 01 §5). Un seul lien principal (la carte entiere, R-NAV5) plus
 * le `HighfiveButton`, seul autre element interactif, releve au-dessus via
 * z-index pour rester cliquable independamment (doc 12 : "Highfive depuis la
 * carte : reaction optimiste, aucune navigation").
 */
export function ProjectCard({
  project,
  variant = "feed",
  className,
}: ProjectCardProps) {
  const featured = variant === "featured";
  const accent = getAccent(project.id);
  const href = `/projets/${project.slug}`;
  const unmetNeeds = project.needs.filter((need) => !need.fulfilled);
  const team =
    project.teamPreview.length > 0 ? project.teamPreview : [project.owner];

  return (
    <Card
      variant="interactive"
      data-accent={accent}
      className={cn(
        "relative flex flex-col gap-3",
        featured ? "p-7" : "p-5",
        className,
      )}
    >
      <Link
        to={href}
        aria-label={project.title}
        onMouseEnter={preloadFiche}
        onFocus={preloadFiche}
        className="absolute inset-0 z-10 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      />

      <div className="flex items-center gap-2">
        <Badge tone="neutral">{participationLabel(project)}</Badge>
      </div>

      <h3
        className={cn(
          "font-bold text-foreground",
          featured
            ? "text-heading-lg leading-tight"
            : "text-heading-md leading-snug line-clamp-1",
        )}
      >
        {project.title}
      </h3>

      <p
        className={cn(
          "text-body-md text-muted-foreground",
          featured ? "line-clamp-3" : "line-clamp-2",
        )}
      >
        {project.tagline}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {project.tags.slice(0, featured ? 5 : 3).map((tagId) => {
          const tag = getTagById(tagId);
          return (
            <TagPill
              key={tagId}
              label={tag?.label ?? tagId}
              accent={tag?.accent}
              size="xs"
            />
          );
        })}
      </div>

      {unmetNeeds.length > 0 && (
        <p className="text-body-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Cherche : </span>
          {unmetNeeds
            .slice(0, 3)
            .map((need) => need.label)
            .join(" · ")}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <AvatarGroup max={5}>
            {team.map((member) => (
              <Avatar
                key={member.id}
                name={member.displayName ?? member.username}
                src={member.avatar}
                size="xs"
              />
            ))}
          </AvatarGroup>
          <span className="text-body-sm text-muted-foreground">
            {project.membersCount}{" "}
            {project.membersCount > 1 ? "membres" : "membre"}
          </span>
        </div>

        <div className="relative z-20">
          <HighfiveButton
            slug={project.slug}
            ownerId={project.owner.id}
            count={project.highfiveCount}
            size="sm"
          />
        </div>
      </div>
    </Card>
  );
}
