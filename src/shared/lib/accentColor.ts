import type { CSSProperties } from "react";
import type { AccentName } from "./accent";

/**
 * Accent de projet a couleur libre (docs/v2/customization-scope.md).
 *
 * Le porteur choisit une couleur ; ce module en derive, pour chacun des deux
 * themes, des variantes dont le contraste est garanti (WCAG) :
 *  - `base`    : la couleur, ajustee si elle ne ressort pas sur le fond (>= 3:1,
 *                usage non textuel : puces, liseres, anneaux de focus) ;
 *  - `surface` : un fond teinte discret (melange de la couleur dans le fond du theme) ;
 *  - `ink`     : une couleur de texte (liens) lisible (>= 4.5:1) sur le fond, la
 *                carte et la surface teintee.
 * Tout le calcul se fait en OKLab/OKLCH : meme teinte, seule la luminosite bouge.
 * Aucune couleur n'est ecrite en dur : les references de fond viennent des
 * memes valeurs OKLCH que `src/index.css` (`--background`, `--card`).
 */

type Rgb = readonly [number, number, number];
type Lab = readonly [number, number, number];

export interface AccentThemeTokens {
  base: string;
  surface: string;
  ink: string;
}
export interface AccentTokens {
  light: AccentThemeTokens;
  dark: AccentThemeTokens;
}

/** Valeur du selecteur natif quand aucune couleur n'est choisie (il exige une couleur). */
export const NEUTRAL_ACCENT = "#808080";

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `#rgb`, `rgb`, `#rrggbb` ou `rrggbb` (casse libre) -> `#rrggbb` en minuscules, sinon `null`. */
export function normalizeHex(input: string): string | null {
  const match = HEX_RE.exec(input.trim());
  if (!match) return null;
  const digits = match[1].toLowerCase();
  const full =
    digits.length === 3
      ? digits
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : digits;
  return `#${full}`;
}

function hexToRgb(hex: string): Rgb {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(linear: number): number {
  const c = Math.min(1, Math.max(0, linear));
  const encoded = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.round(encoded * 255);
}

function linearRgbToOklab([r, g, b]: Rgb): Lab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLinearRgb([L, a, b]: Lab): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function hexToOklab(hex: string): Lab {
  const [r, g, b] = hexToRgb(hex);
  return linearRgbToOklab([srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)]);
}

function inGamut([r, g, b]: Rgb): boolean {
  const epsilon = 1e-4;
  return [r, g, b].every((c) => c >= -epsilon && c <= 1 + epsilon);
}

