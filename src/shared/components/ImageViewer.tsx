import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Minus,
  Plus,
  ScanSearch,
} from "lucide-react";

import { cn } from "@shared/lib/cn";
import { Dialog, DialogPopup, DialogTitle, IconButton } from "@shared/ui";

/** Image affichable dans la visionneuse (une `GalleryItem` ou la banniere conviennent). */
export interface ViewerImage {
  url: string;
  alt: string;
  caption?: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;
/** Deplacement d'une fleche du clavier sur une image zoomee, en pixels. */
const PAN_STEP = 60;
/** Niveau atteint par un clic sur l'image. */
const CLICK_ZOOM = 2;
/** En dessous de ce deplacement (px), un appui puis relachement est un clic, pas un glisser. */
const DRAG_THRESHOLD = 4;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Visionneuse d'images : galerie, banniere de la fiche, apercus de
 * l'editeur. Dialog base-ui (focus pris et restitue, Echap). Navigation
 * circulaire entre les images, vrai zoom (clic sur l'image, boutons, clavier,
 * molette) avec deplacement de l'image zoomee (glisser ou fleches), et mode
 * plein ecran (bouton ou touche `f`).
 * Aucune animation. `index` vaut `null` quand la visionneuse est fermee.
 */
export function ImageViewer({
  images,
  index,
  title,
  onIndexChange,
  onClose,
}: {
  images: ViewerImage[];
  index: number | null;
  /** Titre du dialogue, lu par les lecteurs d'ecran (non affiche). */
  title: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const image = index === null ? undefined : images[index];
  const [expanded, setExpanded] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const open = image !== undefined;

  // L'utilisateur peut quitter le vrai plein ecran par le navigateur (Echap,
  // geste) : on suit pour ne pas rester « agrandi » sans l'etre.
  useEffect(() => {
    if (!open) return;
    function handleFullscreenChange() {
      if (!document.fullscreenElement) setExpanded(false);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [open]);

  /**
   * Plein ecran : API Fullscreen sur la popup quand le navigateur la propose
   * (masque aussi son interface) ; sinon, ou si elle est refusee, la popup
   * est simplement agrandie a toute la fenetre (`expanded`).
   */
  function toggleExpanded() {
    if (expanded) {
      setExpanded(false);
      if (document.fullscreenElement) {
        void document.exitFullscreen?.().catch(() => {});
      }
      return;
    }
    setExpanded(true);
    void popupRef.current?.requestFullscreen?.().catch(() => {});
  }

  function close() {
    setExpanded(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen?.().catch(() => {});
    }
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close();
      }}
    >
      {image && index !== null && (
        <DialogPopup
          ref={popupRef}
          animated={false}
          data-expanded={expanded}
          className={cn(
            "flex flex-col gap-3 p-4",
            expanded
              ? "top-0 left-0 h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0"
              : "max-h-[90vh] max-w-4xl",
          )}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {/* `key` : changer d'image remet le zoom a zero, fermer puis rouvrir aussi. */}
          <ViewerBody
            key={index}
            image={image}
            index={index}
            total={images.length}
            expanded={expanded}
            onToggleExpanded={toggleExpanded}
            onNavigate={(step) =>
              onIndexChange((index + step + images.length) % images.length)
            }
          />
        </DialogPopup>
      )}
    </Dialog>
  );
}

function ViewerBody({
  image,
  index,
  total,
  expanded,
  onToggleExpanded,
  onNavigate,
}: {
  image: ViewerImage;
  index: number;
  total: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  onNavigate: (step: 1 | -1) => void;
}) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  /** Vrai si l'appui en cours s'est deplace : le `click` qui suit n'est alors pas un zoom. */
  const moved = useRef(false);

  /** Limites de deplacement : la moitie du surplus de l'image zoomee, par axe. */
  function limits(forZoom: number) {
    const viewport = viewportRef.current;
    return {
      x: ((viewport?.clientWidth ?? 0) * (forZoom - 1)) / 2,
      y: ((viewport?.clientHeight ?? 0) * (forZoom - 1)) / 2,
    };
  }

  function applyZoom(next: number) {
    const zoomed = clamp(next, MIN_ZOOM, MAX_ZOOM);
    const bounds = limits(zoomed);
    setZoom(zoomed);
    setPan((current) => ({
      x: clamp(current.x, -bounds.x, bounds.x),
      y: clamp(current.y, -bounds.y, bounds.y),
    }));
  }

  function panBy(dx: number, dy: number) {
    const bounds = limits(zoom);
    setPan((current) => ({
      x: clamp(current.x + dx, -bounds.x, bounds.x),
      y: clamp(current.y + dy, -bounds.y, bounds.y),
    }));
  }

  // Clavier sur le document, en phase de capture : le Dialog base-ui arrete la
  // propagation des touches au sein de la popup, un ecouteur en phase de bulle
  // (ou un `onKeyDown` sur la popup) ne verrait pas les touches de facon fiable.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const zoomed = zoom > MIN_ZOOM;
      switch (event.key) {
        case "+":
        case "=":
          event.preventDefault();
          applyZoom(zoom + ZOOM_STEP);
          break;
        case "-":
        case "_":
          event.preventDefault();
          applyZoom(zoom - ZOOM_STEP);
          break;
        case "0":
          event.preventDefault();
          applyZoom(MIN_ZOOM);
          break;
        case "f":
        case "F":
          event.preventDefault();
          onToggleExpanded();
          break;
        case "ArrowRight":
          event.preventDefault();
          if (zoomed) panBy(-PAN_STEP, 0);
          else if (total > 1) onNavigate(1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          if (zoomed) panBy(PAN_STEP, 0);
          else if (total > 1) onNavigate(-1);
          break;
        case "ArrowUp":
          if (zoomed) {
            event.preventDefault();
            panBy(0, PAN_STEP);
          }
          break;
        case "ArrowDown":
          if (zoomed) {
            event.preventDefault();
            panBy(0, -PAN_STEP);
          }
          break;
      }
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  });

