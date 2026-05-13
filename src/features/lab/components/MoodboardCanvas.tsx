import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { Trash2 } from "lucide-react";
import type {
  MoodboardElement,
  Viewport,
  ActiveTool,
} from "../hooks/useMoodboard";

type ResizeCorner = "tl" | "tr" | "bl" | "br";

interface MoodboardCanvasProps {
  elements: MoodboardElement[];
  viewport: Viewport;
  selectedId: string | null;
  activeTool: ActiveTool;
  onPan: (dx: number, dy: number) => void;
  onZoom: (delta: number, cx: number, cy: number) => void;
  onSelect: (id: string | null) => void;
  onPlace: (canvasX: number, canvasY: number) => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  onUpdateElement: (id: string, changes: Partial<MoodboardElement>) => void;
  onDeleteElement: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export function MoodboardCanvas({
  elements,
  viewport,
  selectedId,
  activeTool,
  onPan,
  onZoom,
  onSelect,
  onPlace,
  onMoveElement,
  onUpdateElement,
  onDeleteElement,
  onBringToFront,
}: MoodboardCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasPannedRef = useRef(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Keep viewport accessible inside native event handlers without stale closures
  const viewportRef = useRef(viewport);
  useLayoutEffect(() => {
    viewportRef.current = viewport;
  });

  // -- Non-passive wheel listener - prevents page scroll when cursor is over canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      onZoom(
        e.deltaY < 0 ? 1 : -1,
        e.clientX - rect.left,
        e.clientY - rect.top,
      );
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [onZoom]);

  // -- Screen → canvas coordinates -------------------------------------------
  function screenToCanvas(sx: number, sy: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const vp = viewportRef.current;
    return {
      x: (sx - rect.left - vp.x) / vp.scale,
      y: (sy - rect.top - vp.y) / vp.scale,
    };
  }