function rgbToHex(linear: Rgb): string {
  return `#${linear
    .map((c) => linearToSrgb(c).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** OKLCH -> hex ; si la couleur sort du gamut sRGB, la chroma est reduite (teinte et luminosite gardees). */
function oklchToHex(L: number, C: number, hueRadians: number): string {
  const at = (chroma: number): Rgb =>
    oklabToLinearRgb([
      L,
      chroma * Math.cos(hueRadians),
      chroma * Math.sin(hueRadians),
    ]);
  if (inGamut(at(C))) return rgbToHex(at(C));
  let low = 0;
  let high = C;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (inGamut(at(mid))) low = mid;
    else high = mid;
  }
  return rgbToHex(at(low));
}

function hexToOklch(hex: string): { L: number; C: number; h: number } {
  const [L, a, b] = hexToOklab(hex);
  return { L, C: Math.hypot(a, b), h: Math.atan2(b, a) };
}

function labToHex([L, a, b]: Lab): string {
  return oklchToHex(L, Math.hypot(a, b), Math.atan2(b, a));
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

/** Rapport de contraste WCAG 2.x entre deux couleurs hex (1 a 21). */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Fonds de reference de chaque theme : memes valeurs OKLCH que `--background` / `--card` de `src/index.css`. */
export const ACCENT_THEME_SURFACES = {
  light: {
    background: oklchToHex(0.98, 0.008, (85 * Math.PI) / 180),
    card: oklchToHex(1, 0.005, (85 * Math.PI) / 180),
    mix: 0.12,
  },
  dark: {
    background: oklchToHex(0.15, 0.02, (280 * Math.PI) / 180),
    card: oklchToHex(0.18, 0.025, (280 * Math.PI) / 180),
    mix: 0.18,
  },
} as const;

/**
 * Ajuste la luminosite de `hex` (teinte et chroma gardees) jusqu'a atteindre
 * `minimum` contre toutes les couleurs de `against`. Theme clair : on assombrit ;
 * theme sombre : on eclaircit. Une couleur deja assez contrastee est renvoyee telle quelle.
 */
function ensureContrast(
  hex: string,
  theme: "light" | "dark",
  against: string[],
  minimum: number,
): string {
  const ok = (candidate: string) =>
    against.every((other) => contrastRatio(candidate, other) >= minimum);
  if (ok(hex)) return hex;
  const { L, C, h } = hexToOklch(hex);
  const direction = theme === "light" ? -1 : 1;
  for (let step = 1; step <= 100; step += 1) {
    const lightness = Math.min(1, Math.max(0, L + direction * step * 0.01));
    const candidate = oklchToHex(lightness, C, h);
    if (ok(candidate)) return candidate;
  }
  return theme === "light" ? "#000000" : "#ffffff";
}

function deriveTheme(base: string, theme: "light" | "dark"): AccentThemeTokens {
  const { background, card, mix } = ACCENT_THEME_SURFACES[theme];
  const baseLab = hexToOklab(base);
  const backgroundLab = hexToOklab(background);
  const surface = labToHex([
    backgroundLab[0] + (baseLab[0] - backgroundLab[0]) * mix,
    backgroundLab[1] + (baseLab[1] - backgroundLab[1]) * mix,
    backgroundLab[2] + (baseLab[2] - backgroundLab[2]) * mix,
  ]);
  return {
    // Usage non textuel : 3:1 suffit (WCAG 1.4.11).
    base: ensureContrast(base, theme, [background, card], 3),
    surface,
    // Texte : 4.5:1 sur le fond, la carte et la surface teintee.
    ink: ensureContrast(base, theme, [background, card, surface], 4.5),
  };
}

const cache = new Map<string, AccentTokens>();

/** Variantes clair/sombre d'une couleur d'accent (`#rrggbb`), calculees une fois par couleur. */
export function deriveAccentTokens(color: string): AccentTokens {
  const hex = normalizeHex(color) ?? NEUTRAL_ACCENT;
  const cached = cache.get(hex);
  if (cached) return cached;
  const tokens = {
    light: deriveTheme(hex, "light"),
    dark: deriveTheme(hex, "dark"),
  };
  cache.set(hex, tokens);
  return tokens;
}

/**
 * Variables CSS portees par un conteneur `data-accent-custom` ; `src/index.css`
 * les reaffecte aux variables `--accent-*` selon le theme (V2-2 : seules des
 * variables CSS dynamiques passent par `style`).
 */
export function accentStyle(color: string): CSSProperties {
  const { light, dark } = deriveAccentTokens(color);
  return {
    "--pa-base": light.base,
    "--pa-surface": light.surface,
    "--pa-ink": light.ink,
    "--pa-base-dk": dark.base,
    "--pa-surface-dk": dark.surface,
    "--pa-ink-dk": dark.ink,
  } as CSSProperties;
}

/**
 * Attributs a poser sur le conteneur d'un projet : sa couleur libre si le
 * porteur en a choisi une, sinon la teinte de la roue donnee en repli (ou rien).
 */
export function accentAttributes(
  color: string | undefined,
  fallback?: AccentName,
): {
  "data-accent"?: AccentName;
  "data-accent-custom"?: "";
  style?: CSSProperties;
} {
  if (color) return { "data-accent-custom": "", style: accentStyle(color) };
  return fallback ? { "data-accent": fallback } : {};
}
