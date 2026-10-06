// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import type { GalleryItem } from "@/domain";
import { ProjectGallery } from "./ProjectGallery";

afterEach(cleanup);

function item(n: number, overrides: Partial<GalleryItem> = {}): GalleryItem {
  return {
    id: `00000000-0000-4000-8c0d-${String(n).padStart(12, "0")}`,
    url: `https://example.test/${n}.webp`,
    alt: `Image ${n}`,
    ...overrides,
  };
}

const GALLERY = [item(1, { caption: "Premier jet" }), item(2), item(3)];

function setup(gallery = GALLERY) {
  const user = userEvent.setup();
  render(<ProjectGallery gallery={gallery} projectTitle="Fresque" />);
  return user;
}

describe("ProjectGallery", () => {
  it("ne rend rien si la galerie est vide", () => {
    const { container } = render(
      <ProjectGallery gallery={[]} projectTitle="Fresque" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("rend une vignette-bouton par image avec un nom accessible", () => {
    setup();
    expect(
      screen.getByRole("button", { name: "Agrandir l'image : Premier jet" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Agrandir l'image : Image 2" }),
    ).toBeTruthy();
    // Decorative sans legende : repli sur la position.
    expect(
      screen.getByRole("button", { name: "Agrandir l'image : Image 3" }),
    ).toBeTruthy();
  });

  it("ouvre la visionneuse sur l'image cliquee avec un compteur", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /Image 2/ }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Image 2 sur 3")).toBeTruthy();
  });

  it("navigue aux fleches et boucle aux extremites", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /Premier jet/ }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Image 2 sur 3")).toBeTruthy();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByText("Image 3 sur 3")).toBeTruthy();
  });

  it("navigue avec les boutons precedent/suivant", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /Image 2/ }));
    await user.click(screen.getByRole("button", { name: "Image suivante" }));
    expect(screen.getByText("Image 3 sur 3")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Image précédente" }));
    expect(screen.getByText("Image 2 sur 3")).toBeTruthy();
  });

  it("ferme avec Echap et restitue le focus a la vignette", async () => {
    const user = setup();
    const trigger = screen.getByRole("button", { name: /Image 2/ });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("ferme avec le bouton Fermer (un seul, celui du dialogue)", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /Image 2/ }));
    expect(screen.getAllByRole("button", { name: "Fermer" })).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("centre les boutons de navigation sans translate (le style bouton en applique un au clic)", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /Image 2/ }));
    for (const name of ["Image précédente", "Image suivante"]) {
      const button = screen.getByRole("button", { name });
      // Aucun translate "de base" : celui de l'etat `active:` du style bouton
      // l'ecraserait et le ferait sauter au clic.
      const tokens = button.className.split(/\s+/);
      expect(tokens.some((token) => /^-?translate-/.test(token))).toBe(false);
      expect(button.className).toContain("my-auto");
    }
  });

  it("n'anime pas l'ouverture de la visionneuse", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /Image 2/ }));
    expect(screen.getByRole("dialog").className).toContain("transition-none");
  });

  it("n'affiche pas de navigation pour une image unique", async () => {
    const user = setup([item(1)]);
    await user.click(screen.getByRole("button", { name: /Image 1/ }));
    expect(screen.queryByRole("button", { name: "Image suivante" })).toBeNull();
  });
});
