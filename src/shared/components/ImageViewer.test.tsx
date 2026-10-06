// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImageViewer, type ViewerImage } from "./ImageViewer";

const IMAGES: ViewerImage[] = [
  { url: "https://example.test/1.webp", alt: "Image 1" },
  { url: "https://example.test/2.webp", alt: "Image 2" },
  { url: "https://example.test/3.webp", alt: "Image 3" },
];

beforeEach(() => {
  // jsdom ne fait aucune mise en page : on fixe la taille de la zone d'image
  // pour que les limites de deplacement soient calculables.
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => 400,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get: () => 200,
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete (HTMLElement.prototype as unknown as Record<string, unknown>)
    .clientWidth;
  delete (HTMLElement.prototype as unknown as Record<string, unknown>)
    .clientHeight;
});

function Harness({
  images = IMAGES,
  start = 0,
}: {
  images?: ViewerImage[];
  start?: number;
}) {
  const [index, setIndex] = useState<number | null>(start);
  return (
    <>
      <button type="button" onClick={() => setIndex(0)}>
        Ouvrir
      </button>
      <ImageViewer
        images={images}
        index={index}
        title="Visionneuse de test"
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
      />
    </>
  );
}

const image = () =>
  screen.getByRole("dialog").querySelector("img") as HTMLImageElement;
const counter = () => screen.getByText(/Image \d sur \d/).textContent;
const zoomLabel = () => screen.getByText(/^Zoom \d+ %$/).textContent;
const viewport = () => screen.getByRole("group", { name: "Image agrandie" });
const pan = () => ({
  x: image().style.getPropertyValue("--pan-x"),
  y: image().style.getPropertyValue("--pan-y"),
});

