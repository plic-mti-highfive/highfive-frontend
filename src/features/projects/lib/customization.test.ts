import { describe, expect, it } from "vitest";
import { DEFAULT_SECTIONS, type ProjectCustomization } from "@/domain";
import { resolveSections } from "./customization";

function withSections(
  sections: ProjectCustomization["sections"],
): ProjectCustomization {
  return { sections, gallery: [] };
}

describe("resolveSections", () => {
  it("renvoie l'ordre par defaut sans personnalisation", () => {
    expect(resolveSections(undefined)).toEqual(DEFAULT_SECTIONS);
  });

  it("respecte l'ordre et la visibilite choisis", () => {
    const resolved = resolveSections(
      withSections([
        { id: "about", visible: true },
        { id: "gallery", visible: false },
        { id: "pinned", visible: true },
        { id: "comments", visible: true },
      ]),
    );
    expect(resolved.map((s) => s.id)).toEqual([
      "about",
      "gallery",
      "pinned",
      "comments",
    ]);
    expect(resolved.find((s) => s.id === "gallery")?.visible).toBe(false);
  });

  it("complete les sections manquantes a la fin, dans l'ordre par defaut", () => {
    const resolved = resolveSections(
      withSections([
        { id: "comments", visible: true },
        { id: "about", visible: false },
      ]),
    );
    expect(resolved.map((s) => s.id)).toEqual([
      "comments",
      "about",
      "pinned",
      "gallery",
    ]);
  });

  it("ignore les doublons (la premiere occurrence gagne)", () => {
    const resolved = resolveSections(
      withSections([
        { id: "about", visible: false },
        { id: "about", visible: true },
      ]),
    );
    expect(resolved.filter((s) => s.id === "about")).toEqual([
      { id: "about", visible: false },
    ]);
    expect(resolved).toHaveLength(4);
  });

  it("ne mute pas les sections par defaut", () => {
    const resolved = resolveSections(undefined);
    resolved[0].visible = false;
    expect(DEFAULT_SECTIONS[0].visible).toBe(true);
  });
});
