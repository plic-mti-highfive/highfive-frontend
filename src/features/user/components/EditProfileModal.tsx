import { useState, useRef } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { TagSearchDropdown } from "../../projects/components/TagSearchDropdown";
import type { User, UserProfileFormData } from "@shared/types";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSave: (data: UserProfileFormData) => void;
}

function AvatarUpload({
  currentAvatar,
  onChange,
}: {
  currentAvatar: string;
  onChange: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string>(currentAvatar);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(url);
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="
        relative w-32 h-32 rounded-3xl overflow-hidden
        bg-cream-dark flex items-center justify-center
        group transition-all hover:brightness-95 active:scale-[0.98]
        flex-shrink-0
      "
      aria-label="Changer la photo de profil"
    >
      <img src={preview} alt="Avatar" className="w-full h-full object-cover" />

      <div
        className="
        absolute inset-0 bg-black/0 group-hover:bg-black/20
        flex items-center justify-center transition-all
      "
      >
        <span
          className="
          text-white text-xs font-semibold opacity-0 group-hover:opacity-100
          transition-opacity bg-black/50 px-2 py-1 rounded-lg
        "
        >
          Modifier
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </button>
  );
}

export function EditProfileModal({
  open,
  onOpenChange,
  user,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<UserProfileFormData>({
    displayName: user.displayName,
    bio: user.bio,
    avatar: user.avatar,
    tags: user.tags,
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50" />

        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="bg-cream rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-3xl font-heading font-semibold text-ink">
                Modifier le profil
              </Dialog.Title>
              <Dialog.Close className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-cream-dark transition-colors">
                <X className="w-5 h-5 text-ink" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-start gap-6">
                <AvatarUpload
                  currentAvatar={formData.avatar}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, avatar: url }))
                  }
                />

                <div className="flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-ink-soft block">
                      Nom d'affichage
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          displayName: e.target.value,
                        }))
                      }
                      placeholder="John Doe"
                      className="
                        w-full rounded-xl border border-cream-mid bg-white px-4 py-3
                        text-sm text-ink placeholder-ink-muted
                        focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent
                        transition-all shadow-sm
                      "
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-ink-soft block">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="
                        w-full rounded-xl border border-cream-mid bg-cream-dark px-4 py-3
                        text-sm text-ink-muted
                        cursor-not-allowed
                      "
                    />
                    <p className="text-xs text-ink-muted">
                      Le nom d'utilisateur ne peut pas être modifié
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-ink-soft block">
                  Biographie
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Parlez un peu de vous..."
                  rows={4}
                  className="
                    w-full rounded-xl border border-cream-mid bg-white px-4 py-3
                    text-sm text-ink placeholder-ink-muted resize-none
                    focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent
                    transition-all shadow-sm
                  "
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-ink-soft block">
                  Tags & compétences
                </label>
                <TagSearchDropdown
                  selected={formData.tags}
                  onChange={(tags) =>
                    setFormData((prev) => ({ ...prev, tags }))
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="
                    px-6 py-2.5 rounded-xl font-semibold text-sm
                    text-ink bg-cream-dark hover:bg-cream-mid
                    transition-all shadow-sm
                  "
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`
                    px-6 py-2.5 rounded-xl font-semibold text-sm
                    transition-all shadow-sm
                    ${
                      saved
                        ? "bg-apple text-white scale-[0.98]"
                        : "bg-ink text-cream hover:bg-ink-soft active:scale-[0.97]"
                    }
                  `}
                >
                  {saved ? "Enregistré !" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