  // -- Canvas mousedown: pan (select mode, blank canvas only) ----------------
  function handleCanvasMouseDown(e: React.MouseEvent) {
    hasPannedRef.current = false; // reset before every interaction
    if (activeTool !== "select") return;
    const target = e.target as HTMLElement;
    if (target !== containerRef.current && target.dataset.canvas !== "bg")
      return;
    e.preventDefault();
    onSelect(null);
    hasPannedRef.current = false;
    let lastX = e.clientX;
    let lastY = e.clientY;

    function onMove(ev: MouseEvent) {
      hasPannedRef.current = true;
      onPan(ev.clientX - lastX, ev.clientY - lastY);
      lastX = ev.clientX;
      lastY = ev.clientY;
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // -- Canvas click: place element (non-select tools) ------------------------
  function handleCanvasClick(e: React.MouseEvent) {
    if (activeTool === "select") return;
    if (hasPannedRef.current) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    onPlace(pos.x, pos.y);
  }

  // -- Element mousedown: drag (select mode only) ----------------------------
  function handleElementMouseDown(e: React.MouseEvent, el: MoodboardElement) {
    if (activeTool !== "select") return; // let event bubble → canvas click
    if (editingId === el.id) return;
    e.stopPropagation();
    onSelect(el.id);
    onBringToFront(el.id);

    const startElX = el.x;
    const startElY = el.y;
    const startMX = e.clientX;
    const startMY = e.clientY;

    function onMove(ev: MouseEvent) {
      const scale = viewportRef.current.scale;
      onMoveElement(
        el.id,
        startElX + (ev.clientX - startMX) / scale,
        startElY + (ev.clientY - startMY) / scale,
      );
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // -- Resize handle mousedown -----------------------------------------------
  function handleResizeMouseDown(
    e: React.MouseEvent,
    el: MoodboardElement,
    corner: ResizeCorner,
  ) {
    e.stopPropagation();
    e.preventDefault();
    const startMX = e.clientX;
    const startMY = e.clientY;
    const { x: sx, y: sy, width: sw, height: sh } = el;

    function onMove(ev: MouseEvent) {
      const scale = viewportRef.current.scale;
      const dx = (ev.clientX - startMX) / scale;
      const dy = (ev.clientY - startMY) / scale;

      let nw: number, nh: number;
      if (corner === "tl") {
        nw = sw - dx;
        nh = sh - dy;
      } else if (corner === "tr") {
        nw = sw + dx;
        nh = sh - dy;
      } else if (corner === "bl") {
        nw = sw - dx;
        nh = sh + dy;
      } else {
        nw = sw + dx;
        nh = sh + dy;
      }

      nw = Math.max(40, nw);
      nh = Math.max(30, nh);

      // Keep the opposite corner anchored
      let nx = sx,
        ny = sy;
      if (corner === "tl") {
        nx = sx + sw - nw;
        ny = sy + sh - nh;
      } else if (corner === "tr") {
        ny = sy + sh - nh;
      } else if (corner === "bl") {
        nx = sx + sw - nw;
      }

      onUpdateElement(el.id, { x: nx, y: ny, width: nw, height: nh });
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const cursorClass =
    activeTool === "select"
      ? "cursor-grab active:cursor-grabbing"
      : "cursor-crosshair";

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${cursorClass}`}
      style={{ background: "var(--color-cream, #FAF9F6)" }}
      onMouseDown={handleCanvasMouseDown}
      onClick={handleCanvasClick}
    >
      {/* Dot-grid background */}
      <svg
        data-canvas="bg"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <defs>
          <pattern
            id="dot-grid"
            x={viewport.x % (20 * viewport.scale)}
            y={viewport.y % (20 * viewport.scale)}
            width={20 * viewport.scale}
            height={20 * viewport.scale}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={viewport.scale}
              cy={viewport.scale}
              r={Math.max(0.5, viewport.scale * 0.6)}
              fill="rgba(0,0,0,0.08)"
            />
          </pattern>
        </defs>
        <rect
          data-canvas="bg"
          width="100%"
          height="100%"
          fill="url(#dot-grid)"
        />
      </svg>

      {/* Canvas transform layer */}
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          zIndex: 1,
        }}
      >
        {elements.map((el) => (
          <CanvasElement
            key={el.id}
            el={el}
            isSelected={el.id === selectedId}
            isEditing={el.id === editingId}
            activeTool={activeTool}
            onMouseDown={(e) => handleElementMouseDown(e, el)}
            onDoubleClick={() => {
              if (activeTool !== "select") return;
              if (el.type === "text" || el.type === "sticky") {
                setEditingId(el.id);
                onSelect(el.id);
              }
            }}
            onBlurEdit={(text) => {
              onUpdateElement(el.id, { content: text });
              setEditingId(null);
            }}
            onDelete={() => onDeleteElement(el.id)}
            onResizeStart={(e, corner) => handleResizeMouseDown(e, el, corner)}
          />
        ))}
      </div>
    </div>
  );
}

// -- Single canvas element -----------------------------------------------------

interface CanvasElementProps {
  el: MoodboardElement;
  isSelected: boolean;
  isEditing: boolean;
  activeTool: ActiveTool;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onBlurEdit: (text: string) => void;
  onDelete: () => void;
  onResizeStart: (e: React.MouseEvent, corner: ResizeCorner) => void;
}

function CanvasElement({
  el,
  isSelected,
  isEditing,
  activeTool,
  onMouseDown,
  onDoubleClick,
  onBlurEdit,
  onDelete,
  onResizeStart,
}: CanvasElementProps) {
  const [draft, setDraft] = useState(el.content ?? "");
  const isSelectMode = activeTool === "select";

  const style: React.CSSProperties = {
    position: "absolute",
    left: el.x,
    top: el.y,
    width: el.width,
    height: el.height,
  };

  const selectionRing = isSelected
    ? "outline outline-2 outline-offset-2 outline-blue-400"
    : "outline-none";
  const moveCursor = isSelectMode ? "cursor-move" : "";

  const handles =
    isSelected && isSelectMode ? (
      <>
        <ResizeHandle corner="tl" onMouseDown={(e) => onResizeStart(e, "tl")} />
        <ResizeHandle corner="tr" onMouseDown={(e) => onResizeStart(e, "tr")} />
        <ResizeHandle corner="bl" onMouseDown={(e) => onResizeStart(e, "bl")} />
        <ResizeHandle corner="br" onMouseDown={(e) => onResizeStart(e, "br")} />
        <DeleteButton onDelete={onDelete} />
      </>
    ) : null;

  if (el.type === "rect") {
    return (
      <div
        style={{
          ...style,
          backgroundColor: el.color ?? "#93C5FD",
          borderRadius: 12,
        }}
        className={`${selectionRing} ${moveCursor}`}
        onMouseDown={onMouseDown}
      >
        {handles}
      </div>
    );
  }

  if (el.type === "sticky") {
    return (
      <div
        style={{
          ...style,
          backgroundColor: el.color ?? "#FDE68A",
          borderRadius: 12,
          padding: 12,
        }}
        className={`${selectionRing} ${moveCursor} flex flex-col`}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
      >
        {isEditing ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onBlurEdit(draft)}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex-1 w-full resize-none bg-transparent outline-none text-sm text-gray-800 leading-snug cursor-text"
            style={{ fontFamily: "inherit" }}
          />
        ) : (
          <span className="text-sm text-gray-800 leading-snug whitespace-pre-wrap break-words">
            {el.content}
          </span>
        )}
        {handles}
      </div>
    );
  }

  // type === 'text'
  return (
    <div
      style={{ ...style, minWidth: el.width }}
      className={`${selectionRing} ${moveCursor}`}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {isEditing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onBlurEdit(draft)}
          onMouseDown={(e) => e.stopPropagation()}
          className="bg-transparent outline-none w-full cursor-text"
          style={{
            fontSize: el.fontSize ?? 18,
            fontFamily: "inherit",
            color: el.color ?? "var(--color-ink, #1a1a1a)",
          }}
        />
      ) : (
        <span
          className="block whitespace-pre"
          style={{
            fontSize: el.fontSize ?? 18,
            color: el.color ?? "var(--color-ink, #1a1a1a)",
          }}
        >
          {el.content}
        </span>
      )}
      {handles}
    </div>
  );
}

// -- Resize handle -------------------------------------------------------------

function ResizeHandle({
  corner,
  onMouseDown,
}: {
  corner: ResizeCorner;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  const cursors: Record<ResizeCorner, string> = {
    tl: "nwse-resize",
    tr: "nesw-resize",
    bl: "nesw-resize",
    br: "nwse-resize",
  };
  const positions: Record<ResizeCorner, React.CSSProperties> = {
    tl: { top: -5, left: -5 },
    tr: { top: -5, right: -5 },
    bl: { bottom: -5, left: -5 },
    br: { bottom: -5, right: -5 },
  };
  return (
    <div
      style={{
        position: "absolute",
        width: 10,
        height: 10,
        backgroundColor: "white",
        border: "2px solid #60A5FA",
        borderRadius: 2,
        cursor: cursors[corner],
        zIndex: 10,
        ...positions[corner],
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
    />
  );
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 cursor-pointer transition-colors z-10"
      aria-label="Supprimer"
    >
      <Trash2 size={11} />
    </button>
  );
}
