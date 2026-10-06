import {
  customizationImageUploadSchema,
  projectSchema,
  type CustomizationImageUpload,
  type Project,
  type ProjectCustomization,
} from "@/domain";
import { ApiError, apiFetch } from "./client";

export const CUSTOMIZATION_UNAVAILABLE_CODE = "customization_unavailable";

/**
 * Le serveur n'expose pas (encore) les routes de personnalisation : 405/501,
 * ou 404 sans corps d'erreur du contrat (`code` inconnu) — un projet
 * introuvable, lui, renvoie son `ApiErrorBody`.
 */
function isRouteMissing(error: ApiError): boolean {
  return (
    error.status === 405 ||
    error.status === 501 ||
    (error.status === 404 && error.code === "unknown_error")
  );
}

/** Remplace l'erreur d'une route absente par un message clair, plutot que « Not Found » ou un texte vide. */
async function whenAvailable<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && isRouteMissing(error)) {
      throw new ApiError(
        error.status,
        CUSTOMIZATION_UNAVAILABLE_CODE,
        "La personnalisation n'est pas encore disponible sur ce serveur.",
      );
    }
    throw error;
  }
}

/** Porteur seul : remplace la personnalisation complete de la fiche. */
export function updateCustomization(
  slug: string,
  input: ProjectCustomization,
): Promise<Project> {
  return whenAvailable(
    apiFetch(`/projects/${slug}/customization`, {
      method: "PATCH",
      body: input,
      schema: projectSchema,
    }),
  );
}

/** Porteur seul : televerse une image (deja compressee cote client) ; elle n'est referencee qu'au prochain `updateCustomization`. */
export function uploadCustomizationImage(
  slug: string,
  file: File,
): Promise<CustomizationImageUpload> {
  const body = new FormData();
  body.append("file", file);
  return whenAvailable(
    apiFetch(`/projects/${slug}/customization/images`, {
      method: "POST",
      body,
      schema: customizationImageUploadSchema,
    }),
  );
}

/**
 * Porteur ou administration : retire l'image (et sa reference dans la
 * banniere/galerie). `reason` est journalise quand c'est un admin qui retire
 * le media d'un autre porteur.
 */
export function deleteCustomizationImage(
  slug: string,
  imageId: string,
  reason?: string,
): Promise<void> {
  return whenAvailable(
    apiFetch(`/projects/${slug}/customization/images/${imageId}`, {
      method: "DELETE",
      body: reason ? { reason } : undefined,
    }),
  );
}
