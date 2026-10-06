import { ApiError } from "@/api/client";
import { ImageError } from "./imageCompression";

/** Message affichable pour un echec de preparation ou de televersement d'image. */
export function describeUploadError(error: unknown): string {
  if (error instanceof ImageError) return error.message;
  if (error instanceof ApiError) {
    const details = error.details as { file?: unknown } | undefined;
    if (typeof details?.file === "string") return details.file;
    if (error.status === 403) {
      return "Seul le porteur peut ajouter des images à la fiche.";
    }
    return error.message;
  }
  return "L'image n'a pas pu être envoyée. Réessaie dans un instant.";
}
