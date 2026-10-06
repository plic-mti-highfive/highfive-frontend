import { describe, expect, it } from "vitest";
import {
  computeTargetSize,
  MAX_INPUT_BYTES,
  validateImageFile,
} from "./imageCompression";

describe("computeTargetSize", () => {
  it("reduit en conservant le ratio quand l'image est plus large que le maximum", () => {
    expect(computeTargetSize(3200, 1600, 1600)).toEqual({
      width: 1600,
      height: 800,
    });
    expect(computeTargetSize(4000, 3000, 1200)).toEqual({
      width: 1200,
      height: 900,
    });
  });

  it("n'agrandit jamais une image plus petite que le maximum", () => {
    expect(computeTargetSize(800, 600, 1600)).toEqual({
      width: 800,
      height: 600,
    });
    expect(computeTargetSize(1600, 900, 1600)).toEqual({
      width: 1600,
      height: 900,
    });
  });

  it("arrondit a des entiers d'au moins 1 pixel", () => {
    expect(computeTargetSize(1601, 1, 1600)).toEqual({
      width: 1600,
      height: 1,
    });
    const { width, height } = computeTargetSize(3333, 1111, 1000);
    expect(Number.isInteger(width)).toBe(true);
    expect(Number.isInteger(height)).toBe(true);
  });
});

describe("validateImageFile", () => {
  it("accepte JPEG, PNG, WebP et AVIF", () => {
    for (const type of [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ]) {
      expect(validateImageFile({ type, size: 1024 })).toBeNull();
    }
  });

  it("refuse les autres formats, GIF et SVG compris", () => {
    for (const type of ["image/gif", "image/svg+xml", "application/pdf", ""]) {
      expect(validateImageFile({ type, size: 1024 })).toMatch(
        /Format non pris en charge/,
      );
    }
  });

  it("refuse un fichier de plus de 10 Mo, accepte exactement 10 Mo", () => {
    expect(
      validateImageFile({ type: "image/png", size: MAX_INPUT_BYTES + 1 }),
    ).toMatch(/10 Mo/);
    expect(
      validateImageFile({ type: "image/png", size: MAX_INPUT_BYTES }),
    ).toBeNull();
  });
});
