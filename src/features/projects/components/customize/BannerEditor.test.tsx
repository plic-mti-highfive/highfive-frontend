// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProjectBanner } from "@/domain";
import { ImageError } from "../../lib/imageCompression";
import { BannerEditor } from "./BannerEditor";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const BANNER: ProjectBanner = {
  id: "00000000-0000-4000-8c0d-000000000001",
  url: "https://example.test/banner.webp",
  alt: "Un mur peint",
  decorative: false,
  focal: { x: 50, y: 50 },
};
const UPLOADED = {
  id: "00000000-0000-4000-8c0d-000000000002",
  url: "https://example.test/new.webp",
};

function setup({
  initial,
  error,
  onUpload = vi.fn(async () => UPLOADED),
}: {
  initial?: ProjectBanner;
  error?: string;
  onUpload?: (file: File, maxWidth: number) => Promise<typeof UPLOADED>;
} = {}) {
  const onDiscardImage = vi.fn();
  function Harness() {
    const [banner, setBanner] = useState<ProjectBanner | undefined>(initial);
    return (
      <>
        <BannerEditor
          banner={banner}
          error={error}
          onChange={setBanner}
          onUpload={onUpload}
          onDiscardImage={onDiscardImage}
        />
        <div data-testid="state">{JSON.stringify(banner ?? null)}</div>
      </>
    );
  }
  const view = render(<Harness />);
  const state = () =>
    JSON.parse(
      screen.getByTestId("state").textContent ?? "null",
    ) as ProjectBanner | null;
  const input = () =>
    view.container.querySelector("input[type=file]") as HTMLInputElement;
  return {
    user: userEvent.setup(),
    onUpload,
    onDiscardImage,
    state,
    input,
    view,
  };
}

const png = new File([new Uint8Array(8)], "b.png", { type: "image/png" });

describe("BannerEditor", () => {
  it("sans banniere : propose d'en ajouter une, sans champs", () => {
    setup();
    expect(
      screen.getByRole("button", { name: "Ajouter une bannière" }),
    ).toBeTruthy();
    expect(screen.queryByLabelText(/Texte alternatif/)).toBeNull();
  });

  it("ajoute une banniere : point focal au centre, alt vide a completer", async () => {
    const { user, input, onUpload, state } = setup();
    await user.upload(input(), png);
    expect(onUpload).toHaveBeenCalledWith(expect.any(File), 1600);
    expect(state()).toEqual({
      id: UPLOADED.id,
      url: UPLOADED.url,
      alt: "",
      decorative: false,
      focal: { x: 50, y: 50 },
    });
  });

  it("remplace l'image en gardant le point focal et en liberant l'ancienne", async () => {
    const { user, input, onDiscardImage, state } = setup({
      initial: { ...BANNER, focal: { x: 20, y: 70 } },
    });
    await user.upload(input(), png);
    expect(state()?.id).toBe(UPLOADED.id);
    expect(state()?.focal).toEqual({ x: 20, y: 70 });
    expect(onDiscardImage).toHaveBeenCalledWith(BANNER.id);
  });

  it("regle le point focal avec les curseurs (clavier)", () => {
    const { state } = setup({ initial: BANNER });
    fireEvent.change(screen.getByLabelText("Position horizontale"), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText("Position verticale"), {
      target: { value: "80" },
    });
    expect(state()?.focal).toEqual({ x: 30, y: 80 });
  });

  it("regle le point focal au clic sur l'image, borne a 0-100", () => {
    const { view, state } = setup({ initial: BANNER });
    const area = view.container.querySelector("img")!.parentElement!;
    vi.spyOn(area, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 50,
      width: 400,
      height: 200,
      right: 500,
      bottom: 250,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    });
    fireEvent.click(area, { clientX: 200, clientY: 100 });
    expect(state()?.focal).toEqual({ x: 25, y: 25 });
    fireEvent.click(area, { clientX: 900, clientY: -40 });
    expect(state()?.focal).toEqual({ x: 100, y: 0 });
  });

  it("modifie l'alt et le caractere decoratif", async () => {
    const { user, state } = setup({ initial: { ...BANNER, alt: "" } });
    await user.type(screen.getByLabelText(/Texte alternatif/), "Mur");
    expect(state()?.alt).toBe("Mur");
    await user.click(
      screen.getByRole("checkbox", { name: /Image décorative/ }),
    );
    expect(state()?.decorative).toBe(true);
  });

  it("affiche l'erreur d'alt et marque le champ invalide", () => {
    setup({ initial: { ...BANNER, alt: "" }, error: "Décris l'image." });
    expect(screen.getByRole("alert").textContent).toContain("Décris l'image.");
    expect(
      screen.getByLabelText(/Texte alternatif/).getAttribute("aria-invalid"),
    ).toBe("true");
  });

  it("retire la banniere et previent le parent", async () => {
    const { user, state, onDiscardImage } = setup({ initial: BANNER });
    await user.click(
      screen.getByRole("button", { name: "Retirer la bannière" }),
    );
    expect(state()).toBeNull();
    expect(onDiscardImage).toHaveBeenCalledWith(BANNER.id);
  });

  it("affiche l'erreur d'une image refusee et garde la banniere actuelle", async () => {
    const onUpload = vi.fn(async () => {
      throw new ImageError("Format non pris en charge.");
    });
    const { user, input, state } = setup({ initial: BANNER, onUpload });
    await user.upload(input(), png);
    expect(screen.getByRole("alert").textContent).toContain(
      "Format non pris en charge.",
    );
    expect(state()?.id).toBe(BANNER.id);
  });

  it("agrandit l'image dans la visionneuse sans deplacer le point focal", async () => {
    const user = userEvent.setup();
    const { state } = setup({
      initial: { ...BANNER, focal: { x: 10, y: 90 } },
    });
    await user.click(screen.getByRole("button", { name: "Agrandir l'image" }));
    const dialog = screen.getByRole("dialog", {
      name: "Aperçu de la bannière",
    });
    expect(dialog.querySelector("img")?.getAttribute("alt")).toBe(
      "Un mur peint",
    );
    expect(state()?.focal).toEqual({ x: 10, y: 90 });
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("marque le texte alternatif comme obligatoire (etoile et aria-required) sauf image decorative", async () => {
    const user = userEvent.setup();
    setup({ initial: { ...BANNER, alt: "" } });
    const field = screen.getByLabelText(/Texte alternatif/) as HTMLInputElement;
    expect(field.id).toBe("customize-alt-banner");
    expect(field.getAttribute("aria-required")).toBe("true");
    expect(field.disabled).toBe(false);
    expect(screen.getByText("*")).toBeTruthy();
    expect(screen.getByText(/Obligatoire\./)).toBeTruthy();

    await user.click(
      screen.getByRole("checkbox", { name: /Image décorative/ }),
    );
    expect(screen.queryByText("*")).toBeNull();
    expect(field.disabled).toBe(true);
    expect(field.getAttribute("aria-required")).toBe("false");
    expect(
      screen.getByText(/Image décorative : aucun texte alternatif/),
    ).toBeTruthy();
  });
});
