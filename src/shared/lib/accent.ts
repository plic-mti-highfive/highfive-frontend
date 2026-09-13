// Roue d'accent unique de HighFive! : toute couleur d'identité (tag, projet,
// assigné, avatar…) se hache de manière déterministe vers l'une des 6
// teintes définies dans src/index.css (@theme + [data-accent]). Remplace
// l'ancien src/shared/utils/colorPalette.ts : plus aucune valeur hex en dur
// dans le code, tout passe par les tokens CSS.

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

export type AccentStep = "light" | "base" | "mid" | "dark" | "deeper";

/**
 * Référence CSS vers un token d'accent (`var(--color-<accent>[-<step>])`),
 * à utiliser dans du CSS/style — jamais une valeur en dur. Préférer
 * `data-accent="<accent>"` sur un conteneur quand c'est possible : les
 * primitives (Card, Avatar, TagPill…) lisent alors --accent-base/-light/-dark
 * directement, sans repasser par ce helper.
 */
export function accentVar(
  accent: AccentName,
  step: AccentStep = "base",
): string {
  return step === "base"
    ? `var(--color-${accent})`
    : `var(--color-${accent}-${step})`;
}

/**
 * Valeur calculée (hex) d'un token d'accent, pour les contextes sans cascade
 * CSS — SVG encodé en data URI, canvas… Ne jamais s'en servir pour du style
 * React classique (perte de la réactivité au changement de thème) ;
 * préférer accentVar()/data-accent.
 */
export function resolveAccentColor(
  accent: AccentName,
  step: AccentStep = "base",
): string {
  if (typeof document === "undefined") return "transparent";
  const name =
    step === "base" ? `--color-${accent}` : `--color-${accent}-${step}`;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || "transparent";
}

// --- Compat : ancienne API de colorPalette.ts, réécrite sans hex en dur. ---

export interface CardTint {
  /** Bande d'accent (header/footer de carte), mélangée avec var(--card). */
  band: string;
  /** Bande douce (zone de description), plus proche du fond de carte. */
  bandSoft: string;
  /** Référence CSS de l'accent, pour --card-accent (anneau teinté au survol). */
  accent: string;
}

/**
 * @deprecated Conservé pour les appelants existants (HeroCard,
 * ProjectFeedCard) ; pour du code neuf, préférer `data-accent={getAccent(id)}`
 * directement sur le conteneur et les tokens `--shadow-lift*`.
 */
export function getCardTint(id: number | string): CardTint {
  const accent = getAccent(id);
  const base = accentVar(accent);
  return {
    band: `color-mix(in srgb, ${base} 18%, var(--card))`,
    bandSoft: `color-mix(in srgb, ${base} 8%, var(--card))`,
    accent: base,
  };
}
