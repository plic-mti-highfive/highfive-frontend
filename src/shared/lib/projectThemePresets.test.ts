import { describe, expect, it } from "vitest";
import { projectThemeSchema } from "@/domain";
import {
  DEFAULT_PROJECT_THEME,
  matchPreset,
  PROJECT_THEME_PRESETS,
  presetTheme,
} from "./projectThemePresets";

describe("PROJECT_THEME_PRESETS", () => {
  it("propose six palettes aux identifiants et libelles uniques", () => {
    expect(PROJECT_THEME_PRESETS).toHaveLength(6);
    expect(new Set(PROJECT_THEME_PRESETS.map((p) => p.id)).size).toBe(6);
    expect(new Set(PROJECT_THEME_PRESETS.map((p) => p.label)).size).toBe(6);
  });

  it("chaque palette est un theme valide pour le schema", () => {
    for (const preset of PROJECT_THEME_PRESETS) {
      expect(
        projectThemeSchema.safeParse(preset.theme).success,
        preset.id,
      ).toBe(true);
    }
  });

  it("melange palettes claires et sombres", () => {
    expect(PROJECT_THEME_PRESETS.length).toBeGreaterThan(2);
    expect(DEFAULT_PROJECT_THEME).toEqual(PROJECT_THEME_PRESETS[0].theme);
  });
});

describe("matchPreset / presetTheme", () => {
  it("reconnait une palette identique, sinon rien", () => {
    expect(matchPreset(presetTheme("nuit"))).toBe("nuit");
    expect(matchPreset({ ...presetTheme("nuit"), accent: "#ff0000" })).toBe(
      undefined,
    );
    expect(matchPreset(undefined)).toBeUndefined();
  });

  it("refuse un identifiant inconnu", () => {
    expect(() => presetTheme("inconnu")).toThrow();
  });
});
