// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MAX_GALLERY_IMAGES, type GalleryItem } from "@/domain";
import { ImageError } from "../../lib/imageCompression";
import { GalleryEditor } from "./GalleryEditor";

afterEach(cleanup);

function item(n: number, overrides: Partial<GalleryItem> = {}): GalleryItem {
  return {
    id: `00000000-0000-4000-8c0d-${String(n).padStart(12, "0")}`,
    url: `https://example.test/${n}.webp`,
    alt: `Image ${n}`,
    ...overrides,
  };
}

function makeUpload() {
  return vi.fn(async (file: File, maxWidth: number) => ({
    id: `00000000-0000-4000-8c0d-${String(100 + file.name.length).padStart(12, "0")}`,
    url: `https://example.test/${file.name}?w=${maxWidth}`,
  }));
}

function setup({
  initial = [item(1), item(2), item(3)],
  issues = {},
  onUpload = makeUpload(),
}: {
  initial?: GalleryItem[];
  issues?: Record<string, string>;
  onUpload?: ReturnType<typeof makeUpload>;
} = {}) {
  const onDiscardImage = vi.fn();
  function Harness() {
    const [gallery, setGallery] = useState(initial);
    return (
      <>
        <GalleryEditor
          gallery={gallery}
          issues={issues}
          onChange={setGallery}
          onUpload={onUpload}
          onDiscardImage={onDiscardImage}
        />
        <div data-testid="alts">
          {gallery.map((g) => g.alt || "(vide)").join("|")}
        </div>
      </>
    );
  }
  const view = render(<Harness />);
  const input = view.container.querySelector(
    "input[type=file]",
  ) as HTMLInputElement;
  return { user: userEvent.setup(), onUpload, onDiscardImage, input };
}

const alts = () => screen.getByTestId("alts").textContent;
const png = (name: string) =>
  new File([new Uint8Array(8)], name, { type: "image/png" });

describe("GalleryEditor", () => {
  it("affiche le compteur et les champs de chaque image", () => {
    setup();
    expect(screen.getByText(/3 \/ 8 images/)).toBeTruthy();
    expect(screen.getAllByLabelText(/Texte alternatif/)).toHaveLength(3);
    expect(screen.getAllByLabelText(/Légende/)).toHaveLength(3);
  });

  it("reordonne avec les boutons et annonce le deplacement", async () => {
    const { user } = setup();
    await user.click(
      screen.getByRole("button", { name: "Descendre l'image 1" }),
    );
    expect(alts()).toBe("Image 2|Image 1|Image 3");
    expect(
      screen.getByText("Image 1 déplacée en position 2 sur 3."),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Monter l'image 3" }));
    expect(alts()).toBe("Image 2|Image 3|Image 1");
  });

  it("ne deplace pas les images aux extremites", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Monter l'image 1" }));
    await user.click(
      screen.getByRole("button", { name: "Descendre l'image 3" }),
    );
    expect(alts()).toBe("Image 1|Image 2|Image 3");
  });

  it("ajoute des images televersees avec un alt vide a completer", async () => {
    const { user, input, onUpload } = setup({ initial: [] });
    await user.upload(input, [png("a.png"), png("bb.png")]);
    expect(onUpload).toHaveBeenCalledTimes(2);
    expect(onUpload.mock.calls[0][1]).toBe(1200);
    expect(alts()).toBe("(vide)|(vide)");
  });

  it("limite la galerie a 8 images : ajout desactive et message", () => {
    const full = Array.from({ length: MAX_GALLERY_IMAGES }, (_, i) =>
      item(i + 1),
    );
    setup({ initial: full });
    expect(
      (
        screen.getByRole("button", {
          name: "Ajouter des images",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.getByText(/La galerie est pleine/)).toBeTruthy();
  });

  it("ignore les images en trop et le signale", async () => {
    const seven = Array.from({ length: 7 }, (_, i) => item(i + 1));
    const { user, input } = setup({ initial: seven });
    await user.upload(input, [png("a.png"), png("bb.png"), png("ccc.png")]);
    expect(screen.getByText(/2 image\(s\) ignorée\(s\)/)).toBeTruthy();
    expect(screen.getAllByLabelText(/Texte alternatif/)).toHaveLength(8);
  });

  it("affiche l'erreur d'une image refusee sans bloquer les autres", async () => {
    const onUpload = vi.fn(async (file: File, maxWidth: number) => {
      if (file.name === "mauvais.png") throw new ImageError("Format refuse.");
      return {
        id: "00000000-0000-4000-8c0d-0000000000aa",
        url: `https://example.test/ok.webp?w=${maxWidth}`,
      };
    });
    const { user, input } = setup({ initial: [], onUpload });
    await user.upload(input, [png("mauvais.png"), png("bon.png")]);
    expect(screen.getByRole("alert").textContent).toContain(
      "mauvais.png : Format refuse.",
    );
    expect(alts()).toBe("(vide)");
  });

  it("affiche l'erreur de texte alternatif d'une image et marque le champ invalide", () => {
    const first = item(1, { alt: "" });
    setup({
      initial: [first, item(2)],
      issues: { [first.id]: "Décris l'image pour continuer." },
    });
    expect(screen.getByRole("alert").textContent).toContain("Décris l'image");
    const fields = screen.getAllByLabelText(/Texte alternatif/);
    expect(fields[0].getAttribute("aria-invalid")).toBe("true");
    expect(fields[1].getAttribute("aria-invalid")).toBe("false");
  });

  it("supprime une image et previent le parent pour nettoyage", async () => {
    const { user, onDiscardImage } = setup();
    await user.click(
      screen.getByRole("button", { name: "Supprimer l'image 2" }),
    );
    expect(alts()).toBe("Image 1|Image 3");
    expect(onDiscardImage).toHaveBeenCalledWith(item(2).id);
  });

  it("modifie l'alt et la legende", async () => {
    const { user } = setup({ initial: [item(1, { alt: "" })] });
    await user.type(screen.getByLabelText(/Texte alternatif/), "Un mur");
    expect(alts()).toBe("Un mur");
    await user.type(screen.getByLabelText(/Légende/), "Premier jet");
    expect((screen.getByLabelText(/Légende/) as HTMLInputElement).value).toBe(
      "Premier jet",
    );
  });

  it("agrandit une vignette dans la visionneuse, a la bonne image, et permet de parcourir la galerie", async () => {
    const { user } = setup();
    await user.click(
      screen.getByRole("button", { name: "Agrandir l'image 2" }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Aperçu des images de la galerie",
    });
    expect(dialog.querySelector("img")?.getAttribute("alt")).toBe("Image 2");
    expect(screen.getByText("Image 2 sur 3")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Image suivante" }));
    expect(screen.getByText("Image 3 sur 3")).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("marque le texte alternatif de chaque image comme obligatoire, sans case pour s'en dispenser", () => {
    setup({ initial: [item(1, { alt: "" }), item(2, { alt: "" })] });
    const fields = screen.getAllByLabelText(
      /Texte alternatif/,
    ) as HTMLInputElement[];
    for (const field of fields) {
      expect(field.getAttribute("aria-required")).toBe("true");
      expect(field.disabled).toBe(false);
    }
    expect(screen.getAllByText("*")).toHaveLength(2);
    expect(fields[0].id).toBe(`customize-alt-${item(1).id}`);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
});
