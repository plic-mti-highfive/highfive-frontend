// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import type { ProjectBanner, ProjectSummary } from "@/domain";
import { ProjectCard } from "./ProjectCard";

afterEach(cleanup);

const BANNER: ProjectBanner = {
  id: "00000000-0000-4000-8c0d-000000000001",
  url: "https://example.test/banner.webp",
  alt: "Un mur peint",
  focal: { x: 20, y: 80 },
};

const PROJECT: ProjectSummary = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "fresque",
  title: "Fresque murale",
  tagline: "Peindre le mur de l'école ensemble.",
  tags: ["art"],
  needs: [],
  visibility: "public",
  participation: "open",
  state: "active",
  highfiveCount: 3,
  membersCount: 1,
  teamPreview: [],
  owner: {
    id: "00000000-0000-4000-8000-000000000002",
    username: "alex",
    displayName: "Alex",
    avatar: "https://example.test/alex.webp",
  },
};

function renderCard(
  project: ProjectSummary,
  variant?: "card" | "hero" | "list" | "top",
) {
  return render(
    <MemoryRouter>
      <ProjectCard project={project} variant={variant} rank={1} />
    </MemoryRouter>,
  );
}

function cover(container: HTMLElement, url = BANNER.url) {
  return container.querySelector<HTMLImageElement>(`img[src="${url}"]`);
}

/** Les avatars sont aussi des `<img>` (avec un `alt`) : la bannière est la seule `alt=""`. */
function decorativeImages(container: HTMLElement) {
  return container.querySelectorAll('img[alt=""]');
}

describe("ProjectCard — bannière", () => {
  it("variante card : affiche la bannière, décorative, recadrée sur le point focal", () => {
    const { container } = renderCard({ ...PROJECT, banner: BANNER }, "card");
    const image = cover(container);
    expect(image).not.toBeNull();
    expect(image?.getAttribute("alt")).toBe("");
    expect(image?.style.getPropertyValue("--focal")).toBe("20% 80%");
    expect(image?.getAttribute("loading")).toBe("lazy");
    expect(image?.parentElement?.getAttribute("aria-hidden")).toBe("true");
  });

  it("variante card sans bannière : aucune image", () => {
    const { container } = renderCard(PROJECT, "card");
    expect(decorativeImages(container)).toHaveLength(0);
  });

  it("variante hero : la bannière remplace le motif et se charge sans attendre", () => {
    const withBanner = renderCard({ ...PROJECT, banner: BANNER }, "hero");
    const image = cover(withBanner.container);
    expect(image?.getAttribute("loading")).toBe("eager");
    expect(image?.getAttribute("fetchpriority")).toBe("high");
    // Le panneau à motif n'est plus rendu : la bannière est le seul bloc décoratif.
    expect(
      withBanner.container.querySelector("div[style*='background-image']"),
    ).toBeNull();
    cleanup();

    const withoutBanner = renderCard(PROJECT, "hero");
    expect(decorativeImages(withoutBanner.container)).toHaveLength(0);
    expect(
      withoutBanner.container.querySelector("div[style*='background-image']"),
    ).not.toBeNull();
  });

  it.each(["list", "top"] as const)(
    "variante %s : jamais d'image",
    (variant) => {
      const { container } = renderCard({ ...PROJECT, banner: BANNER }, variant);
      expect(decorativeImages(container)).toHaveLength(0);
    },
  );

  it("image en erreur : la carte retombe sur le rendu sans image", () => {
    const { container } = renderCard({ ...PROJECT, banner: BANNER }, "card");
    fireEvent.error(cover(container)!);
    expect(decorativeImages(container)).toHaveLength(0);
    expect(screen.getByText("Fresque murale")).toBeTruthy();
  });

  it("une nouvelle URL retente le chargement après une erreur", () => {
    const { container, rerender } = renderCard(
      { ...PROJECT, banner: BANNER },
      "card",
    );
    fireEvent.error(cover(container)!);
    expect(decorativeImages(container)).toHaveLength(0);

    const next = { ...BANNER, url: "https://example.test/autre.webp" };
    rerender(
      <MemoryRouter>
        <ProjectCard project={{ ...PROJECT, banner: next }} />
      </MemoryRouter>,
    );
    expect(cover(container, next.url)).not.toBeNull();
  });

  it("un seul lien, nommé par le titre du projet", () => {
    renderCard({ ...PROJECT, banner: BANNER }, "card");
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("aria-label")).toBe("Fresque murale");
    expect(links[0].getAttribute("href")).toBe("/projets/fresque");
  });
});
