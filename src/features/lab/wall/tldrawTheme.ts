import { useTheme } from "@shared/contexts";

/**
 * Exception unique aux greps de contrôle V2-2/CONVENTIONS.md : tldraw a sa
 * propre palette interne (les couleurs de forme/note du menu de style, les
 * curseurs de collaborateurs, les poignées de sélection…), gérée par le
 * package `tldraw` lui-même et totalement indépendante des tokens HighFive!
 * (`src/index.css`). Elle ne peut pas passer par nos tokens sans forker le
 * package. Ce fichier est le seul endroit du Mur qui touche à cette palette
 * — tout le reste de `src/features/lab` reste sur les primitives/tokens
 * habituels.
 *
 * Ce qu'on fait ici : faire suivre à l'éditeur tldraw le thème clair/sombre
 * choisi dans l'app (`ThemeContext`), pour que le fond du canevas et les
 * panneaux natifs de tldraw ne jurent pas avec le reste de l'interface —
 * sans jamais recolorer les formes/notes elles-mêmes, qui restent la
 * palette native tldraw choisie par la personne qui dessine.
 */
export function useTldrawColorScheme(): "light" | "dark" {
  const { resolvedTheme } = useTheme();
  return resolvedTheme;
}
