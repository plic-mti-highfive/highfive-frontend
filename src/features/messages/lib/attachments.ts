/**
 * R-MSG8 : plafonds du depot, repris du backend (`messages.*` dans sa
 * configuration) pour refuser tout de suite un fichier trop lourd plutot
 * qu'apres l'avoir televerse. Le backend reste seul juge du type reel.
 */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_OTHER_SIZE = 20 * 1024 * 1024;

function maxSizeFor(mimeType: string): number {
  if (mimeType.startsWith("image/")) return MAX_IMAGE_SIZE;
  if (mimeType.startsWith("video/")) return MAX_VIDEO_SIZE;
  return MAX_OTHER_SIZE;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

/** Message d'erreur affichable, ou `undefined` si le fichier peut partir. */
export function attachmentError(file: File): string | undefined {
  // Le SVG peut porter du script : refuse par le backend, inutile de l'envoyer.
  if (file.type === "image/svg+xml") {
    return "Les images SVG ne sont pas acceptées.";
  }
  const max = maxSizeFor(file.type);
  if (file.size > max) {
    return `Fichier trop lourd (${formatFileSize(file.size)}) : ${formatFileSize(max)} au plus pour ce type.`;
  }
  return undefined;
}
