import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Type,
  Square,
  MousePointer2,
  ChevronDown,
} from "lucide-react";
import { useMoodboard, type MoodboardElementType } from "../hooks/useMoodboard";
import type { ActiveTool } from "../hooks/useMoodboard";
import { MoodboardCanvas } from "../components/MoodboardCanvas";
import { useRef, useState } from "react";

const RECT_COLORS = [
  "#93C5FD",
  "#FCA5A5",
  "#86EFAC",
  "#FDE68A",
  "#D8B4FE",
  "#FDBA74",
  "#6EE7B7",
  "#F9A8D4",
];

/**
 * Le Mur, montee sous LabLayout. En attendant la vraie construction du Mur
 * (tldraw, V2-10), cette page reutilise l'ancien moodboard comme contenu de
 * l'onglet "Le Mur" — voir TODO(v2-L4) plus bas.
 */
export default function MoodboardPage() {
  // TODO(v2-L4) : route "/projets/:slug/lab/mur" (param renomme projectId ->
  // slug). Cette page reste un espace "moodboard" provisoire, sans lien avec
  // le projet courant : le vrai Le Mur (V2-10, fusion Canvas+Moodboard sur
  // tldraw) n'est pas dans ce lot.
  const {
    elements,
    viewport,
    selectedId,
    setSelectedId,
    pan,
    zoomAt,
    resetViewport,
    addElement,
    updateElement,
    deleteElement,
    moveElement,
    bringToFront,
  } = useMoodboard();

  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [activeRectColor, setActiveRectColor] = useState(RECT_COLORS[0]);
  const [rectExpanded, setRectExpanded] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Called by canvas when user clicks in placement mode
  function handlePlace(canvasX: number, canvasY: number) {
    // Center element on click position
    const offX = activeTool === "text" ? 100 : 80;
    const offY = activeTool === "text" ? 20 : 50;
    const id = addElement(
      activeTool as MoodboardElementType,
      canvasX - offX,
      canvasY - offY,
    );
    if (activeTool === "rect") updateElement(id, { color: activeRectColor });
    setActiveTool("select");
  }

  function selectTool(tool: ActiveTool) {
    setActiveTool(tool);
    setRectExpanded(tool === "rect");
  }

  function zoomStep(direction: 1 | -1) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAt(direction, rect.width / 2, rect.height / 2);
  }

  const scaleLabel = `${Math.round(viewport.scale * 100)}%`;

  const selectedTextEl =
    elements.find((e) => e.id === selectedId && e.type === "text") ?? null;

  return (
    <>
      <main className="flex h-full flex-col">
        {/* Canvas + toolbar row */}
        <div className="flex flex-1 min-h-0">
          {/* Canvas */}
          <div ref={canvasRef} className="flex-1 min-w-0 relative">
            <MoodboardCanvas
              elements={elements}
              viewport={viewport}
              selectedId={selectedId}
              activeTool={activeTool}
              onPan={pan}
              onZoom={zoomAt}
              onSelect={setSelectedId}
              onPlace={handlePlace}
              onMoveElement={moveElement}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
              onBringToFront={bringToFront}
            />

            {/* Zoom controls - bottom left */}
            <div className="absolute bottom-5 left-5 flex items-center gap-1 bg-background border border-border rounded-xl shadow-sm px-2 py-1.5 z-10">
              <button
                onClick={() => zoomStep(-1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Dézoomer"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-ui-sm tabular-nums text-foreground min-w-[42px] text-center select-none">
                {scaleLabel}
              </span>
              <button
                onClick={() => zoomStep(1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Zoomer"
              >
                <ZoomIn size={14} />
              </button>
              <div className="w-px h-4 bg-border mx-0.5" />
              <button
                onClick={resetViewport}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Réinitialiser la vue"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {/* Right toolbar */}
          <aside className="flex-none w-52 border-l border-border bg-background flex flex-col gap-1.5 p-3 overflow-y-auto">
            {/* Contextual: font size (text element selected) */}
            {selectedTextEl && (
              <>
                <div className="pb-1 mb-1 border-b border-border">
                  <p className="text-label uppercase text-muted-foreground font-bold mb-2 tracking-wide">
                    Taille
                  </p>
                  <div className="flex items-center gap-1.5 mb-2">
                    <input
                      type="number"
                      min={8}
                      max={200}
                      value={selectedTextEl.fontSize ?? 18}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        if (!isNaN(v) && v >= 8 && v <= 200)
                          updateElement(selectedTextEl.id, { fontSize: v });
                      }}
                      className="w-16 text-center text-body-sm font-semibold bg-muted border border-border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    />
                    <span className="text-body-sm text-muted-foreground">
                      px
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[12, 16, 20, 24, 32, 48, 64].map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          updateElement(selectedTextEl.id, { fontSize: size })
                        }
                        className={`px-2 py-1 rounded-lg text-label font-bold cursor-pointer transition-all active:scale-95 ${
                          (selectedTextEl.fontSize ?? 18) === size
                            ? "bg-foreground text-background"
                            : "bg-muted text-foreground hover:bg-muted/70"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Select */}
            <ToolItem
              icon={<MousePointer2 size={14} />}
              label="Sélection"
              isActive={activeTool === "select"}
              onClick={() => selectTool("select")}
            />

            {/* Text */}
            <ToolItem
              icon={<Type size={14} />}
              label="Texte"
              isActive={activeTool === "text"}
              onClick={() => selectTool("text")}
            />

            {/* Rectangle with color submenu */}
            <div>
              <div className="flex items-center gap-1">
                <ToolItem
                  icon={
                    <span className="flex items-center gap-1.5">
                      <Square size={14} />
                      <span
                        className="w-3 h-3 rounded-sm border border-black/10 shrink-0"
                        style={{ backgroundColor: activeRectColor }}
                      />
                    </span>
                  }
                  label="Rectangle"
                  isActive={activeTool === "rect"}
                  onClick={() => selectTool("rect")}
                  className="flex-1"
                />
                <button
                  onClick={() => setRectExpanded((v) => !v)}
                  className="shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Couleurs"
                >
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-150 ${rectExpanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
              {rectExpanded && (
                <div className="grid grid-cols-4 gap-1.5 mt-1.5 px-1 pb-1">
                  {RECT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setActiveRectColor(color);
                        selectTool("rect");
                      }}
                      className={`h-6 rounded-md cursor-pointer border transition-transform hover:scale-110 active:scale-95 ${
                        activeRectColor === color && activeTool === "rect"
                          ? "ring-2 ring-offset-1 ring-blue-400 border-transparent"
                          : "border-black/10"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={color}
                    />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

function ToolItem({
  icon,
  label,
  isActive,
  onClick,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-body-sm font-medium transition-all cursor-pointer active:scale-[0.98] ${
        isActive
          ? "bg-foreground text-background shadow-sm"
          : "text-foreground bg-muted hover:bg-muted/70"
      } ${className}`}
    >
      <span className={isActive ? "text-background" : "text-muted-foreground"}>
        {icon}
      </span>
      {label}
    </button>
  );
}
