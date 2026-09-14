import { useTags } from "@/api/queries/tags";
import type { User } from "@/domain";
import { Avatar, Button, Stat, TagPill } from "@shared/ui";
import { formatAbsoluteDate, formatExactDateTime } from "@shared/lib/dates";

export interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
  isSuspended: boolean;
  createdCount: number;
  joinedCount: number;
  privateCount: number;
  onEdit: () => void;
}

/**
 * Bloc d'identité du profil (doc 12 E-04) : avatar, nom affiché ou pseudo à
 * défaut, `@pseudo`, bio, centres d'intérêt, chiffres fournis par le serveur
 * (R-X2), date d'arrivée (R-X1). Aucune bannière ni photo de fond : "le
 * profil est une feuille". Aucun identifiant technique affiché (R-X4).
 */
export function ProfileHeader({
  user,
  isOwnProfile,
  isSuspended,
  createdCount,
  joinedCount,
  privateCount,
  onEdit,
}: ProfileHeaderProps) {
  const tags = useTags();
  const tagsById = new Map((tags.data ?? []).map((tag) => [tag.id, tag]));
  const displayName = user.displayName ?? user.username;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar name={displayName} src={user.avatar} size="xl" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="truncate text-heading-lg font-semibold text-foreground">
            {displayName}
          </h1>
          <p className="truncate text-body-sm text-muted-foreground">
            @{user.username}
          </p>
        </div>
      </div>

      {user.bio && (
        <p className="text-body-md whitespace-pre-wrap text-foreground">
          {user.bio}
        </p>
      )}

      {user.interests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {user.interests.map((interestId) => {
            const tag = tagsById.get(interestId);
            return (
              <TagPill
                key={interestId}
                label={tag?.label ?? interestId}
                accent={tag?.accent}
                size="xs"
              />
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-6 border-y border-border py-4">
        <Stat value={createdCount} label="Projets portés" />
        <Stat value={joinedCount} label="Projets rejoints" />
      </div>

      {privateCount > 0 && (
        <p className="text-body-sm text-muted-foreground">
          +{privateCount}{" "}
          {privateCount === 1 ? "projet privé" : "projets privés"}
        </p>
      )}

      <p
        className="text-body-sm text-muted-foreground"
        title={formatExactDateTime(user.createdAt)}
      >
        Membre depuis {formatAbsoluteDate(user.createdAt)}
      </p>

      {isOwnProfile &&
        (isSuspended ? (
          <p className="text-body-sm text-muted-foreground">
            Ton compte est suspendu. Modification du profil indisponible.
          </p>
        ) : (
          <Button variant="outline" onClick={onEdit}>
            Modifier mon profil
          </Button>
        ))}
    </div>
  );
}
