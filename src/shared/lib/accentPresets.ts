import type { AccentName } from "./accent";

/**
 * Couleurs rapides proposees dans l'editeur de personnalisation : les six
 * teintes de la roue du design system (valeurs de `--color-<teinte>` dans
 * `src/index.css`, verifiees par `accentPresets.test.ts`). Fichier exempte de
 * `check-tokens` : ce sont des donnees de couleur, pas du style en dur.
 */
export const ACCENT_PRESETS: readonly {
  name: AccentName;
  label: string;
  color: string;
}[] = [
  { name: "rose", label: "Rose", color: "#ff4d8c" },
  { name: "orange", label: "Orange", color: "#ff6b1a" },
  { name: "yellow", label: "Jaune", color: "#ffd600" },
  { name: "apple", label: "Vert pomme", color: "#5ed651" },
  { name: "sky", label: "Bleu ciel", color: "#3ec6f5" },
  { name: "purple", label: "Violet", color: "#c24bff" },
];

/** Couleur d'une teinte de la roue (`#rrggbb`). */
export function presetColor(name: AccentName): string {
  return ACCENT_PRESETS.find((preset) => preset.name === name)!.color;
}
