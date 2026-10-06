import type { CustomizationImageUpload } from "@/domain";

/**
 * Prepare (validation, compression) puis televerse une image ; rejette avec
 * une erreur dont `describeUploadError` donne le message a afficher.
 */
export type UploadImage = (
  file: File,
  maxWidth: number,
) => Promise<CustomizationImageUpload>;