  // Molette : ecouteur natif non passif (React attache `wheel` en passif, et
  // `preventDefault` y est ignore, la page defilerait en meme temps).
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      applyZoom(zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
    }
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  });

  /** Les boutons (precedent/suivant) superposes a l'image ne declenchent ni zoom ni glisser. */
  function isOnButton(event: { target: EventTarget | null }): boolean {
    return (
      event.target instanceof Element && event.target.closest("button") !== null
    );
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    moved.current = false;
    if (zoom === MIN_ZOOM || isOnButton(event)) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    };
    setDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) moved.current = true;
    const bounds = limits(zoom);
    setPan({
      x: clamp(current.originX + dx, -bounds.x, bounds.x),
      y: clamp(current.originY + dy, -bounds.y, bounds.y),
    });
  }

  function endDrag() {
    drag.current = null;
    setDragging(false);
  }

  /**
   * Un clic sur l'image zoome (curseur loupe) en gardant le point clique sous
   * le curseur ; zoome, il revient a 100 %. Un glisser ne compte pas comme un clic.
   */
  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (isOnButton(event)) return;
    if (moved.current) {
      moved.current = false;
      return;
    }
    if (zoom > MIN_ZOOM) {
      applyZoom(MIN_ZOOM);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - rect.left - rect.width / 2;
    const dy = event.clientY - rect.top - rect.height / 2;
    const bounds = limits(CLICK_ZOOM);
    setZoom(CLICK_ZOOM);
    setPan({
      x: clamp(-dx * (CLICK_ZOOM - 1), -bounds.x, bounds.x),
      y: clamp(-dy * (CLICK_ZOOM - 1), -bounds.y, bounds.y),
    });
  }

  // Variables CSS dynamiques uniquement (V2-2), construites hors JSX.
  const zoomStyle = {
    "--zoom": String(zoom),
    "--pan-x": `${pan.x}px`,
    "--pan-y": `${pan.y}px`,
  } as CSSProperties;
  const percent = Math.round(zoom * 100);

  return (
    <>
      <p aria-live="polite" className="pr-8 text-body-md text-foreground">
        Image {index + 1} sur {total}
      </p>

      <div
        ref={viewportRef}
        role="group"
        aria-label="Image agrandie"
        aria-describedby="image-viewer-help"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={handleClick}
        className={
          "relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-muted " +
          (zoom > MIN_ZOOM
            ? dragging
              ? "cursor-grabbing touch-none"
              : "cursor-zoom-out touch-none"
            : "cursor-zoom-in")
        }
      >
        <img
          src={image.url}
          alt={image.alt}
          draggable={false}
          style={zoomStyle}
          className={cn(
            "w-full select-none object-contain [transform:translate(var(--pan-x),var(--pan-y))_scale(var(--zoom))]",
            expanded ? "h-full max-h-none" : "max-h-[70vh]",
          )}
        />
        {total > 1 && (
          <>
            <IconButton
              aria-label="Image précédente"
              variant="default"
              className="absolute inset-y-0 left-3 my-auto size-12 rounded-pill shadow-overlay transition-none"
              onClick={() => onNavigate(-1)}
            >
              <ChevronLeft size={24} />
            </IconButton>
            <IconButton
              aria-label="Image suivante"
              variant="default"
              className="absolute inset-y-0 right-3 my-auto size-12 rounded-pill shadow-overlay transition-none"
              onClick={() => onNavigate(1)}
            >
              <ChevronRight size={24} />
            </IconButton>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <IconButton
          aria-label="Zoom arrière"
          variant="outline"
          focusableWhenDisabled
          disabled={zoom <= MIN_ZOOM}
          className="transition-none"
          onClick={() => applyZoom(zoom - ZOOM_STEP)}
        >
          <Minus size={18} />
        </IconButton>
        <span
          aria-live="polite"
          className="min-w-14 text-center text-body-md tabular-nums text-foreground"
        >
          Zoom {percent} %
        </span>
        <IconButton
          aria-label="Zoom avant"
          variant="outline"
          focusableWhenDisabled
          disabled={zoom >= MAX_ZOOM}
          className="transition-none"
          onClick={() => applyZoom(zoom + ZOOM_STEP)}
        >
          <Plus size={18} />
        </IconButton>
        <IconButton
          aria-label="Ajuster à la fenêtre"
          variant="outline"
          focusableWhenDisabled
          disabled={zoom === MIN_ZOOM}
          className="transition-none"
          onClick={() => applyZoom(MIN_ZOOM)}
        >
          <ScanSearch size={18} />
        </IconButton>
        <IconButton
          aria-label={expanded ? "Quitter le plein écran" : "Plein écran"}
          aria-pressed={expanded}
          variant="outline"
          className="ml-auto transition-none"
          onClick={onToggleExpanded}
        >
          {expanded ? <Minimize size={18} /> : <Maximize size={18} />}
        </IconButton>
        <p id="image-viewer-help" className="sr-only">
          Clic sur l'image pour zoomer ou dézoomer, touches + et − pour zoomer,
          0 pour ajuster, F pour le plein écran, flèches pour déplacer l'image
          zoomée ou changer d'image.
        </p>
      </div>

      {image.caption && (
        <p className="text-body-md text-foreground">{image.caption}</p>
      )}
    </>
  );
}
