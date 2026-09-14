import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react";

import { Avatar, Badge, Button, IconButton, TagPill } from "@shared/ui";
import { HighfiveButton } from "@shared/components/projects";
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
}: {
  project: Project;
  owner?: UserSummary;
  isAuthenticated: boolean;
  isMember: boolean;
  canEdit: boolean;
  highfiveGiven: boolean;
}) {
  const navigate = useNavigate();
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
    <header className="flex flex-col gap-4">
      {owner && (
        <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
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
          <TagPill key={tag} label={tag} />
        ))}
        <Badge tone={STATE_TONE[project.state]}>
          {STATE_LABEL[project.state]}
        </Badge>
        <Badge tone="neutral">
          {PARTICIPATION_LABEL[project.participation]}
        </Badge>
      </div>

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
            onClick={() => navigate(`/projets/${project.slug}?modifier=1`)}
          >
            Modifier
          </Button>
        )}
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
    </header>
  );
}
