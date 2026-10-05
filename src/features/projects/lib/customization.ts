import {
  DEFAULT_SECTIONS,
  type CustomizationSection,
  type ProjectCustomization,
} from "@/domain";

/**
 * Ordre et visibilite des sections de l'Apercu. Sans personnalisation, ou si
 * une section manque (donnee ancienne ou incomplete), on retombe sur l'ordre
 * par defaut : la fiche d'un projet non personnalise reste identique.
 * Les doublons sont ignores (la premiere occurrence gagne).
 */
export function resolveSections(
  customization: ProjectCustomization | undefined,
): CustomizationSection[] {
  const resolved: CustomizationSection[] = [];
  const seen = new Set<CustomizationSection["id"]>();
  for (const section of customization?.sections ?? []) {
    if (seen.has(section.id)) continue;
    seen.add(section.id);
    resolved.push(section);
  }
  for (const section of DEFAULT_SECTIONS) {
    if (!seen.has(section.id)) resolved.push({ ...section });
  }
  return resolved;
}
