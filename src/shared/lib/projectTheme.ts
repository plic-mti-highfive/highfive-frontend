import type { CSSProperties } from "react";
import type { ProjectTheme } from "@/domain";
import {
  contrastRatio,
  deriveAccentOn,
  ensureContrast,
  isLightColor,
  mixColors,
} from "./accentColor";

/**
 * Theme de la fiche d'un projet (docs/v2/customization-scope.md).
 *
 * Le porteur choisit quatre couleurs (fond, blocs, texte, accent). Ce module
 * en derive tout le reste et garantit la lisibilite, quelles que soient les
 * couleurs recues (le backend les stocke telles quelles) :
 *  - texte et texte secondaire : >= 4.5:1 sur le fond et sur les blocs ;
 *  - accent : une couleur d'appui (>= 3:1), une surface teintee et une encre
 *    de lien (>= 4.5:1), comme l'accent des cartes ;
 *  - texte des boutons : noir ou blanc, selon le meilleur contraste.
 * Tout se fait en OKLab/OKLCH, meme teinte : seule la luminosite bouge.
 * La fiche impose sa palette quel que soit le theme clair/sombre du site.
 */

export type ThemeScheme = "light" | "dark";

export interface ProjectThemeTokens {
  scheme: ThemeScheme;
  background: string;
  panel: string;
  text: string;
  mutedText: string;
  border: string;
  muted: string;
  accent: string;
  accentSurface: string;
  accentInk: string;
  onAccent: string;
  /** Une couleur a ete corrigee pour rester lisible. */
  adjusted: boolean;
}

/** Part de couleur dans la surface teintee de l'accent. */
const ACCENT_SURFACE_MIX = 0.14;

const cache = new Map<string, ProjectThemeTokens>();

/** Derive les tokens d'un theme ; calcule une fois par palette. */
export function deriveProjectTheme(theme: ProjectTheme): ProjectThemeTokens {
  const key = `${theme.background}|${theme.panel}|${theme.text}|${theme.accent}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const { background, panel } = theme;
  const scheme: ThemeScheme = isLightColor(background) ? "light" : "dark";
  const surfaces = [background, panel];

  const text = ensureContrast(theme.text, scheme, surfaces, 4.5);
  const mutedText = ensureContrast(
    mixColors(text, panel, 0.35),
    scheme,
    surfaces,
    4.5,
  );
  const accent = deriveAccentOn(theme.accent, scheme, {
    background,
    card: panel,
    mix: ACCENT_SURFACE_MIX,
  });

  const tokens: ProjectThemeTokens = {
    scheme,
    background,
    panel,
    text,
    mutedText,
    border: mixColors(background, text, 0.18),
    muted: mixColors(panel, text, 0.07),
    accent: accent.base,
    accentSurface: accent.surface,
    accentInk: accent.ink,
    onAccent:
      contrastRatio(accent.base, "#000000") >=
      contrastRatio(accent.base, "#ffffff")
        ? "#000000"
        : "#ffffff",
    adjusted: text !== theme.text.toLowerCase(),
  };
  cache.set(key, tokens);
  return tokens;
}

/**
 * Attributs a poser sur le conteneur de la fiche : `data-project-theme` (voir
 * `src/index.css`, qui recable les tokens semantiques sur ces variables) et
 * `data-project-scheme`. Sans theme : aucun attribut, la fiche suit le site.
 */
export function projectThemeAttributes(theme: ProjectTheme | undefined): {
  "data-project-theme"?: "";
  "data-project-scheme"?: ThemeScheme;
  style?: CSSProperties;
} {
  if (!theme) return {};
  const tokens = deriveProjectTheme(theme);
  return {
    "data-project-theme": "",
    "data-project-scheme": tokens.scheme,
    style: {
      "--pt-background": tokens.background,
      "--pt-panel": tokens.panel,
      "--pt-text": tokens.text,
      "--pt-muted-text": tokens.mutedText,
      "--pt-border": tokens.border,
      "--pt-muted": tokens.muted,
      "--pt-accent": tokens.accent,
      "--pt-accent-surface": tokens.accentSurface,
      "--pt-accent-ink": tokens.accentInk,
      "--pt-on-accent": tokens.onAccent,
    } as CSSProperties,
  };
}
