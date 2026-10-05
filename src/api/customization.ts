import {
  customizationImageUploadSchema,
  projectSchema,
  type CustomizationImageUpload,
  type Project,
  type ProjectCustomization,
} from "@/domain";
import { apiFetch } from "./client";

/** Porteur seul : remplace la personnalisation complete de la fiche. */
export function updateCustomization(
  slug: string,
  input: ProjectCustomization,
): Promise<Project> {
  return apiFetch(`/projects/${slug}/customization`, {
    method: "PATCH",
    body: input,
    schema: projectSchema,
  });
}

/** Porteur seul : televerse une image (deja compressee cote client) ; elle n'est referencee qu'au prochain `updateCustomization`. */
export function uploadCustomizationImage(
  slug: string,
  file: File,
): Promise<CustomizationImageUpload> {
  const body = new FormData();
  body.append("file", file);
  return apiFetch(`/projects/${slug}/customization/images`, {
    method: "POST",
    body,
    schema: customizationImageUploadSchema,
  });
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
  return apiFetch(`/projects/${slug}/customization/images/${imageId}`, {
    method: "DELETE",
    body: reason ? { reason } : undefined,
  });
}
