// Roue d'accent unique de HighFive! : toute couleur d'identité (tag, projet,
// assigné, avatar…) se hache de manière déterministe vers l'une des 6
// teintes définies dans src/index.css (@theme + [data-accent]). Plus aucune
// valeur hex en dur dans le code, tout passe par les tokens CSS.

export type AccentName =
  | "rose"
  | "orange"
  | "yellow"
  | "apple"
  | "sky"
  | "purple";

export const ACCENT_NAMES: readonly AccentName[] = [
  "rose",
  "orange",
  "yellow",
  "apple",
  "sky",
  "purple",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // 32 bits
  }
  return Math.abs(hash);
}

/** Hache un id/nom vers une des 6 teintes de la roue, toujours la même pour la même chaîne. */
export function getAccent(id: string | number): AccentName {
  return ACCENT_NAMES[hashString(String(id)) % ACCENT_NAMES.length];
}