describe("ImageViewer", () => {
  it("n'affiche rien tant que l'index est nul, et nomme le dialogue pour les lecteurs d'ecran", () => {
    const { unmount } = render(<Harness start={0} />);
    expect(
      screen.getByRole("dialog", { name: "Visionneuse de test" }),
    ).toBeTruthy();
    unmount();
    cleanup();
    function Closed() {
      return (
        <ImageViewer
          images={IMAGES}
          index={null}
          title="t"
          onIndexChange={() => {}}
          onClose={() => {}}
        />
      );
    }
    render(<Closed />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("n'est pas anime", () => {
    render(<Harness />);
    expect(screen.getByRole("dialog").className).toContain("transition-none");
  });

  it("demarre a 100 % sans zoom", () => {
    render(<Harness />);
    expect(zoomLabel()).toBe("Zoom 100 %");
    expect(image().style.getPropertyValue("--zoom")).toBe("1");
  });

  describe("zoom", () => {
    it("zoome et dezoome avec les boutons par pas de 50 %", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(screen.getByRole("button", { name: "Zoom avant" }));
      expect(zoomLabel()).toBe("Zoom 150 %");
      await user.click(screen.getByRole("button", { name: "Zoom avant" }));
      expect(zoomLabel()).toBe("Zoom 200 %");
      await user.click(screen.getByRole("button", { name: "Zoom arrière" }));
      expect(zoomLabel()).toBe("Zoom 150 %");
    });

    it("plafonne a 500 % et ne descend pas sous 100 %", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      const zoomIn = screen.getByRole("button", { name: "Zoom avant" });
      for (let i = 0; i < 12; i += 1) await user.click(zoomIn);
      expect(zoomLabel()).toBe("Zoom 500 %");
      expect(
        zoomIn.getAttribute("aria-disabled") ?? zoomIn.getAttribute("disabled"),
      ).not.toBeNull();
      const zoomOut = screen.getByRole("button", { name: "Zoom arrière" });
      for (let i = 0; i < 12; i += 1) await user.click(zoomOut);
      expect(zoomLabel()).toBe("Zoom 100 %");
    });

    it("se pilote au clavier : + - et 0", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.keyboard("+");
      await user.keyboard("+");
      expect(zoomLabel()).toBe("Zoom 200 %");
      await user.keyboard("-");
      expect(zoomLabel()).toBe("Zoom 150 %");
      await user.keyboard("0");
      expect(zoomLabel()).toBe("Zoom 100 %");
    });

    it("revient a 100 % avec le bouton Ajuster", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.keyboard("++++");
      await user.click(
        screen.getByRole("button", { name: "Ajuster à la fenêtre" }),
      );
      expect(zoomLabel()).toBe("Zoom 100 %");
    });

    it("zoome a la molette sans faire defiler la page", () => {
      render(<Harness />);
      const wheel = (deltaY: number) => {
        const event = new WheelEvent("wheel", {
          deltaY,
          bubbles: true,
          cancelable: true,
        });
        act(() => {
          viewport().dispatchEvent(event);
        });
        return event;
      };
      expect(wheel(-100).defaultPrevented).toBe(true);
      expect(zoomLabel()).toBe("Zoom 150 %");
      wheel(100);
      expect(zoomLabel()).toBe("Zoom 100 %");
    });

    it("un clic sur l'image zoome (curseur loupe), un second dezoome", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      expect(viewport().className).toContain("cursor-zoom-in");
      await user.click(viewport());
      expect(zoomLabel()).toBe("Zoom 200 %");
      expect(viewport().className).toContain("cursor-zoom-out");
      await user.click(viewport());
      expect(zoomLabel()).toBe("Zoom 100 %");
      expect(viewport().className).toContain("cursor-zoom-in");
    });

    it("garde le point clique sous le curseur en zoomant", () => {
      render(<Harness />);
      // Zone d'image de 400 x 200 a l'origine : le centre est en (200, 100).
      vi.spyOn(viewport(), "getBoundingClientRect").mockReturnValue({
        left: 0,
        top: 0,
        width: 400,
        height: 200,
        right: 400,
        bottom: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      // Clic a 100 px a droite et 50 px en dessous du centre : l'image se decale
      // de l'oppose (x1 de surplus) pour garder ce point en place.
      fireEvent.click(viewport(), { clientX: 300, clientY: 150 });
      expect(zoomLabel()).toBe("Zoom 200 %");
      expect(pan()).toEqual({ x: "-100px", y: "-50px" });
    });

    it("un glisser ne declenche pas de zoom, mais un clic simple apres oui", () => {
      render(<Harness />);
      fireEvent.keyDown(document, { key: "+" });
      fireEvent.keyDown(document, { key: "+" });
      expect(zoomLabel()).toBe("Zoom 200 %");
      fireEvent.pointerDown(viewport(), {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
      });
      fireEvent.pointerMove(viewport(), {
        clientX: 160,
        clientY: 100,
        pointerId: 1,
      });
      fireEvent.pointerUp(viewport(), { pointerId: 1 });
      fireEvent.click(viewport(), { clientX: 160, clientY: 100 });
      expect(zoomLabel()).toBe("Zoom 200 %");
      expect(pan().x).toBe("60px");

      fireEvent.pointerDown(viewport(), {
        clientX: 160,
        clientY: 100,
        pointerId: 1,
      });
      fireEvent.pointerUp(viewport(), { pointerId: 1 });
      fireEvent.click(viewport(), { clientX: 160, clientY: 100 });
      expect(zoomLabel()).toBe("Zoom 100 %");
    });

    it("cliquer sur les boutons precedent/suivant ne zoome pas l'image", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(screen.getByRole("button", { name: "Image suivante" }));
      expect(counter()).toBe("Image 2 sur 3");
      expect(zoomLabel()).toBe("Zoom 100 %");
    });
  });

  describe("deplacement de l'image zoomee", () => {
    it("les fleches deplacent l'image quand elle est zoomee, sans changer d'image", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.keyboard("++");
      expect(zoomLabel()).toBe("Zoom 200 %");
      await user.keyboard("{ArrowLeft}");
      expect(counter()).toBe("Image 1 sur 3");
      expect(pan().x).toBe("60px");
      await user.keyboard("{ArrowDown}");
      expect(pan().y).toBe("-60px");
    });

    it("borne le deplacement a la moitie du surplus de l'image zoomee", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.keyboard("++"); // 200 % : surplus 400 px de large, soit +/-200 px
      for (let i = 0; i < 10; i += 1) await user.keyboard("{ArrowLeft}");
      expect(pan().x).toBe("200px");
      for (let i = 0; i < 20; i += 1) await user.keyboard("{ArrowRight}");
      expect(pan().x).toBe("-200px");
      for (let i = 0; i < 10; i += 1) await user.keyboard("{ArrowUp}");
      expect(pan().y).toBe("100px");
    });

    it("recadre le deplacement quand on dezoome", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.keyboard("++++"); // 300 %
      for (let i = 0; i < 20; i += 1) await user.keyboard("{ArrowLeft}");
      expect(pan().x).toBe("400px");
      await user.keyboard("--");
      expect(zoomLabel()).toBe("Zoom 200 %");
      expect(pan().x).toBe("200px");
      await user.keyboard("0");
      expect(pan().x).toBe("0px");
    });

    it("se deplace en glissant, borne, et seulement quand l'image est zoomee", () => {
      render(<Harness />);
      fireEvent.pointerDown(viewport(), {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
      });
      fireEvent.pointerMove(viewport(), {
        clientX: 150,
        clientY: 100,
        pointerId: 1,
      });
      expect(pan().x).toBe("0px");

      fireEvent.keyDown(document, { key: "+" });
      fireEvent.keyDown(document, { key: "+" });
      fireEvent.pointerDown(viewport(), {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
      });
      fireEvent.pointerMove(viewport(), {
        clientX: 130,
        clientY: 80,
        pointerId: 1,
      });
      expect(pan()).toEqual({ x: "30px", y: "-20px" });
      fireEvent.pointerMove(viewport(), {
        clientX: 900,
        clientY: 900,
        pointerId: 1,
      });
      expect(pan()).toEqual({ x: "200px", y: "100px" });
      fireEvent.pointerUp(viewport(), { pointerId: 1 });
      fireEvent.pointerMove(viewport(), {
        clientX: 0,
        clientY: 0,
        pointerId: 1,
      });
      expect(pan()).toEqual({ x: "200px", y: "100px" });
    });
  });

  describe("navigation", () => {
    it("les fleches changent d'image a 100 %, en boucle", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.keyboard("{ArrowRight}");
      expect(counter()).toBe("Image 2 sur 3");
      await user.keyboard("{ArrowLeft}{ArrowLeft}");
      expect(counter()).toBe("Image 3 sur 3");
    });

    it("les boutons changent d'image meme quand on est zoome, et remettent le zoom a 100 %", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.keyboard("+++");
      expect(zoomLabel()).toBe("Zoom 250 %");
      await user.click(screen.getByRole("button", { name: "Image suivante" }));
      expect(counter()).toBe("Image 2 sur 3");
      expect(zoomLabel()).toBe("Zoom 100 %");
      expect(pan()).toEqual({ x: "0px", y: "0px" });
    });

    it("rouvrir la visionneuse repart a 100 %", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.keyboard("++");
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).toBeNull();
      await user.click(screen.getByRole("button", { name: "Ouvrir" }));
      expect(zoomLabel()).toBe("Zoom 100 %");
    });

    it("sans navigation pour une image unique : les fleches ne font rien", async () => {
      const user = userEvent.setup();
      render(<Harness images={[IMAGES[0]]} />);
      expect(
        screen.queryByRole("button", { name: "Image suivante" }),
      ).toBeNull();
      await user.keyboard("{ArrowRight}");
      expect(counter()).toBe("Image 1 sur 1");
    });
  });

  it("rend l'image avec son alt et affiche la legende", () => {
    render(
      <Harness images={[{ ...IMAGES[2], caption: "Une legende" }]} start={0} />,
    );
    expect(image().getAttribute("alt")).toBe("Image 3");
    expect(screen.getByText("Une legende")).toBeTruthy();
  });

  it("annonce le niveau de zoom aux lecteurs d'ecran et decrit les raccourcis", () => {
    render(<Harness />);
    expect(screen.getByText(/Zoom 100 %/).getAttribute("aria-live")).toBe(
      "polite",
    );
    expect(
      screen
        .getByRole("group", { name: "Image agrandie" })
        .getAttribute("aria-describedby"),
    ).toBeTruthy();
  });

  describe("plein ecran", () => {
    let fullscreenElement: Element | null = null;

    afterEach(() => {
      fullscreenElement = null;
      delete (document as unknown as Record<string, unknown>).fullscreenElement;
      delete (HTMLElement.prototype as unknown as Record<string, unknown>)
        .requestFullscreen;
      delete (document as unknown as Record<string, unknown>).exitFullscreen;
    });

    function mockFullscreenApi() {
      const request = vi.fn(async () => {
        fullscreenElement = screen.getByRole("dialog");
        document.dispatchEvent(new Event("fullscreenchange"));
      });
      const exit = vi.fn(async () => {
        fullscreenElement = null;
        document.dispatchEvent(new Event("fullscreenchange"));
      });
      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        get: () => fullscreenElement,
      });
      Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
        configurable: true,
        value: request,
      });
      Object.defineProperty(document, "exitFullscreen", {
        configurable: true,
        value: exit,
      });
      return { request, exit };
    }

    const popup = () => screen.getByRole("dialog");

    it("propose un bouton Plein ecran, desactive par defaut", () => {
      render(<Harness />);
      const button = screen.getByRole("button", { name: "Plein écran" });
      expect(button.getAttribute("aria-pressed")).toBe("false");
      expect(popup().getAttribute("data-expanded")).toBe("false");
    });

    it("sans API Fullscreen : agrandit la popup a toute la fenetre, puis la restaure", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(screen.getByRole("button", { name: "Plein écran" }));
      expect(popup().getAttribute("data-expanded")).toBe("true");
      expect(popup().className).toContain("w-screen");
      expect(popup().className).toContain("h-dvh");
      expect(popup().className).not.toContain("max-w-4xl");
      expect(image().className).toContain("h-full");
      const exit = screen.getByRole("button", {
        name: "Quitter le plein écran",
      });
      expect(exit.getAttribute("aria-pressed")).toBe("true");

      await user.click(exit);
      expect(popup().getAttribute("data-expanded")).toBe("false");
      expect(popup().className).toContain("max-w-4xl");
      expect(image().className).toContain("max-h-[70vh]");
    });

    it("avec l'API Fullscreen : la demande sur la popup et en sort a la fermeture du mode", async () => {
      const user = userEvent.setup();
      const { request, exit } = mockFullscreenApi();
      render(<Harness />);
      await user.click(screen.getByRole("button", { name: "Plein écran" }));
      expect(request).toHaveBeenCalledTimes(1);
      expect(request.mock.contexts[0]).toBe(popup());
      expect(popup().getAttribute("data-expanded")).toBe("true");

      await user.click(
        screen.getByRole("button", { name: "Quitter le plein écran" }),
      );
      expect(exit).toHaveBeenCalledTimes(1);
      expect(popup().getAttribute("data-expanded")).toBe("false");
    });

    it("suit le navigateur quand l'utilisateur quitte le plein ecran lui-meme (Echap)", async () => {
      const user = userEvent.setup();
      mockFullscreenApi();
      render(<Harness />);
      await user.click(screen.getByRole("button", { name: "Plein écran" }));
      expect(popup().getAttribute("data-expanded")).toBe("true");

      act(() => {
        fullscreenElement = null;
        document.dispatchEvent(new Event("fullscreenchange"));
      });
      expect(popup().getAttribute("data-expanded")).toBe("false");
      expect(screen.getByRole("dialog")).toBeTruthy();
    });

    it("se bascule aussi avec la touche F", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.keyboard("f");
      expect(popup().getAttribute("data-expanded")).toBe("true");
      await user.keyboard("F");
      expect(popup().getAttribute("data-expanded")).toBe("false");
    });

    it("garde le plein ecran en changeant d'image, mais pas le zoom", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.keyboard("f");
      await user.keyboard("++");
      await user.click(screen.getByRole("button", { name: "Image suivante" }));
      expect(counter()).toBe("Image 2 sur 3");
      expect(popup().getAttribute("data-expanded")).toBe("true");
      expect(zoomLabel()).toBe("Zoom 100 %");
    });

    it("sort du plein ecran en fermant la visionneuse, et rouvre en mode normal", async () => {
      const user = userEvent.setup();
      const { exit } = mockFullscreenApi();
      render(<Harness />);
      await user.keyboard("f");
      expect(popup().getAttribute("data-expanded")).toBe("true");
      // Echap ferme la popup quand le navigateur ne le consomme pas deja.
      fullscreenElement = null;
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).toBeNull();
      await user.click(screen.getByRole("button", { name: "Ouvrir" }));
      expect(popup().getAttribute("data-expanded")).toBe("false");
      expect(exit).not.toHaveBeenCalled();
    });
  });
});
