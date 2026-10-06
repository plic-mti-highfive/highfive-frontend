import type { ProjectTheme } from "@/domain";

/**
 * Palettes proposees dans l'editeur de personnalisation : un clic remplit les
 * quatre couleurs du theme. Fichier exempte de `check-tokens` (donnees de
 * couleur, pas du style en dur). Le contraste de chaque palette est verifie
 * par `projectThemePresets.test.ts`.
 */
export const PROJECT_THEME_PRESETS: readonly {
  id: string;
  label: string;
  theme: ProjectTheme;
}[] = [
  {
    id: "papier",
    label: "Papier",
    theme: {
      background: "#f6f1e7",
      panel: "#fffdf8",
      text: "#2b2620",
      accent: "#b4532a",
    },
  },
  {
    id: "foret",
    label: "Forêt",
    theme: {
      background: "#eaf1e8",
      panel: "#fafdf9",
      text: "#1d2b20",
      accent: "#2f7d4f",
    },
  },
  {
    id: "bonbon",
    label: "Bonbon",
    theme: {
      background: "#fff0f5",
      panel: "#ffffff",
      text: "#3a1d2b",
      accent: "#d6246e",
    },
  },
  {
    id: "nuit",
    label: "Nuit",
    theme: {
      background: "#12141f",
      panel: "#1b1e2e",
      text: "#f1f2f8",
      accent: "#7aa2ff",
    },
  },
  {
    id: "ocean",
    label: "Océan",
    theme: {
      background: "#0d1f2a",
      panel: "#12303f",
      text: "#e8f4f8",
      accent: "#3ec6f5",
    },
  },
  {
    id: "terminal",
    label: "Terminal",
    theme: {
      background: "#0b0b0f",
      panel: "#15151c",
      text: "#e9ffee",
      accent: "#5ed651",
    },
  },
];

/** Palette de depart quand on active les couleurs : celle du site, en clair. */
export const DEFAULT_PROJECT_THEME: ProjectTheme =
  PROJECT_THEME_PRESETS[0].theme;

/** Identifiant du preset dont les quatre couleurs egalent `theme`, sinon `undefined`. */
export function matchPreset(
  theme: ProjectTheme | undefined,
): string | undefined {
  if (!theme) return undefined;
  return PROJECT_THEME_PRESETS.find(
    (preset) =>
      preset.theme.background === theme.background &&
      preset.theme.panel === theme.panel &&
      preset.theme.text === theme.text &&
      preset.theme.accent === theme.accent,
  )?.id;
}

/** Palette d'un preset par identifiant (leve une erreur si inconnu : donnee de code, pas de saisie). */
export function presetTheme(id: string): ProjectTheme {
  const preset = PROJECT_THEME_PRESETS.find((item) => item.id === id);
  if (!preset) throw new Error(`Preset de palette inconnu : ${id}`);
  return preset.theme;
}
