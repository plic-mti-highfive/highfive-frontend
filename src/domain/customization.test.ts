import { describe, expect, it } from "vitest";
import {
  DEFAULT_SECTIONS,
  MAX_GALLERY_IMAGES,
  projectCustomizationSchema,
  projectSchema,
  projectSummarySchema,
  type ProjectCustomization,
} from "./index";

const IMAGE_ID = "00000000-0000-4000-8c0d-000000000001";
const OTHER_IMAGE_ID = "00000000-0000-4000-8c0d-000000000002";
const URL = "https://example.test/image.webp";

function customization(
  overrides: Partial<ProjectCustomization> = {},
): ProjectCustomization {
  return {
    sections: [...DEFAULT_SECTIONS],
    gallery: [],
    ...overrides,
  };
}

function galleryItem(id: string, alt = "Une image") {
  return { id, url: URL, alt, decorative: false };
}

describe("projectCustomizationSchema", () => {
  it("accepte une personnalisation minimale (sections par defaut, pas d'image)", () => {
    expect(() =>
      projectCustomizationSchema.parse(customization()),
    ).not.toThrow();
  });

  it("exige un texte alternatif, sauf image decorative", () => {
    const withoutAlt = customization({
      gallery: [galleryItem(IMAGE_ID, "  ")],
    });
    expect(projectCustomizationSchema.safeParse(withoutAlt).success).toBe(
      false,
    );

    const decorative = customization({
      gallery: [{ ...galleryItem(IMAGE_ID, ""), decorative: true }],
    });
    expect(projectCustomizationSchema.safeParse(decorative).success).toBe(true);
  });

  it("applique la meme regle d'alt a la banniere", () => {
    const banner = {
      id: IMAGE_ID,
      url: URL,
      alt: "",
      decorative: false,
      focal: { x: 50, y: 50 },
    };
    expect(
      projectCustomizationSchema.safeParse(customization({ banner })).success,
    ).toBe(false);
    expect(
      projectCustomizationSchema.safeParse(
        customization({ banner: { ...banner, decorative: true } }),
      ).success,
    ).toBe(true);
  });

  it("borne le point focal de la banniere a 0-100", () => {
    const banner = {
      id: IMAGE_ID,
      url: URL,
      alt: "Banniere",
      decorative: false,
      focal: { x: 101, y: 50 },
    };
    expect(
      projectCustomizationSchema.safeParse(customization({ banner })).success,
    ).toBe(false);
  });

  it(`limite la galerie a ${MAX_GALLERY_IMAGES} images`, () => {
    const ids = Array.from(
      { length: MAX_GALLERY_IMAGES + 1 },
      (_, i) => `00000000-0000-4000-8c0d-${String(i + 1).padStart(12, "0")}`,
    );
    const tooMany = customization({
      gallery: ids.map((id) => galleryItem(id)),
    });
    expect(projectCustomizationSchema.safeParse(tooMany).success).toBe(false);
    const ok = customization({
      gallery: ids.slice(0, MAX_GALLERY_IMAGES).map((id) => galleryItem(id)),
    });
    expect(projectCustomizationSchema.safeParse(ok).success).toBe(true);
  });

  it("refuse deux images de galerie avec le meme id", () => {
    const duplicated = customization({
      gallery: [galleryItem(IMAGE_ID), galleryItem(IMAGE_ID)],
    });
    expect(projectCustomizationSchema.safeParse(duplicated).success).toBe(
      false,
    );
    const distinct = customization({
      gallery: [galleryItem(IMAGE_ID), galleryItem(OTHER_IMAGE_ID)],
    });
    expect(projectCustomizationSchema.safeParse(distinct).success).toBe(true);
  });

  it("exige chaque section exactement une fois", () => {
    const missing = customization({
      sections: [
        { id: "pinned", visible: true },
        { id: "about", visible: true },
        { id: "gallery", visible: true },
      ],
    });
    expect(projectCustomizationSchema.safeParse(missing).success).toBe(false);

    const duplicated = customization({
      sections: [
        { id: "pinned", visible: true },
        { id: "pinned", visible: false },
        { id: "gallery", visible: true },
        { id: "comments", visible: true },
      ],
    });
    expect(projectCustomizationSchema.safeParse(duplicated).success).toBe(
      false,
    );
  });

  it("n'accepte que les six teintes de la roue", () => {
    expect(
      projectCustomizationSchema.safeParse({
        ...customization(),
        accent: "sky",
      }).success,
    ).toBe(true);
    expect(
      projectCustomizationSchema.safeParse({
        ...customization(),
        accent: "teal",
      }).success,
    ).toBe(false);
  });

  it("refuse une url d'image qui n'est pas http(s) ou data:image", () => {
    const javascriptUrl = customization({
      gallery: [{ ...galleryItem(IMAGE_ID), url: "javascript:alert(1)" }],
    });
    expect(projectCustomizationSchema.safeParse(javascriptUrl).success).toBe(
      false,
    );
    const dataUrl = customization({
      gallery: [
        { ...galleryItem(IMAGE_ID), url: "data:image/webp;base64,AAAA" },
      ],
    });
    expect(projectCustomizationSchema.safeParse(dataUrl).success).toBe(true);
  });
});

describe("champs additifs (V2-4)", () => {
  const baseProject = {
    id: "00000000-0000-4000-8000-000000000100",
    slug: "projet-test",
    title: "Projet test",
    tagline: "Une accroche",
    tags: ["dessin"],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: "00000000-0000-4000-8000-000000000200",
    highfiveCount: 0,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
    lastActivityAt: "2026-09-01T10:00:00.000Z",
  };

  it("`Project.customization` est optionnel et conserve la personnalisation", () => {
    expect(projectSchema.parse(baseProject).customization).toBeUndefined();
    const parsed = projectSchema.parse({
      ...baseProject,
      customization: customization({ accent: "purple" }),
    });
    expect(parsed.customization?.accent).toBe("purple");
  });

  it("`ProjectSummary.accent` est optionnel", () => {
    const owner = {
      id: baseProject.ownerId,
      username: "alex.rivera",
      displayName: "Alex Rivera",
      avatar: "https://example.test/avatar.png",
    };
    const summary = {
      id: baseProject.id,
      slug: baseProject.slug,
      title: baseProject.title,
      tagline: baseProject.tagline,
      tags: baseProject.tags,
      visibility: "public",
      participation: "open",
      state: "active",
      highfiveCount: 0,
      membersCount: 1,
      owner,
    };
    expect(projectSummarySchema.parse(summary).accent).toBeUndefined();
    expect(
      projectSummarySchema.parse({ ...summary, accent: "rose" }).accent,
    ).toBe("rose");
    expect(
      projectSummarySchema.safeParse({ ...summary, accent: "teal" }).success,
    ).toBe(false);
  });
});
