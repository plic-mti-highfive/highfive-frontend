import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Share2 } from "lucide-react";

import { Avatar, Badge, Button, IconButton, TagPill } from "@shared/ui";
import { HighfiveButton } from "@shared/components/projects";
import { preloadCustomizeProject } from "@/app/preload";
import type { Project, UserSummary } from "@/domain";
import { PARTICIPATION_LABEL, STATE_LABEL, STATE_TONE } from "../lib/labels";
import { JoinAction } from "./JoinAction";

/**
 * En-tete de la fiche (doc 13 E-10) : porteur, titre en Geist (R-DA... le
 * display Fraunces reste reserve au seul logo, DESIGN.md "Wordmark-Only
 * Serif Rule"), accroche, tags, etat + participation, action principale.
 *
 * `Project` (GET /projects/:slug) ne porte que `ownerId` — contrairement a
 * `ProjectSummary` qui resout deja `owner`. Le porteur affiche ici vient du
 * `TeamMember` de role "owner" dans `members` (deja recupere par
 * `ProjectLayout` pour l'onglet Equipe), passe en prop plutot que refetch.
 */
export function ProjectHeader({
  project,
  owner,
  isAuthenticated,
  isMember,
  canEdit,
  highfiveGiven,
  tinted = false,
}: {
  project: Project;
  owner?: UserSummary;
  isAuthenticated: boolean;
  isMember: boolean;
  /** Porteur ou co-porteur : affiche le lien vers l'editeur de la fiche. */
  canEdit: boolean;
  highfiveGiven: boolean;
  /** Le header est pose sur le fond teinte de l'accent du projet : tags et badges passent sur fond carte pour rester lisibles. */
  tinted?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (permissions, contexte non securise) :
      // pas de raccourci de repli invente, l'action reste silencieuse.
    }
  }

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
      <div className="flex flex-1 flex-col gap-4">
        {owner && (
          <div className="flex items-center gap-1 text-body-sm text-muted-foreground">
            <p>Créé par</p>
            <Avatar
              name={owner.displayName ?? owner.username}
              src={owner.avatar}
              size="xs"
            />
            <Link
              to={`/u/${owner.username}`}
              className="font-medium text-foreground hover:underline"
            >
              @{owner.username}
            </Link>
          </div>
        )}

        <h1 className="text-heading-lg font-bold text-foreground">
          {project.title}
        </h1>

        <p className="text-body-lg text-foreground">{project.tagline}</p>

        <div className="flex flex-wrap items-center gap-2">
          {project.tags.map((tag) => (
            <TagPill
              key={tag}
              label={tag}
              className={tinted ? "bg-card" : undefined}
            />
          ))}
          <Badge
            tone={STATE_TONE[project.state]}
            className={tinted ? "bg-card" : undefined}
          >
            {STATE_LABEL[project.state]}
          </Badge>
          <Badge tone="neutral" className={tinted ? "bg-card" : undefined}>
            {PARTICIPATION_LABEL[project.participation]}
          </Badge>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-start justify-between gap-3 sm:items-end">
        <div className="flex flex-wrap items-center gap-3">
          <JoinAction
            slug={project.slug}
            projectTitle={project.title}
            participation={project.participation}
            isAuthenticated={isAuthenticated}
            isMember={isMember}
          />
          {canEdit && (
            <Button
              variant="outline"
              render={
                <Link
                  to={`/projets/${project.slug}/modifier`}
                  onMouseEnter={() => void preloadCustomizeProject()}
                  onFocus={() => void preloadCustomizeProject()}
                />
              }
            >
              Modifier la fiche
              <ArrowRight aria-hidden="true" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <HighfiveButton
            slug={project.slug}
            ownerId={project.ownerId}
            given={highfiveGiven}
            count={project.highfiveCount}
          />
          <IconButton
            aria-label={copied ? "Lien copié" : "Partager"}
            onClick={handleShare}
          >
            <Share2 size={16} />
          </IconButton>
          {copied && (
            <span role="status" className="text-body-sm text-muted-foreground">
              Lien copié
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
