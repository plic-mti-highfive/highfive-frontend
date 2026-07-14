// Mécanique déterministe de génération de palette par projet/entité,
// partagée entre le thumbnail SVG et les cartes teintées (bandes de couleur).

export interface ColorPalette {
  bg: string;
  a1: string;
  a2: string;
  shape: string;
}

// Palette sets: [bg, accent1, accent2, shape]
export const PALETTE_SETS: ColorPalette[] = [
  { bg: "#E8F4F0", a1: "#2D9E7A", a2: "#A8DDD0", shape: "#1A6B52" },
  { bg: "#EEE8F8", a1: "#7C5CBF", a2: "#C9B8EC", shape: "#4A2D8C" },
  { bg: "#FDF0E6", a1: "#D4783A", a2: "#F5C89A", shape: "#9B4E1A" },
  { bg: "#E6EEF8", a1: "#3A6FD4", a2: "#9ABCF5", shape: "#1A3D8C" },
  { bg: "#F8E6EE", a1: "#C43A7C", a2: "#F5A0C8", shape: "#8C1A52" },
  { bg: "#F0F0E6", a1: "#8C8C3A", a2: "#D4D49A", shape: "#5A5A1A" },
  { bg: "#E6F0F8", a1: "#3A8CC4", a2: "#9AC8F0", shape: "#1A5A8C" },
  { bg: "#F8EEE6", a1: "#C47C3A", a2: "#F0C09A", shape: "#8C4A1A" },
];

// Deterministic pseudo-random from a seed
export function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function getSeed(id: number | string): number {
  return typeof id === "string"
    ? id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    : id;
}

export function getPaletteForId(id: number | string): ColorPalette {
  const seed = getSeed(id);
  return PALETTE_SETS[Math.abs(seed) % PALETTE_SETS.length];
}

export interface CardTint {
  /** Bande d'accent (header/footer de carte), mélangée avec le token --card pour s'adapter au thème */
  band: string;
  /** Bande douce (zone de description), plus proche du fond de carte */
  bandSoft: string;
  /** Couleur d'accent saturée, utilisable pour avatar/texte sur fond clair */
  accent: string;
}

/**
 * Bandes de couleur pour les cartes "flat" (sans image), dérivées de la même
 * palette que le thumbnail SVG. Le mélange avec var(--card) via color-mix
 * permet aux teintes de suivre automatiquement le thème clair/sombre.
 */
export function getCardTint(id: number | string): CardTint {
  const { a1 } = getPaletteForId(id);
  return {
    band: `color-mix(in srgb, ${a1} 18%, var(--card))`,
    bandSoft: `color-mix(in srgb, ${a1} 8%, var(--card))`,
    accent: a1,
  };
}
