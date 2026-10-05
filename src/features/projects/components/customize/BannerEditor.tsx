import { useId, useState, type CSSProperties, type MouseEvent } from "react";
import { Maximize2, Trash2 } from "lucide-react";

import { Button, Checkbox, Field, IconButton, Input } from "@shared/ui";
import type { ProjectBanner } from "@/domain";
import { altInputId } from "../../lib/customization";
import { BANNER_MAX_WIDTH } from "../../lib/imageCompression";
import { describeUploadError } from "../../lib/uploadError";
import { ImageViewer } from "@shared/components/ImageViewer";
import { ImageUploadButton } from "./ImageUploadButton";
import type { UploadImage } from "./types";

const DEFAULT_FOCAL = { x: 50, y: 50 };

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Edition de la banniere : image, point focal et texte alternatif. Le point
 * focal se regle au clic sur l'image entiere (souris) ou avec deux curseurs
 * (clavier, lecteurs d'ecran) ; l'apercu live montre le recadrage obtenu.
 */
export function BannerEditor({
  banner,
  error,
  onChange,
  onUpload,
  onDiscardImage,
}: {
  banner: ProjectBanner | undefined;
  /** Message d'erreur sur le texte alternatif (affiche apres une tentative d'enregistrement). */
  error?: string;
  onChange: (banner: ProjectBanner | undefined) => void;
  onUpload: UploadImage;
  /** Une image televersee n'est plus utilisee (remplacee ou retiree). */
  onDiscardImage: (imageId: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viewing, setViewing] = useState(false);
  const xId = useId();
  const yId = useId();

  async function handleFiles([file]: File[]) {
    setUploadError(null);
    setPending(true);
    try {
      const uploaded = await onUpload(file, BANNER_MAX_WIDTH);
      if (banner) onDiscardImage(banner.id);
      onChange({
        id: uploaded.id,
        url: uploaded.url,
        alt: "",
        decorative: false,
        focal: banner?.focal ?? DEFAULT_FOCAL,
      });
    } catch (caught) {
      setUploadError(describeUploadError(caught));
    } finally {
      setPending(false);
    }
  }

  function setFocal(x: number, y: number) {
    if (!banner) return;
    onChange({ ...banner, focal: { x: clampPercent(x), y: clampPercent(y) } });
  }

  function handleImageClick(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    setFocal(
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100,
    );
  }

  if (!banner) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-body-sm text-muted-foreground">
          Une image en haut de la fiche, facultative. JPEG, PNG, WebP ou AVIF,
          10 Mo maximum : elle est redimensionnée automatiquement.
        </p>
        <div>
          <ImageUploadButton
            label="Ajouter une bannière"
            pending={pending}
            onFiles={handleFiles}
          />
        </div>
        {uploadError && (
          <p role="alert" className="text-body-sm text-danger-fg">
            {uploadError}
          </p>
        )}
      </div>
    );
  }

  const markerStyle = {
    "--x": `${banner.focal.x}%`,
    "--y": `${banner.focal.y}%`,
  } as CSSProperties;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <p className="text-body-sm text-muted-foreground">
          Clique sur la partie importante de l'image : elle restera visible
          quand la bannière est recadrée.
        </p>
        <div
          onClick={handleImageClick}
          className="relative cursor-crosshair overflow-hidden rounded-lg border border-border bg-muted"
        >
          <img
            src={banner.url}
            alt=""
            className="block h-auto w-full select-none"
            draggable={false}
          />
          <IconButton
            aria-label="Agrandir l'image"
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 bg-card transition-none"
            onClick={(event) => {
              // Ne pas deplacer le point focal en ouvrant la visionneuse.
              event.stopPropagation();
              setViewing(true);
            }}
          >
            <Maximize2 size={14} />
          </IconButton>
          <span
            aria-hidden="true"
            style={markerStyle}
            className="pointer-events-none absolute top-[var(--y)] left-[var(--x)] size-5 -translate-x-1/2 -translate-y-1/2 rounded-pill border-2 border-background bg-foreground shadow-overlay"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="Position horizontale"
          htmlFor={xId}
          description={`${banner.focal.x} %`}
        >
          <input
            id={xId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={banner.focal.x}
            onChange={(event) =>
              setFocal(Number(event.target.value), banner.focal.y)
            }
            className="w-full accent-foreground"
          />
        </Field>
        <Field
          label="Position verticale"
          htmlFor={yId}
          description={`${banner.focal.y} %`}
        >
          <input
            id={yId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={banner.focal.y}
            onChange={(event) =>
              setFocal(banner.focal.x, Number(event.target.value))
            }
            className="w-full accent-foreground"
          />
        </Field>
      </div>

      <Field
        label="Texte alternatif"
        htmlFor={altInputId("banner")}
        required={!banner.decorative}
        description={
          banner.decorative
            ? "Image décorative : aucun texte alternatif n'est nécessaire."
            : "Obligatoire. Décris l'image pour les personnes qui ne la voient pas."
        }
        error={error}
      >
        <Input
          id={altInputId("banner")}
          value={banner.alt}
          disabled={banner.decorative}
          aria-required={!banner.decorative}
          maxLength={200}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange({ ...banner, alt: event.target.value })}
        />
      </Field>
      <label className="flex items-center gap-2 text-body-sm text-foreground">
        <Checkbox
          checked={banner.decorative}
          onCheckedChange={(checked) =>
            onChange({ ...banner, decorative: checked })
          }
        />
        Image décorative (aucun texte alternatif nécessaire)
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <ImageUploadButton
          label="Remplacer l'image"
          pending={pending}
          onFiles={handleFiles}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onDiscardImage(banner.id);
            onChange(undefined);
          }}
        >
          <Trash2 size={16} />
          Retirer la bannière
        </Button>
      </div>
      {uploadError && (
        <p role="alert" className="text-body-sm text-danger-fg">
          {uploadError}
        </p>
      )}
      <ImageViewer
        images={[banner]}
        index={viewing ? 0 : null}
        title="Aperçu de la bannière"
        onIndexChange={() => {}}
        onClose={() => setViewing(false)}
      />
    </div>
  );
}
