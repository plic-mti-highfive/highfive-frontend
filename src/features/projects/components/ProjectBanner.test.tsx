// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
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
    const { container } = render(<ProjectBanner banner={undefined} />);
    expect(container.innerHTML).toBe("");
  });

  it("expose le texte alternatif de l'image", () => {
    const { getByRole } = render(<ProjectBanner banner={banner} />);
    expect(getByRole("img", { name: "Un mur peint en rose" })).toBeTruthy();
  });

  it("rend une image decorative avec un alt vide", () => {
    const { container, queryByRole } = render(
      <ProjectBanner banner={{ ...banner, decorative: true }} />,
    );
    expect(queryByRole("img")).toBeNull();
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("transmet le point focal par une variable CSS", () => {
    const { container } = render(<ProjectBanner banner={banner} />);
    const image = container.querySelector("img") as HTMLImageElement;
    expect(image.style.getPropertyValue("--focal")).toBe("20% 70%");
  });
});
