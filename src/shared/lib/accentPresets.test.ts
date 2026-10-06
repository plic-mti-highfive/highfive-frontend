/// <reference types="node" />
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ACCENT_NAMES } from "./accent";
import { ACCENT_PRESETS, presetColor } from "./accentPresets";

// Lu tel quel : `import ?raw` renvoie du vide pour un .css sous vitest (plugin CSS).
const css = readFileSync(new URL("../../index.css", import.meta.url), "utf8");

describe("ACCENT_PRESETS", () => {
  it("couvre exactement les six teintes de la roue, dans l'ordre", () => {
    expect(ACCENT_PRESETS.map((preset) => preset.name)).toEqual([
      ...ACCENT_NAMES,
    ]);
  });

  it("reprend les valeurs de --color-<teinte> de src/index.css (pas de derive)", () => {
    for (const preset of ACCENT_PRESETS) {
      const match = new RegExp(
        `--color-${preset.name}:\\s*(#[0-9a-fA-F]{6})`,
      ).exec(css);
      expect(match, `--color-${preset.name} introuvable`).not.toBeNull();
      expect(preset.color).toBe(match![1].toLowerCase());
    }
  });

  it("presetColor renvoie la couleur d'une teinte", () => {
    expect(presetColor("sky")).toBe("#3ec6f5");
  });
});
