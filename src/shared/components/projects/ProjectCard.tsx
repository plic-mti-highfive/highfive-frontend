import { useState, type CSSProperties } from "react";
import { Hand, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar, AvatarGroup, Badge, Card, Divider, TagPill } from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { getAccent } from "@shared/lib/accent";
import { accentAttributes } from "@shared/lib/accentColor";
import { getTagById, type ProjectBanner, type ProjectSummary } from "@/domain";
import { preloadProjectDetail, preloadProjectFiche } from "@/app/preload";

function preloadFiche() {
  void preloadProjectFiche();
  void preloadProjectDetail();
}

/** Compteur non interactif (V2 : le highfive se donne sur la fiche projet
 * via `HighfiveButton`, plus depuis la carte — évite le double sens
 * "cliquable" sur un élément qui recouvre déjà tout le lien de la carte). */
function HighfiveCount({ count }: { count: number }) {
  return (
    <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-body-sm font-medium text-foreground">
      <Hand className="size-3.5" />
      <span className="tabular-nums">{count}</span>
    </span>
  );
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

/** Motif décoratif du panneau `hero` quand le projet n'a pas de bannière :
 * purement CSS, dérivé de l'accent du projet. */
const HERO_PATTERNS = [
  "dots",
  "stripes-diagonal",
  "stripes-horizontal",
] as const;

function heroPatternStyle(id: string): CSSProperties {
  const pattern = HERO_PATTERNS[hashChar(id) % HERO_PATTERNS.length];
  switch (pattern) {
    case "dots":
      return {
        backgroundColor: "var(--accent-light)",
        backgroundImage:
          "radial-gradient(var(--accent-base) 1.5px, transparent 1.5px)",
        backgroundSize: "16px 16px",
      };
    case "stripes-diagonal":
      return {
        backgroundColor: "var(--accent-light)",
        backgroundImage:
          "repeating-linear-gradient(45deg, var(--accent-base) 0, var(--accent-base) 2px, transparent 2px, transparent 14px)",
      };
    case "stripes-horizontal":
      return {
        backgroundColor: "var(--accent-light)",
        backgroundImage:
          "repeating-linear-gradient(0deg, var(--accent-base) 0, var(--accent-base) 2px, transparent 2px, transparent 12px)",
      };
  }
}

function hashChar(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++)
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

/**
 * Bannière du projet, recadrée autour de son point focal. Décorative (`alt=""`,
 * masquée aux lecteurs d'écran) : le lien de la carte porte déjà le titre du
 * projet. Ratio réservé par le parent (pas de décalage au chargement), fond
 * `bg-muted` le temps du chargement, jamais de texte posé sur l'image.
 */
function CardCover({
  banner,
  eager,
  onError,
  className,
}: {
  banner: ProjectBanner;
  /** `hero` : image probablement visible dès l'arrivée, chargée sans attendre. */
  eager: boolean;
  onError: () => void;
  className?: string;
}) {
  // Variable CSS dynamique uniquement (V2-2) ; construite hors JSX comme dans
  // `ProjectBanner` pour passer `check-tokens` après prettier.
  const focalStyle = {
    "--focal": `${banner.focal.x}% ${banner.focal.y}%`,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className={cn("relative shrink-0 overflow-hidden bg-muted", className)}
    >
      <img
        src={banner.url}
        alt=""
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        style={focalStyle}
        onError={onError}
        className="absolute inset-0 size-full object-cover object-[position:var(--focal)]"
      />
    </div>
  );
}

export interface ProjectCardProps {
  project: ProjectSummary;
  /**
   * `hero` : "Le projet du moment", une par page. `card` : grille (défaut).
   * `list` : ligne compacte (ex. "Nouveaux projets"). `top` : ligne classée,
   * requiert `rank`.
   */
  variant?: "card" | "hero" | "list" | "top";
  /** Position 1-indexée, affichée en grand chiffre pour `variant="top"`. */
  rank?: number;
  className?: string;
}

/**
 * Composant le plus important du produit (doc 11 C1) : porte le moment
 * "wow" (doc 01 §5). Un seul lien : la carte entiere (R-NAV5). Le highfive
 * ne se donne plus depuis la carte, seulement affiche via `HighfiveCount`
 * (le geste reste reserve a la fiche projet, `HighfiveButton`).
 */
export function ProjectCard({
  project,
  variant = "card",
  rank,
  className,
}: ProjectCardProps) {
  // Couleur choisie par le porteur, sinon teinte hachee depuis l'id du projet.
  const accent = accentAttributes(project.accent, getAccent(project.id));
  // Image en erreur : la carte retombe sur le rendu sans image. Mémorisée par
  // URL pour qu'un autre fichier (aperçu de l'éditeur) retente le chargement.
  const [failedCoverUrl, setFailedCoverUrl] = useState<string | null>(null);
  const href = `/projets/${project.slug}`;
  const unmetNeeds = project.needs.filter((need) => !need.fulfilled);
  const team =
    project.teamPreview.length > 0 ? project.teamPreview : [project.owner];

  if (variant === "list") {
    return (
      <div
        {...accent}
        className={cn(
          "group relative isolate flex items-center gap-3 rounded-lg px-3 py-3 transition-[background-color,filter] duration-base -mx-3 hover:bg-muted/60 hover:brightness-95 dark:hover:brightness-110",
          className,
        )}
      >
        <Link
          to={href}
          aria-label={project.title}
          onMouseEnter={preloadFiche}
          onFocus={preloadFiche}
          className="absolute inset-0 z-10 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />

        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full bg-[var(--accent-base)]"
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-body-md font-bold text-foreground">
            {project.title}
          </h3>
          <p className="line-clamp-1 text-body-sm text-muted-foreground">
            {project.tagline}
          </p>
        </div>

        <div className="hidden shrink-0 flex-wrap gap-1.5 md:flex">
          {project.tags.slice(0, 2).map((tagId) => {
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

        <span className="hidden shrink-0 text-body-sm text-muted-foreground sm:inline">
          {project.owner.displayName ?? project.owner.username}
        </span>

        <HighfiveCount count={project.highfiveCount} />
      </div>
    );
  }

  if (variant === "top") {
    return (
      <div
        {...accent}
        className={cn(
          "group relative isolate flex h-full flex-col gap-2 rounded-lg p-4 transition-[background-color,filter] duration-base -m-1 hover:bg-muted/60 hover:brightness-95 dark:hover:brightness-110",
          className,
        )}
      >
        <Link
          to={href}
          aria-label={project.title}
          onMouseEnter={preloadFiche}
          onFocus={preloadFiche}
          className="absolute inset-0 z-10 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />

        <div className="grid h-full grid-cols-[auto_1fr] grid-rows-[auto_1fr_auto] gap-x-3 gap-y-2">
          <span className="col-start-1 row-start-1 font-display text-display-lg leading-none text-muted-foreground/30 transition-colors duration-base group-hover:text-[var(--accent-base)]">
            {String(rank ?? 0).padStart(2, "0")}
          </span>
          <div className="col-start-2 row-start-1 min-w-0 pt-1">
            <h3 className="truncate text-heading-md font-bold text-foreground">
              {project.title}
            </h3>
            <p className="line-clamp-2 min-h-[3.1em] text-body-sm text-muted-foreground">
              {project.tagline}
            </p>
          </div>

          <div className="col-start-2 row-start-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="shrink-0 text-body-sm text-muted-foreground">
                {project.owner.displayName ?? project.owner.username}
              </span>
              {project.tags.slice(0, 2).map((tagId) => {
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
            <HighfiveCount count={project.highfiveCount} />
          </div>
        </div>
      </div>
    );
  }

  const hero = variant === "hero";
  const cover =
    project.banner && project.banner.url !== failedCoverUrl
      ? project.banner
      : undefined;

  return (
    <Card
      variant="interactive"
      {...accent}
      className={cn(
        "relative flex overflow-hidden",
        cover && (hero ? "flex-col sm:flex-row" : "flex-col"),
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

      {cover && (
        <CardCover
          banner={cover}
          eager={hero}
          onError={() => setFailedCoverUrl(cover.url)}
          className={
            hero
              ? "aspect-video w-full sm:order-last sm:aspect-auto sm:w-64"
              : "aspect-video w-full"
          }
        />
      )}

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-3",
          hero ? "p-7" : "p-5",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-body-sm text-muted-foreground line-clamp-1">
              {project.owner.displayName ?? project.owner.username}
            </p>
            <h3
              className={cn(
                "font-bold text-foreground",
                hero
                  ? "text-heading-lg leading-tight"
                  : "text-heading-md leading-snug line-clamp-1",
              )}
            >
              {project.title}
            </h3>
          </div>
          <Badge tone="neutral" className="shrink-0">
            {participationLabel(project)}
          </Badge>
        </div>

        <p
          className={cn(
            "text-body-md text-muted-foreground",
            hero ? "line-clamp-3" : "line-clamp-2",
          )}
        >
          {project.tagline}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, hero ? 5 : 3).map((tagId) => {
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

          <HighfiveCount count={project.highfiveCount} />
        </div>

        {unmetNeeds.length > 0 && (
          <>
            <Divider />
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-1 text-label font-semibold uppercase tracking-wider text-muted-foreground">
                <Search className="size-3" />
                {unmetNeeds.length > 1
                  ? "Profils recherchés"
                  : "Profil recherché"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {unmetNeeds.slice(0, 3).map((need) => (
                  <TagPill key={need.label} label={need.label} size="xs" />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {hero && !cover && (
        <div
          aria-hidden="true"
          className="hidden w-64 shrink-0 sm:block"
          style={heroPatternStyle(project.id)}
        />
      )}
    </Card>
  );
}
