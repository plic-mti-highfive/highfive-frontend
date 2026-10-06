import { useId, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { Checkbox, Field, IconButton, Input } from "@shared/ui";
import { MAX_GALLERY_IMAGES, type GalleryItem } from "@/domain";
import { GALLERY_MAX_WIDTH } from "../../lib/imageCompression";
import { altInputId, moveItem } from "../../lib/customization";
import { describeUploadError } from "../../lib/uploadError";
import { ImageViewer } from "@shared/components/ImageViewer";
import { SortableList } from "./SortableList";
import { ImageUploadButton } from "./ImageUploadButton";
import type { UploadImage } from "./types";

/**
 * Edition de la galerie (8 images maximum) : ajout (plusieurs fichiers a la
 * fois), texte alternatif obligatoire sauf image decorative, legende
 * facultative, reordonnancement par glisser-deposer (poignee) ou boutons ↑/↓,
 * annonce en `role="status"`.
 */
export function GalleryEditor({
  gallery,
  issues,
  onChange,
  onUpload,
  onDiscardImage,
}: {
  gallery: GalleryItem[];
  /** Messages d'erreur par id d'image (affiches apres une tentative d'enregistrement). */
  issues: Record<string, string>;
  onChange: (gallery: GalleryItem[]) => void;
  onUpload: UploadImage;
  onDiscardImage: (imageId: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const remaining = MAX_GALLERY_IMAGES - gallery.length;

  async function handleFiles(files: File[]) {
    setUploadErrors([]);
    setPending(true);
    const errors: string[] = [];
    const added: GalleryItem[] = [];
    for (const file of files.slice(0, Math.max(remaining, 0))) {
      try {
        const uploaded = await onUpload(file, GALLERY_MAX_WIDTH);
        added.push({
          id: uploaded.id,
          url: uploaded.url,
          alt: "",
          decorative: false,
        });
      } catch (caught) {
        errors.push(`${file.name} : ${describeUploadError(caught)}`);
      }
    }
    if (files.length > remaining) {
      errors.push(
        `La galerie est limitée à ${MAX_GALLERY_IMAGES} images : ${files.length - remaining} image(s) ignorée(s).`,
      );
    }
    if (added.length > 0) onChange([...gallery, ...added]);
    setUploadErrors(errors);
    setPending(false);
  }

  function update(id: string, patch: Partial<GalleryItem>) {
    onChange(
      gallery.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= gallery.length) return;
    onChange(moveItem(gallery, index, direction));
    setAnnouncement(
      `Image ${index + 1} déplacée en position ${target + 1} sur ${gallery.length}.`,
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-muted-foreground">
        {gallery.length} / {MAX_GALLERY_IMAGES} images. JPEG, PNG, WebP ou AVIF,
        10 Mo maximum : elles sont redimensionnées automatiquement.
      </p>

      {gallery.length > 0 && (
        <SortableList
          items={gallery}
          getLabel={(item) => `Image ${gallery.indexOf(item) + 1}`}
          onReorder={(next) => {
            onChange(next);
            setAnnouncement("Ordre de la galerie modifié.");
          }}
          className="flex flex-col gap-4"
          itemClassName="rounded-lg border border-border bg-card p-3"
          renderItem={(item, index, handle) => (
            <GalleryItemEditor
              item={item}
              position={index + 1}
              total={gallery.length}
              error={issues[item.id]}
              handle={handle}
              onChange={(patch) => update(item.id, patch)}
              onMove={(direction) => move(index, direction)}
              onZoom={() => setViewIndex(index)}
              onRemove={() => {
                onDiscardImage(item.id);
                onChange(gallery.filter((other) => other.id !== item.id));
                setAnnouncement(`Image ${index + 1} supprimée.`);
              }}
            />
          )}
        />
      )}

      <div>
        <ImageUploadButton
          label="Ajouter des images"
          multiple
          pending={pending}
          disabled={remaining <= 0}
          onFiles={handleFiles}
        />
      </div>
      {remaining <= 0 && (
        <p className="text-body-sm text-muted-foreground">
          La galerie est pleine : supprime une image pour en ajouter une autre.
        </p>
      )}
      {uploadErrors.length > 0 && (
        <ul
          role="alert"
          className="flex flex-col gap-1 text-body-sm text-danger-fg"
        >
          {uploadErrors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      <p role="status" className="sr-only">
        {announcement}
      </p>
      <ImageViewer
        images={gallery}
        index={viewIndex}
        title="Aperçu des images de la galerie"
        onIndexChange={setViewIndex}
        onClose={() => setViewIndex(null)}
      />
    </div>
  );
}

function GalleryItemEditor({
  item,
  position,
  total,
  error,
  handle,
  onChange,
  onMove,
  onZoom,
  onRemove,
}: {
  item: GalleryItem;
  position: number;
  total: number;
  error?: string;
  /** Poignee de glisser-deposer fournie par `SortableList`. */
  handle: ReactNode;
  onChange: (patch: Partial<GalleryItem>) => void;
  onMove: (direction: -1 | 1) => void;
  onZoom: () => void;
  onRemove: () => void;
}) {
  const captionId = useId();
  const label = `image ${position}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={`Agrandir l'${label}`}
          onClick={onZoom}
          className="shrink-0 cursor-zoom-in overflow-hidden rounded-md border border-border outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <img
            src={item.url}
            alt=""
            className="aspect-[3/2] w-28 object-cover"
          />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Field
            label="Texte alternatif"
            htmlFor={altInputId(item.id)}
            required={!item.decorative}
            description={
              item.decorative
                ? "Image décorative : aucun texte alternatif n'est nécessaire."
                : "Obligatoire. Décris l'image pour les personnes qui ne la voient pas."
            }
            error={error}
          >
            <Input
              id={altInputId(item.id)}
              value={item.alt}
              disabled={item.decorative}
              aria-required={!item.decorative}
              maxLength={200}
              aria-invalid={Boolean(error)}
              onChange={(event) => onChange({ alt: event.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 text-body-sm text-foreground">
            <Checkbox
              checked={item.decorative}
              onCheckedChange={(checked) => onChange({ decorative: checked })}
            />
            Image décorative
          </label>
          <Field label="Légende (facultative)" htmlFor={captionId}>
            <Input
              id={captionId}
              value={item.caption ?? ""}
              maxLength={140}
              onChange={(event) =>
                onChange({ caption: event.target.value || undefined })
              }
            />
          </Field>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="mr-auto">{handle}</span>
        <IconButton
          aria-label={`Monter l'${label}`}
          variant="outline"
          focusableWhenDisabled
          disabled={position === 1}
          onClick={() => onMove(-1)}
        >
          <ArrowUp size={16} />
        </IconButton>
        <IconButton
          aria-label={`Descendre l'${label}`}
          variant="outline"
          focusableWhenDisabled
          disabled={position === total}
          onClick={() => onMove(1)}
        >
          <ArrowDown size={16} />
        </IconButton>
        <IconButton
          aria-label={`Supprimer l'${label}`}
          variant="outline"
          onClick={onRemove}
        >
          <Trash2 size={16} />
        </IconButton>
      </div>
    </div>
  );
}
