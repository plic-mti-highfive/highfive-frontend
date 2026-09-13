// Utilitaires de nombres pseudo-aléatoires déterministes, indépendants de
// toute notion de couleur (voir @shared/lib/accent pour la roue de teintes).
// Partagés par tout ce qui a besoin d'un rendu stable à partir d'un id
// (génération de motifs SVG, dispositions, etc.).

/** PRNG déterministe (LCG) à partir d'une graine numérique. */
export function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/** Convertit un id (string ou number) en graine numérique stable. */
export function getSeed(id: number | string): number {
  return typeof id === "string"
    ? id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    : id;
}
