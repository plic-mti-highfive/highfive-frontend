import { describe, expect, it } from "vitest";
import {
  ACCENT_THEME_SURFACES,
  accentAttributes,
  accentStyle,
  contrastRatio,
  deriveAccentTokens,
  normalizeHex,
} from "./accentColor";
import { ACCENT_PRESETS } from "./accentPresets";

describe("normalizeHex", () => {
  it("normalise 3 ou 6 chiffres, avec ou sans #, en minuscules", () => {
    expect(normalizeHex("#FF4D8C")).toBe("#ff4d8c");
    expect(normalizeHex("ff4d8c")).toBe("#ff4d8c");
    expect(normalizeHex("#f48")).toBe("#ff4488");
    expect(normalizeHex("  #AbC ")).toBe("#aabbcc");
  });

  it("refuse tout le reste", () => {
    for (const input of [
      "",
      "#12",
      "#12345",
      "#1234567",
      "rouge",
      "#gggggg",
      "rgb(0,0,0)",
    ]) {
      expect(normalizeHex(input)).toBeNull();
    }
  });
});

describe("contrastRatio", () => {
  it("vaut 21 entre noir et blanc, et 1 entre deux couleurs identiques", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
  });

  it("retrouve la valeur WCAG connue du gris #767676 sur blanc (4.54:1)", () => {
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 1);
  });
});

const SAMPLE_COLORS = [
  ...ACCENT_PRESETS.map((preset) => preset.color),
  "#000000",
  "#ffffff",
  "#ffff00",
  "#0000ff",
  "#ff0000",
  "#808080",
  "#123456",
  "#fefefe",
  "#010101",
];

describe.each(["light", "dark"] as const)(
  "deriveAccentTokens (theme %s)",
  (theme) => {
    const { background, card } = ACCENT_THEME_SURFACES[theme];

    it.each(SAMPLE_COLORS)(
      "%s : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface",
      (color) => {
        const tokens = deriveAccentTokens(color)[theme];
        for (const target of [background, card, tokens.surface]) {
          expect(contrastRatio(tokens.ink, target)).toBeGreaterThanOrEqual(4.5);
        }
        for (const target of [background, card]) {
          expect(contrastRatio(tokens.base, target)).toBeGreaterThanOrEqual(3);
        }
      },
    );

    it("produit des couleurs #rrggbb valides", () => {
      for (const color of SAMPLE_COLORS) {
        const tokens = deriveAccentTokens(color)[theme];
        for (const value of Object.values(tokens)) {
          expect(value).toMatch(/^#[0-9a-f]{6}$/);
        }
      }
    });

    it("garde la surface teintee proche du fond (discrete)", () => {
      for (const color of SAMPLE_COLORS) {
        const { surface } = deriveAccentTokens(color)[theme];
        expect(contrastRatio(surface, background)).toBeLessThan(1.6);
      }
    });
  },
);

describe("deriveAccentTokens", () => {
  it("laisse intacte une couleur deja assez contrastee dans le theme", () => {
    // Un violet sombre : bien contraste sur le fond clair, la base ne bouge pas.
    expect(deriveAccentTokens("#4a0080").light.base).toBe("#4a0080");
    // Un jaune vif : bien contraste sur le fond sombre.
    expect(deriveAccentTokens("#ffd600").dark.base).toBe("#ffd600");
  });

  it("assombrit un jaune en theme clair et eclaircit un violet fonce en theme sombre", () => {
    expect(deriveAccentTokens("#ffd600").light.ink).not.toBe("#ffd600");
    expect(deriveAccentTokens("#4a0080").dark.ink).not.toBe("#4a0080");
  });

  it("donne un resultat stable et memoise pour une meme couleur", () => {
    expect(deriveAccentTokens("#FF4D8C")).toBe(deriveAccentTokens("#ff4d8c"));
  });

  it("se replie sur un gris pour une valeur invalide au lieu de planter", () => {
    expect(() => deriveAccentTokens("n'importe quoi")).not.toThrow();
  });
});

describe("accentStyle et accentAttributes", () => {
  it("expose six variables CSS --pa-*", () => {
    const style = accentStyle("#ff4d8c") as Record<string, string>;
    expect(Object.keys(style).sort()).toEqual([
      "--pa-base",
      "--pa-base-dk",
      "--pa-ink",
      "--pa-ink-dk",
      "--pa-surface",
      "--pa-surface-dk",
    ]);
  });

  it("pose data-accent-custom + style avec une couleur libre", () => {
    const attributes = accentAttributes("#ff4d8c", "sky");
    expect(attributes["data-accent-custom"]).toBe("");
    expect(attributes["data-accent"]).toBeUndefined();
    expect(attributes.style).toBeDefined();
  });

  it("retombe sur la teinte de la roue sans couleur, ou ne pose rien", () => {
    expect(accentAttributes(undefined, "sky")).toEqual({
      "data-accent": "sky",
    });
    expect(accentAttributes(undefined)).toEqual({});
  });
});
