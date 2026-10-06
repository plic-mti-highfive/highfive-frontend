import { describe, expect, it } from "vitest";
import { presetTheme } from "@shared/lib/projectThemePresets";
import type { TeamMember } from "@/api/memberships";
import {
  DEFAULT_SECTIONS,
  type Project,
  type ProjectCustomization,
} from "@/domain";
import {
  ALT_REQUIRED_MESSAGE,
  altInputId,
  getDraftIssues,
  isDraftDirty,
  moveItem,
  resolveSections,
  toCardPreview,
  toDraft,
} from "./customization";

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

describe("moveItem", () => {
  it("echange avec le voisin du dessus ou du dessous", () => {
    expect(moveItem(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(moveItem(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
  });

  it("ne bouge pas aux extremites ni hors bornes, et ne mute pas l'entree", () => {
    const items = ["a", "b", "c"];
    expect(moveItem(items, 0, -1)).toEqual(["a", "b", "c"]);
    expect(moveItem(items, 2, 1)).toEqual(["a", "b", "c"]);
    expect(moveItem(items, 5, -1)).toEqual(["a", "b", "c"]);
    expect(moveItem(items, -1, 1)).toEqual(["a", "b", "c"]);
    expect(moveItem(items, 1, 1)).not.toBe(items);
    expect(items).toEqual(["a", "b", "c"]);
  });
});

describe("toDraft et isDraftDirty", () => {
  const IMAGE = {
    id: "00000000-0000-4000-8c0d-000000000001",
    url: "https://example.test/1.webp",
    alt: "Image 1",
    decorative: false,
  };

  it("part de la personnalisation par defaut sans personnalisation enregistree", () => {
    expect(toDraft(undefined)).toEqual({
      banner: undefined,
      theme: undefined,
      sections: DEFAULT_SECTIONS,
      gallery: [],
    });
  });

  it("un brouillon intact n'est pas modifie, avec ou sans personnalisation", () => {
    expect(isDraftDirty(toDraft(undefined), undefined)).toBe(false);
    const saved: ProjectCustomization = {
      theme: presetTheme("ocean"),
      sections: [...DEFAULT_SECTIONS],
      gallery: [IMAGE],
    };
    expect(isDraftDirty(toDraft(saved), saved)).toBe(false);
  });

  it("ignore l'ordre des cles dans la comparaison", () => {
    const saved: ProjectCustomization = {
      sections: [...DEFAULT_SECTIONS],
      gallery: [IMAGE],
    };
    const reordered = JSON.parse(
      JSON.stringify({
        gallery: [
          { decorative: false, alt: "Image 1", url: IMAGE.url, id: IMAGE.id },
        ],
        sections: DEFAULT_SECTIONS,
      }),
    ) as ProjectCustomization;
    expect(isDraftDirty(reordered, saved)).toBe(false);
  });

  it("detecte un changement de theme, d'ordre, de visibilite ou d'image", () => {
    const base = toDraft(undefined);
    expect(
      isDraftDirty({ ...base, theme: presetTheme("bonbon") }, undefined),
    ).toBe(true);
    expect(
      isDraftDirty(
        { ...base, sections: moveItem(base.sections, 0, 1) },
        undefined,
      ),
    ).toBe(true);
    expect(
      isDraftDirty(
        {
          ...base,
          sections: base.sections.map((s) =>
            s.id === "about" ? { ...s, visible: false } : s,
          ),
        },
        undefined,
      ),
    ).toBe(true);
    expect(isDraftDirty({ ...base, gallery: [IMAGE] }, undefined)).toBe(true);
  });

  it("revenir a l'etat enregistre annule le statut modifie", () => {
    const base = toDraft(undefined);
    const changed = { ...base, theme: presetTheme("bonbon") };
    expect(isDraftDirty(changed, undefined)).toBe(true);
    expect(isDraftDirty({ ...changed, theme: undefined }, undefined)).toBe(
      false,
    );
  });
});

describe("getDraftIssues", () => {
  const ok = {
    id: "00000000-0000-4000-8c0d-000000000001",
    url: "https://example.test/1.webp",
    alt: "Une image",
    decorative: false,
  };
  const missing = {
    ...ok,
    id: "00000000-0000-4000-8c0d-000000000002",
    alt: " ",
  };

  it("ne signale rien quand tout est decrit ou decoratif", () => {
    const issues = getDraftIssues({
      sections: [...DEFAULT_SECTIONS],
      gallery: [ok, { ...missing, decorative: true }],
    });
    expect(issues.count).toBe(0);
    expect(issues.gallery).toEqual({});
    expect(issues.banner).toBeUndefined();
  });

  it("signale la banniere et les images de galerie sans texte alternatif", () => {
    const issues = getDraftIssues({
      sections: [...DEFAULT_SECTIONS],
      banner: { ...ok, alt: "", focal: { x: 50, y: 50 } },
      gallery: [ok, missing],
    });
    expect(issues.count).toBe(2);
    expect(issues.banner).toBe(ALT_REQUIRED_MESSAGE);
    expect(Object.keys(issues.gallery)).toEqual([missing.id]);
  });

  it("nomme les images a corriger dans l'ordre de la page, avec l'id de leur champ", () => {
    const issues = getDraftIssues({
      sections: [...DEFAULT_SECTIONS],
      banner: { ...ok, alt: "", focal: { x: 50, y: 50 } },
      gallery: [
        ok,
        missing,
        { ...missing, id: "00000000-0000-4000-8c0d-000000000003" },
      ],
    });
    expect(issues.items.map((item) => item.label)).toEqual([
      "Bannière",
      "Image 2",
      "Image 3",
    ]);
    expect(issues.items.map((item) => item.inputId)).toEqual([
      altInputId("banner"),
      altInputId(missing.id),
      altInputId("00000000-0000-4000-8c0d-000000000003"),
    ]);
    expect(issues.count).toBe(3);
  });

  it("ignore les images decoratives meme sans aucun texte", () => {
    const issues = getDraftIssues({
      sections: [...DEFAULT_SECTIONS],
      gallery: [{ ...missing, decorative: true }],
    });
    expect(issues.items).toEqual([]);
  });
});

describe("altInputId", () => {
  it("est stable et distinct entre la banniere et chaque image", () => {
    expect(altInputId("banner")).toBe("customize-alt-banner");
    expect(altInputId("abc")).toBe("customize-alt-abc");
    expect(altInputId("abc")).not.toBe(altInputId("banner"));
  });
});

describe("toCardPreview", () => {
  const PROJECT: Project = {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "fresque",
    title: "Fresque murale",
    tagline: "Peindre le mur ensemble.",
    tags: ["art"],
    needs: [],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: "00000000-0000-4000-8000-0000000000a1",
    highfiveCount: 4,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
    lastActivityAt: "2026-09-01T10:00:00.000Z",
  };
  const BANNER = {
    id: "00000000-0000-4000-8c0d-000000000001",
    url: "https://example.test/banner.webp",
    alt: "Un mur peint",
    decorative: false,
    focal: { x: 10, y: 90 },
  };

  function member(n: number, role: TeamMember["role"]): TeamMember {
    const id = `00000000-0000-4000-8000-0000000000a${n}`;
    return {
      projectId: PROJECT.id,
      userId: id,
      role,
      joinedAt: "2026-09-01T10:00:00.000Z",
      blocked: false,
      user: {
        id,
        username: `user${n}`,
        displayName: `User ${n}`,
        avatar: `https://example.test/${n}.webp`,
      },
    };
  }

  it("reprend l'accent du theme et la banniere du brouillon, pas ceux du projet enregistre", () => {
    const saved: Project = {
      ...PROJECT,
      customization: {
        theme: presetTheme("ocean"),
        sections: [...DEFAULT_SECTIONS],
        gallery: [],
      },
    };
    const draft: ProjectCustomization = {
      theme: presetTheme("bonbon"),
      banner: BANNER,
      sections: [...DEFAULT_SECTIONS],
      gallery: [],
    };
    const preview = toCardPreview(saved, [member(1, "owner")], draft);
    expect(preview?.accent).toBe(presetTheme("bonbon").accent);
    expect(preview?.banner).toEqual(BANNER);
    expect(
      toCardPreview(saved, [member(1, "owner")], toDraft(undefined)),
    ).toMatchObject({ accent: undefined, banner: undefined });
  });

  it("met le porteur en tete de l'equipe (6 au plus) et compte tous les membres", () => {
    const members = [
      member(2, "member"),
      member(3, "member"),
      member(1, "owner"),
      ...[4, 5, 6, 7, 8].map((n) => member(n, "member")),
    ];
    const preview = toCardPreview(PROJECT, members, toDraft(undefined));
    expect(preview?.owner.username).toBe("user1");
    expect(preview?.teamPreview).toHaveLength(6);
    expect(preview?.teamPreview[0].username).toBe("user1");
    expect(preview?.membersCount).toBe(8);
  });

  it("copie les champs de la carte depuis le projet", () => {
    const preview = toCardPreview(
      PROJECT,
      [member(1, "owner")],
      toDraft(undefined),
    );
    expect(preview).toMatchObject({
      id: PROJECT.id,
      slug: "fresque",
      title: "Fresque murale",
      tagline: "Peindre le mur ensemble.",
      highfiveCount: 4,
      state: "active",
    });
  });

  it("pas d'apercu tant que le porteur n'est pas dans l'equipe", () => {
    expect(toCardPreview(PROJECT, [], toDraft(undefined))).toBeNull();
    expect(
      toCardPreview(PROJECT, [member(2, "member")], toDraft(undefined)),
    ).toBeNull();
  });
});
