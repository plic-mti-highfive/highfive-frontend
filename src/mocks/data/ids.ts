/**
 * Identifiants et dates deterministes pour le jeu de demo. Les uuid sont
 * generes sequentiellement (version 4, variante 8, conformes a `z.uuid()`)
 * pour rester lisibles a la relecture d'un diff tout en restant valides.
 */
let counter = 0;

export function nextId(): string {
  counter += 1;
  const hex = counter.toString(16).padStart(12, "0");
  return `00000000-0000-4000-8000-${hex}`;
}

/** "Aujourd'hui" du jeu de demo (voir docs/v2 : activite etalee sur 30 jours avant cette date). */
export const DEMO_NOW = new Date("2026-09-13T15:00:00.000Z");

function offset(ms: number): string {
  return new Date(DEMO_NOW.getTime() - ms).toISOString();
}

export const minutesAgo = (n: number): string => offset(n * 60 * 1000);
export const hoursAgo = (n: number): string => offset(n * 60 * 60 * 1000);
export const daysAgo = (n: number): string => offset(n * 24 * 60 * 60 * 1000);
export const isoNow = (): string => DEMO_NOW.toISOString();
