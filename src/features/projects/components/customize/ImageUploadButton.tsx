import { useRef } from "react";
import { ImagePlus } from "lucide-react";

import { Button, Spinner } from "@shared/ui";
import { ACCEPTED_IMAGE_ATTRIBUTE } from "../../lib/imageCompression";

/**
 * Bouton qui ouvre le selecteur de fichiers (input cache, comme l'avatar de
 * profil). Remet l'input a zero apres chaque choix pour pouvoir
 * re-selectionner le meme fichier.
 */
export function ImageUploadButton({
  label,
  pending = false,
  disabled = false,
  multiple = false,
  onFiles,
}: {
  label: string;
  pending?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_ATTRIBUTE}
        multiple={multiple}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length > 0) onFiles(files);
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled || pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? <Spinner size="sm" /> : <ImagePlus size={16} />}
        {pending ? "Envoi en cours…" : label}
      </Button>
    </>
  );
}
