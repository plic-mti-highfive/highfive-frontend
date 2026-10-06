import { describe, expect, it } from "vitest";
import { contrastRatio } from "./accentColor";
import { deriveProjectTheme, projectThemeAttributes } from "./projectTheme";
import { PROJECT_THEME_PRESETS } from "./projectThemePresets";

describe("deriveProjectTheme", () => {
  it("detecte le schema clair ou sombre d'apres le fond de page", () => {
    expect(
      deriveProjectTheme({
        background: "#ffffff",
        panel: "#f0f0f0",
        text: "#111111",
        accent: "#3366ff",
      }).scheme,
    ).toBe("light");
    expect(
      deriveProjectTheme({
        background: "#101018",
        panel: "#1a1a24",
        text: "#f5f5f5",
        accent: "#3366ff",
      }).scheme,
    ).toBe("dark");
  });

  it("garde un texte deja lisible tel quel", () => {
    const tokens = deriveProjectTheme({
      background: "#ffffff",
      panel: "#f6f6f6",
      text: "#222222",
      accent: "#0044cc",
    });
    expect(tokens.text).toBe("#222222");
    expect(tokens.adjusted).toBe(false);
  });

  it("corrige un texte illisible (gris clair sur blanc) et le signale", () => {
    const tokens = deriveProjectTheme({
      background: "#ffffff",
      panel: "#fafafa",
      text: "#dddddd",
      accent: "#0044cc",
    });
    expect(tokens.adjusted).toBe(true);
    expect(contrastRatio(tokens.text, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens.text, "#fafafa")).toBeGreaterThanOrEqual(4.5);
  });

  it("garantit texte, texte secondaire et lien lisibles pour toute palette extreme", () => {
    const extremes = [
      ["#ffffff", "#ffffff", "#ffffff", "#ffff00"],
      ["#000000", "#000000", "#000000", "#0000ff"],
      ["#ffff00", "#ff00ff", "#00ffff", "#ffff00"],
      ["#333333", "#444444", "#555555", "#666666"],
    ] as const;
    for (const [background, panel, text, accent] of extremes) {
      const tokens = deriveProjectTheme({ background, panel, text, accent });
      for (const surface of [tokens.background, tokens.panel]) {
        // Les palettes extremes peuvent n'avoir aucune solution a 4.5 (ex. fond
        // gris moyen) : on exige au moins le meilleur noir/blanc possible.
        const best = Math.max(
          contrastRatio("#000000", surface),
          contrastRatio("#ffffff", surface),
        );
        const floor = Math.min(4.5, best);
        expect(contrastRatio(tokens.text, surface)).toBeGreaterThanOrEqual(
          floor - 0.01,
        );
        expect(contrastRatio(tokens.accentInk, surface)).toBeGreaterThanOrEqual(
          floor - 0.01,
        );
      }
    }
  });

  it("choisit le texte de bouton (noir ou blanc) au meilleur contraste sur l'accent", () => {
    const light = deriveProjectTheme({
      background: "#ffffff",
      panel: "#ffffff",
      text: "#111111",
      accent: "#ffd600",
    });
    expect(light.onAccent).toBe("#000000");
    const dark = deriveProjectTheme({
      background: "#ffffff",
      panel: "#ffffff",
      text: "#111111",
      accent: "#1a237e",
    });
    expect(dark.onAccent).toBe("#ffffff");
  });

  it("derive des bordures et un fond discret visibles mais pas plus contrastes que le texte", () => {
    const tokens = deriveProjectTheme({
      background: "#ffffff",
      panel: "#ffffff",
      text: "#111111",
      accent: "#0044cc",
    });
    expect(tokens.border).not.toBe(tokens.background);
    expect(contrastRatio(tokens.border, tokens.background)).toBeLessThan(
      contrastRatio(tokens.text, tokens.background),
    );
    expect(
      contrastRatio(tokens.mutedText, tokens.panel),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("couvre tous les presets : texte et lien lisibles sans correction du texte", () => {
    for (const preset of PROJECT_THEME_PRESETS) {
      const tokens = deriveProjectTheme(preset.theme);
      expect(tokens.adjusted, preset.id).toBe(false);
      for (const surface of [tokens.background, tokens.panel]) {
        expect(contrastRatio(tokens.accentInk, surface)).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    }
  });
});

describe("projectThemeAttributes", () => {
  it("sans theme : aucun attribut, la fiche suit le site", () => {
    expect(projectThemeAttributes(undefined)).toEqual({});
  });

  it("avec un theme : marque le conteneur, son schema et ses variables", () => {
    const attributes = projectThemeAttributes({
      background: "#12141f",
      panel: "#1b1e2e",
      text: "#f1f2f8",
      accent: "#7aa2ff",
    });
    expect(attributes["data-project-theme"]).toBe("");
    expect(attributes["data-project-scheme"]).toBe("dark");
    const style = attributes.style as Record<string, string>;
    expect(style["--pt-background"]).toBe("#12141f");
    expect(style["--pt-panel"]).toBe("#1b1e2e");
    for (const name of [
      "--pt-text",
      "--pt-muted-text",
      "--pt-border",
      "--pt-muted",
      "--pt-accent",
      "--pt-accent-surface",
      "--pt-accent-ink",
      "--pt-on-accent",
    ]) {
      expect(style[name], name).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
