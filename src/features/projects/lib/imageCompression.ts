/**
 * Preparation des images avant l'upload (docs/v2/customization-scope.md) :
 * redimensionnement et passage en WebP cote client, pour que des photos
 * lourdes ou de qualite inegale ne pesent ni sur le quota ni sur la fiche.
 * Les controles sont aussi faits par le backend (types, 2 Mo) ; ceux-ci
 * evitent un aller-retour reseau pour un fichier manifestement refuse.
 */

/** Formats acceptes en entree (pas de GIF : l'animation serait perdue en silence). */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
export const ACCEPTED_IMAGE_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(",");

/** Taille maximale d'un fichier choisi, avant compression. */
export const MAX_INPUT_BYTES = 10 * 1024 * 1024;
/** Taille maximale apres compression, alignee sur la limite du backend. */
export const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;

export const BANNER_MAX_WIDTH = 1600;
export const GALLERY_MAX_WIDTH = 1200;

export class ImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageError";
  }
}

/** Message d'erreur en francais si le fichier ne peut pas etre traite, sinon `null`. */
export function validateImageFile(
  file: Pick<File, "type" | "size">,
): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Format non pris en charge. Choisis une image JPEG, PNG, WebP ou AVIF.";
  }
  if (file.size > MAX_INPUT_BYTES) {
    return "Cette image dépasse 10 Mo. Choisis-en une plus légère.";
  }
  return null;
}

/** Dimensions cibles : jamais d'agrandissement, ratio conserve, entiers >= 1. */
export function computeTargetSize(
  width: number,
  height: number,
  maxWidth: number,
): { width: number; height: number } {
  if (width <= maxWidth) {
    return {
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    };
  }
  const ratio = maxWidth / width;
  return {
    width: maxWidth,
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function renamed(name: string, type: string): string {
  const base = name.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${type === "image/webp" ? "webp" : "jpg"}`;
}

/**
 * Redimensionne a `maxWidth` et encode en WebP (qualite 0.8). Si le
 * navigateur ne sait pas encoder le WebP, repli sur JPEG. L'orientation EXIF
 * est appliquee par `createImageBitmap`.
 */
export async function compressImage(
  file: File,
  { maxWidth, quality = 0.8 }: { maxWidth: number; quality?: number },
): Promise<File> {
  const invalid = validateImageFile(file);
  if (invalid) throw new ImageError(invalid);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageError("Cette image est illisible ou corrompue.");
  }

  try {
    const size = computeTargetSize(bitmap.width, bitmap.height, maxWidth);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new ImageError("Ton navigateur ne permet pas de traiter l'image.");
    }
    context.drawImage(bitmap, 0, 0, size.width, size.height);

    const webp = await canvasToBlob(canvas, "image/webp", quality);
    const blob =
      webp?.type === "image/webp"
        ? webp
        : await canvasToBlob(canvas, "image/jpeg", 0.85);
    if (!blob) {
      throw new ImageError("L'image n'a pas pu être compressée.");
    }
    if (blob.size > MAX_OUTPUT_BYTES) {
      throw new ImageError(
        "Cette image reste trop lourde (plus de 2 Mo) après compression.",
      );
    }
    return new File([blob], renamed(file.name, blob.type), { type: blob.type });
  } finally {
    bitmap.close();
  }
}
