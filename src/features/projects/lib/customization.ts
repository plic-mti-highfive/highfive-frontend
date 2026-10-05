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

/** Libelles des sections de l'Apercu dans l'editeur. */
export const SECTION_LABEL: Record<CustomizationSection["id"], string> = {
  pinned: "Annonce épinglée",
  about: "À propos",
  gallery: "Galerie",
  comments: "Commentaires",
};

/** Personnalisation de depart de l'editeur : celle du projet, ou celle par defaut. */
export function toDraft(
  customization: ProjectCustomization | undefined,
): ProjectCustomization {
  return {
    banner: customization?.banner,
    accent: customization?.accent,
    sections: resolveSections(customization),
    gallery: customization?.gallery ?? [],
  };
}

/** Echange l'element avec son voisin (`-1` = vers le haut). Hors bornes : copie inchangee. */
export function moveItem<T>(
  items: readonly T[],
  index: number,
  direction: -1 | 1,
): T[] {
  const target = index + direction;
  const next = [...items];
  if (index < 0 || index >= items.length) return next;
  if (target < 0 || target >= items.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Serialisation independante de l'ordre des cles (les champs `undefined` sont ignores). */
function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, val: unknown) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return Object.fromEntries(
        Object.entries(val as Record<string, unknown>).sort(([a], [b]) =>
          a.localeCompare(b),
        ),
      );
    }
    return val;
  });
}

/** Le brouillon differe-t-il de la personnalisation enregistree ? */
export function isDraftDirty(
  draft: ProjectCustomization,
  saved: ProjectCustomization | undefined,
): boolean {
  return stableStringify(draft) !== stableStringify(toDraft(saved));
}

export const ALT_REQUIRED_MESSAGE =
  "Décris l'image, ou coche « Image décorative ».";

/** Id du champ « Texte alternatif » d'une image (`"banner"` ou l'id d'une image de galerie) : sert aux libelles, au focus et aux liens du resume d'erreurs. */
export function altInputId(key: string): string {
  return `customize-alt-${key}`;
}

export interface DraftIssue {
  /** `"banner"` ou id de l'image de galerie. */
  key: string;
  /** Nom lisible : « Bannière » ou « Image 2 » (position dans la galerie). */
  label: string;
  inputId: string;
  message: string;
}

export interface DraftIssues {
  /** Message pour la banniere, si elle est invalide. */
  banner?: string;
  /** Message par id d'image de galerie invalide. */
  gallery: Record<string, string>;
  /** Images a corriger, dans l'ordre de la page (banniere puis galerie). */
  items: DraftIssue[];
  /** Nombre total d'images a corriger. */
  count: number;
}

function missingAlt(image: { alt: string; decorative: boolean }): boolean {
  return !image.decorative && image.alt.trim().length === 0;
}

/** Problemes bloquant l'enregistrement : un texte alternatif manque (hors images decoratives). */
export function getDraftIssues(draft: ProjectCustomization): DraftIssues {
  const issues: DraftIssues = { gallery: {}, items: [], count: 0 };
  function add(key: string, label: string) {
    issues.items.push({
      key,
      label,
      inputId: altInputId(key),
      message: ALT_REQUIRED_MESSAGE,
    });
    issues.count += 1;
  }
  if (draft.banner && missingAlt(draft.banner)) {
    issues.banner = ALT_REQUIRED_MESSAGE;
    add("banner", "Bannière");
  }
  draft.gallery.forEach((item, index) => {
    if (missingAlt(item)) {
      issues.gallery[item.id] = ALT_REQUIRED_MESSAGE;
      add(item.id, `Image ${index + 1}`);
    }
  });
  return issues;
}
