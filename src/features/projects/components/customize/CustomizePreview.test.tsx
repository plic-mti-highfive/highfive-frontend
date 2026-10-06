// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TeamMember } from "@/api/memberships";
import {
  DEFAULT_SECTIONS,
  type Project,
  type ProjectBanner,
  type ProjectCustomization,
} from "@/domain";
import { CustomizePreview } from "./CustomizePreview";

// La fiche a ses propres tests : ici on ne verifie que l'apercu de la carte.
vi.mock("../ProjectFicheHeader", () => ({ ProjectFicheHeader: () => null }));
vi.mock("../ProjectOverview", () => ({ ProjectOverview: () => null }));

afterEach(cleanup);

const BANNER: ProjectBanner = {
  id: "00000000-0000-4000-8c0d-000000000001",
  url: "https://example.test/banner.webp",
  alt: "Un mur peint",
  decorative: false,
  focal: { x: 25, y: 75 },
};

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

const OWNER: TeamMember = {
  projectId: PROJECT.id,
  userId: "00000000-0000-4000-8000-0000000000a1",
  role: "owner",
  joinedAt: "2026-09-01T10:00:00.000Z",
  blocked: false,
  user: {
    id: "00000000-0000-4000-8000-0000000000a1",
    username: "alex",
    displayName: "Alex",
    avatar: "https://example.test/alex.webp",
  },
};

function draftWith(banner?: ProjectBanner): ProjectCustomization {
  return { banner, sections: [...DEFAULT_SECTIONS], gallery: [] };
}

function renderPreview(draft: ProjectCustomization, members = [OWNER]) {
  return render(
    <MemoryRouter>
      <CustomizePreview project={PROJECT} members={members} draft={draft} />
    </MemoryRouter>,
  );
}

function coverIn(container: HTMLElement) {
  return container.querySelector<HTMLImageElement>(`img[src="${BANNER.url}"]`);
}

describe("CustomizePreview — carte du projet", () => {
  it("montre la carte du projet avec la bannière du brouillon et son point focal", () => {
    const { container } = renderPreview(draftWith(BANNER));
    expect(screen.getByText("Carte du projet")).toBeTruthy();
    expect(screen.getByText("Fiche du projet")).toBeTruthy();
    expect(screen.getByText("Fresque murale")).toBeTruthy();
    expect(coverIn(container)?.style.getPropertyValue("--focal")).toBe(
      "25% 75%",
    );
  });

  it("suit le brouillon : le point focal change, la bannière retirée disparaît", () => {
    const { container, rerender } = renderPreview(draftWith(BANNER));
    const moved = { ...BANNER, focal: { x: 80, y: 10 } };
    rerender(
      <MemoryRouter>
        <CustomizePreview
          project={PROJECT}
          members={[OWNER]}
          draft={draftWith(moved)}
        />
      </MemoryRouter>,
    );
    expect(coverIn(container)?.style.getPropertyValue("--focal")).toBe(
      "80% 10%",
    );

    rerender(
      <MemoryRouter>
        <CustomizePreview
          project={PROJECT}
          members={[OWNER]}
          draft={draftWith(undefined)}
        />
      </MemoryRouter>,
    );
    expect(coverIn(container)).toBeNull();
    expect(screen.getByText("Fresque murale")).toBeTruthy();
  });

  it("pas de section carte tant que l'équipe n'est pas chargée", () => {
    renderPreview(draftWith(BANNER), []);
    expect(screen.queryByText("Carte du projet")).toBeNull();
    expect(screen.getByText("Fiche du projet")).toBeTruthy();
  });
});
