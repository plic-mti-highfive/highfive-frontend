// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import type { ProjectBanner as ProjectBannerData } from "@/domain";
import { ProjectBanner } from "./ProjectBanner";

afterEach(cleanup);

const banner: ProjectBannerData = {
  id: "00000000-0000-4000-8c0d-000000000001",
  url: "https://example.test/banner.webp",
  alt: "Un mur peint en rose",
  decorative: false,
  focal: { x: 20, y: 70 },
};

describe("ProjectBanner", () => {
  it("ne rend rien sans banniere (pas de bloc vide)", () => {
    const { container } = render(
      <ProjectBanner banner={undefined} projectTitle="Fresque" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("expose le texte alternatif de l'image", () => {
    const { getByRole } = render(
      <ProjectBanner banner={banner} projectTitle="Fresque" />,
    );
    expect(getByRole("img", { name: "Un mur peint en rose" })).toBeTruthy();
  });

  it("rend une image decorative avec un alt vide", () => {
    const { container, queryByRole } = render(
      <ProjectBanner
        banner={{ ...banner, decorative: true }}
        projectTitle="Fresque"
      />,
    );
    expect(queryByRole("img")).toBeNull();
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("transmet le point focal par une variable CSS", () => {
    const { container } = render(
      <ProjectBanner banner={banner} projectTitle="Fresque" />,
    );
    const image = container.querySelector("img") as HTMLImageElement;
    expect(image.style.getPropertyValue("--focal")).toBe("20% 70%");
  });

  it("s'ouvre en grand dans la visionneuse au clic, avec le nom de la banniere", async () => {
    const user = userEvent.setup();
    render(<ProjectBanner banner={banner} projectTitle="Fresque" />);
    await user.click(
      screen.getByRole("button", {
        name: "Agrandir la bannière : Un mur peint en rose",
      }),
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector("img")?.getAttribute("alt")).toBe(
      "Un mur peint en rose",
    );
    // Une seule image : ni navigation ni compteur de galerie a parcourir.
    expect(screen.queryByRole("button", { name: "Image suivante" })).toBeNull();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("l'agrandit aussi au clavier (Entree)", async () => {
    const user = userEvent.setup();
    render(<ProjectBanner banner={banner} projectTitle="Fresque" />);
    screen.getByRole("button", { name: /Agrandir la bannière/ }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("n'annonce pas de texte alternatif pour une banniere decorative", () => {
    render(
      <ProjectBanner
        banner={{ ...banner, decorative: true }}
        projectTitle="Fresque"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Agrandir la bannière" }),
    ).toBeTruthy();
  });
});
