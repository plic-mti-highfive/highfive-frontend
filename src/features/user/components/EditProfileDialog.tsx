import { useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import { queryKeys } from "@/api/queries/keys";
import { useUpdateCurrentUser } from "@/api/queries/users";
import { useUploadAvatar } from "@/api/queries/files";
import type { CurrentUser } from "@/domain";
import {
  Avatar,
  Button,
  Dialog,
  DialogPopup,
  DialogTitle,
  Field,
  Input,
  Label,
  Textarea,
} from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { InterestsPicker } from "./InterestsPicker";

const BIO_MAX = 280;
const DISPLAY_NAME_MAX = 40;

export interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: CurrentUser;
}

interface ZodIssueLike {
  path?: unknown[];
  message?: string;
}

function fieldError(details: unknown, field: string): string | undefined {
  if (!Array.isArray(details)) return undefined;
  const issue = (details as ZodIssueLike[]).find(
    (d) => Array.isArray(d?.path) && d.path[0] === field,
  );
  return issue?.message;
}

/**
 * Dialog "Modifier mon profil" (mission item 2). Coquille fine : ne porte
 * aucun état de formulaire elle-même, pour que ce dernier reste correct sans
 * effet de synchronisation (`EditProfileForm` est remonté à chaque ouverture
 * via sa `key`, ce qui réinitialise nom/bio/intérêts et les mutations sans
 * `useEffect` + `setState`).
 */
export function EditProfileDialog({
  open,
  onOpenChange,
  user,
}: EditProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-lg">
        <DialogTitle>Modifier mon profil</DialogTitle>
        {open && (
          <EditProfileForm
            key={user.id}
            user={user}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogPopup>
    </Dialog>
  );
}

interface EditProfileFormProps {
  user: CurrentUser;
  onClose: () => void;
}

/**
 * Nom affiché (1-40), bio (≤280, compteur), centres d'intérêt (0-10, liste
 * fermée), avatar. Mutation `useUpdateCurrentUser` (PATCH /me) +
 * `useUploadAvatar` (POST /me/avatar, mockée par MSW — aucun appel réseau
 * réel en mode mock). Erreurs `ApiError` affichées dans les champs
 * concernés ; le reste (403 compte suspendu, réseau) dans un bandeau
 * général.
 */
function EditProfileForm({ user, onClose }: EditProfileFormProps) {
  const queryClient = useQueryClient();
  const updateProfile = useUpdateCurrentUser();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [interests, setInterests] = useState<string[]>(user.interests);

  const apiError =
    updateProfile.error instanceof ApiError ? updateProfile.error : undefined;
  const displayNameError = fieldError(apiError?.details, "displayName");
  const bioError = fieldError(apiError?.details, "bio");
  const interestsError = fieldError(apiError?.details, "interests");
  const generalError =
    apiError && !displayNameError && !bioError && !interestsError
      ? apiError.message
      : undefined;

  function handleAvatarChange(file: File) {
    uploadAvatar.mutate(file, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.byUsername(user.username),
        });
      },
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate(
      {
        displayName: displayName.trim() === "" ? undefined : displayName.trim(),
        bio,
        interests,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.users.byUsername(user.username),
          });
          onClose();
        },
      },
    );
  }

  const avatarSrc = uploadAvatar.data?.avatar ?? user.avatar;

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
      {generalError && (
        <p
          role="alert"
          className="rounded-md bg-danger-bg px-3 py-2 text-body-sm text-danger-fg"
        >
          {generalError}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadAvatar.isPending}
          aria-label="Changer la photo de profil"
          className="group relative rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Avatar
            name={user.displayName ?? user.username}
            src={avatarSrc}
            size="xl"
            className={cn(uploadAvatar.isPending && "opacity-60")}
          />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
            <Pencil size={16} />
          </span>
        </button>
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadAvatar.isPending}
          >
            {uploadAvatar.isPending ? "Envoi…" : "Changer la photo"}
          </Button>
          {uploadAvatar.isError && (
            <p className="text-body-sm text-danger-fg" role="alert">
              {uploadAvatar.error instanceof ApiError
                ? uploadAvatar.error.message
                : "La photo n'a pas pu être envoyée."}
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleAvatarChange(file);
            e.target.value = "";
          }}
        />
      </div>

      <Field
        label="Nom affiché"
        htmlFor="profile-display-name"
        error={displayNameError}
      >
        <Input
          id="profile-display-name"
          value={displayName}
          maxLength={DISPLAY_NAME_MAX}
          placeholder={user.username}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-bio">Bio</Label>
        <Textarea
          id="profile-bio"
          value={bio}
          maxLength={BIO_MAX}
          rows={4}
          placeholder="Dis-en un peu plus sur toi."
          aria-invalid={Boolean(bioError)}
          onChange={(e) => setBio(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <p
            role={bioError ? "alert" : undefined}
            className={cn(
              "text-body-sm",
              bioError ? "text-danger-fg" : "text-muted-foreground",
            )}
          >
            {bioError ?? "Visible sur ton profil public"}
          </p>
          <span className="text-body-sm tabular-nums text-muted-foreground">
            {bio.length}/{BIO_MAX}
          </span>
        </div>
      </div>

      <Field label="Centres d'intérêt" error={interestsError}>
        <InterestsPicker value={interests} onChange={setInterests} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
