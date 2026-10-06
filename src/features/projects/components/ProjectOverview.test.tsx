// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { presetTheme } from "@shared/lib/projectThemePresets";
import { projectSchema, type Project } from "@/domain";
import { ProjectOverview } from "./ProjectOverview";

const state = vi.hoisted(() => ({
  announcements: [] as { id: string; pinned: boolean; title: string }[],
}));

vi.mock("@/api/queries/announcements", () => ({
  useAnnouncements: () => ({ data: state.announcements }),
}));
vi.mock("./CommentsSection", () => ({
  CommentsSection: () => <section data-testid="comments">Commentaires</section>,
}));
vi.mock("./PinnedAnnouncementPreview", () => ({
  PinnedAnnouncementPreview: ({
    inheritAccent,
  }: {
    inheritAccent?: boolean;
  }) => (
    <section
      data-testid="pinned"
      data-inherit-accent={String(Boolean(inheritAccent))}
    >
      Épinglée
    </section>
  ),
}));
vi.mock("./ProjectOverviewSidebar", () => ({
  ProjectOverviewSidebar: () => <aside data-testid="sidebar" />,
}));

vi.mock("./NearbyProjects", () => ({
  NearbyProjects: () => <section data-testid="nearby" />,
}));

afterEach(() => {
  cleanup();
  state.announcements = [];
});

const BASE = {
  id: "00000000-0000-4000-8000-000000000100",
  slug: "projet-test",
  title: "Projet test",
  tagline: "Une accroche",
  description: "Une description avec un [lien](https://example.test).",
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

function project(customization?: unknown, needs: unknown[] = []): Project {
  return projectSchema.parse({ ...BASE, customization, needs });
}

const NEED = {
  id: "00000000-0000-4000-8000-000000000301",
  label: "des velos a preter",
  fulfilled: false,
};

function renderOverview(p: Project, preview = false) {
  return render(
    <ProjectOverview
      project={p}
      members={[]}
      canComment
      canModerateComments={false}
      preview={preview}
    />,
  );
}

/** Ordre d'apparition des blocs dans le DOM. */
function order(): string[] {
  const names: string[] = [];
  for (const element of document.querySelectorAll(
    "[data-testid=pinned], h2, [data-testid=comments]",
  )) {
    if (element instanceof HTMLElement && element.dataset.testid) {
      names.push(element.dataset.testid);
    } else {
      names.push(element.textContent ?? "");
    }
  }
  return names;
}

const IMAGE = {
  id: "00000000-0000-4000-8c0d-000000000001",
  url: "https://example.test/1.webp",
  alt: "Image 1",
  decorative: false,
};

describe("ProjectOverview", () => {
  it("sans personnalisation : ordre d'origine, pas de galerie, pas d'accent", () => {
    state.announcements = [{ id: "a1", pinned: true, title: "Annonce" }];
    renderOverview(project());
    expect(order()).toEqual(["pinned", "À propos", "comments"]);
    expect(screen.getByTestId("pinned").dataset.inheritAccent).toBe("false");
  });

  it("applique l'ordre choisi et masque les sections cachees", () => {
    state.announcements = [{ id: "a1", pinned: true, title: "Annonce" }];
    renderOverview(
      project({
        sections: [
          { id: "comments", visible: true },
          { id: "about", visible: true },
          { id: "pinned", visible: false },
          { id: "gallery", visible: true },
        ],
        gallery: [IMAGE],
      }),
    );
    expect(order()).toEqual(["comments", "À propos", "Galerie"]);
  });

  it("rend la galerie a sa place quand elle contient des images", () => {
    renderOverview(
      project({
        sections: [
          { id: "gallery", visible: true },
          { id: "about", visible: true },
          { id: "pinned", visible: true },
          { id: "comments", visible: true },
        ],
        gallery: [IMAGE],
      }),
    );
    expect(order()).toEqual(["Galerie", "À propos", "comments"]);
  });

  it("n'affiche pas la section galerie si elle est vide, meme visible", () => {
    renderOverview(project({ sections: DEFAULT, gallery: [] }));
    expect(order()).not.toContain("Galerie");
  });

  it("transmet le theme a l'annonce epinglee", () => {
    state.announcements = [{ id: "a1", pinned: true, title: "Annonce" }];
    renderOverview(
      project({
        sections: DEFAULT,
        gallery: [],
        theme: presetTheme("ocean"),
      }),
    );
    expect(screen.getByTestId("pinned").dataset.inheritAccent).toBe("true");
  });

  it("place les besoins apres l'annonce epinglee par defaut", () => {
    state.announcements = [{ id: "a1", pinned: true, title: "Annonce" }];
    renderOverview(project(undefined, [NEED]));
    expect(order()).toEqual(["pinned", "On recherche", "À propos", "comments"]);
    expect(screen.getByText("des velos a preter")).toBeTruthy();
  });

  it("place les besoins en tete sans annonce epinglee, et rien sans besoin", () => {
    renderOverview(project(undefined, [NEED]));
    expect(order()).toEqual(["On recherche", "À propos", "comments"]);
    cleanup();
    renderOverview(project());
    expect(order()).not.toContain("On recherche");
  });

  it("suit l'ordre et la visibilite choisis pour les besoins", () => {
    const sections = (needsVisible: boolean) => [
      { id: "about", visible: true },
      { id: "needs", visible: needsVisible },
      { id: "pinned", visible: false },
      { id: "gallery", visible: true },
      { id: "comments", visible: true },
    ];
    renderOverview(project({ sections: sections(true), gallery: [] }, [NEED]));
    expect(order()).toEqual(["À propos", "On recherche", "comments"]);
    cleanup();
    renderOverview(project({ sections: sections(false), gallery: [] }, [NEED]));
    expect(order()).toEqual(["À propos", "comments"]);
  });

  it("en apercu, remplace les commentaires par un bloc leger", () => {
    renderOverview(project(), true);
    expect(screen.queryByTestId("comments")).toBeNull();
    expect(screen.getByText("Les commentaires s'affichent ici.")).toBeTruthy();
  });
});

const DEFAULT = [
  { id: "pinned", visible: true },
  { id: "needs", visible: true },
  { id: "about", visible: true },
  { id: "gallery", visible: true },
  { id: "comments", visible: true },
];
