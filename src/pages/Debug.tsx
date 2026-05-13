import { Footer, Header } from "@/features/layout";

type Swatch = { token: string; hex: string; textDark?: boolean };
type Palette = { name: string; swatches: Swatch[] };

const PALETTES: Palette[] = [
  {
    name: "Rose",
    swatches: [
      { token: "rose", hex: "#FF4D8C", textDark: true },
      { token: "rose-light", hex: "#FFE8F1" },
      { token: "rose-mid", hex: "#FFD0E2" },
      { token: "rose-dark", hex: "#CC0055", textDark: true },
      { token: "rose-deeper", hex: "#99003D", textDark: true },
    ],
  },
  {
    name: "Orange",
    swatches: [
      { token: "orange", hex: "#FF6B1A", textDark: true },
      { token: "orange-light", hex: "#FFF0E6" },
      { token: "orange-mid", hex: "#FFD8BC" },
      { token: "orange-dark", hex: "#AA3A00", textDark: true },
      { token: "orange-deeper", hex: "#7A2800", textDark: true },
    ],
  },
  {
    name: "Yellow",
    swatches: [
      { token: "yellow", hex: "#FFD600" },
      { token: "yellow-light", hex: "#FFFBE0" },
      { token: "yellow-mid", hex: "#FFE680" },
      { token: "yellow-dark", hex: "#6A4E00", textDark: true },
      { token: "yellow-deeper", hex: "#4A3600", textDark: true },
    ],
  },
  {
    name: "Apple",
    swatches: [
      { token: "apple", hex: "#5ED651" },
      { token: "apple-light", hex: "#EDFCE8" },
      { token: "apple-mid", hex: "#C0F0BA" },
      { token: "apple-dark", hex: "#1A7010", textDark: true },
      { token: "apple-deeper", hex: "#0E400A", textDark: true },
    ],
  },
  {
    name: "Sky",
    swatches: [
      { token: "sky", hex: "#3EC6F5" },
      { token: "sky-light", hex: "#E5F8FF" },
      { token: "sky-mid", hex: "#B0E8FA" },
      { token: "sky-dark", hex: "#0A6080", textDark: true },
      { token: "sky-deeper", hex: "#054060", textDark: true },
    ],
  },
  {
    name: "Purple",
    swatches: [
      { token: "purple", hex: "#C24BFF", textDark: true },
      { token: "purple-light", hex: "#F5E8FF" },
      { token: "purple-mid", hex: "#E8C8FF" },
      { token: "purple-dark", hex: "#7000B8", textDark: true },
      { token: "purple-deeper", hex: "#4A0080", textDark: true },
    ],
  },
];

const SHADCN_TOKENS = [
  { token: "--background", usage: "Fond de page" },
  { token: "--foreground", usage: "Texte principal" },
  { token: "--card", usage: "Fond des cards" },
  { token: "--card-foreground", usage: "Texte dans les cards" },
  { token: "--popover", usage: "Fond des popovers" },
  { token: "--primary", usage: "Bouton primary, liens" },
  { token: "--primary-foreground", usage: "Texte sur primary" },
  { token: "--secondary", usage: "Bouton secondary, surfaces" },
  { token: "--muted", usage: "Fond muted" },
  { token: "--muted-foreground", usage: "Texte désactivé, labels" },
  { token: "--accent", usage: "Hover, fond accent" },
  { token: "--accent-foreground", usage: "Texte sur accent" },
  { token: "--destructive", usage: "Erreurs, suppressions" },
  { token: "--border", usage: "Bordures" },
  { token: "--input", usage: "Bordure des inputs" },
  { token: "--ring", usage: "Focus ring" },
];

const TYPE_SIZES = [
  {
    token: "display-xl",
    size: "52px",
    lh: "1.0",
    ls: "-0.025em",
    fw: "900",
    family: "font-display",
    label: "Display XL — Fraunces italic 900",
  },
  {
    token: "display-lg",
    size: "36px",
    lh: "1.05",
    ls: "-0.02em",
    fw: "700",
    family: "font-display",
    label: "Display LG — Fraunces 700",
  },
  {
    token: "heading-lg",
    size: "27px",
    lh: "1.2",
    ls: "-0.02em",
    fw: "700",
    family: "font-heading",
    label: "Heading LG — Lora 700",
  },
  {
    token: "heading-md",
    size: "18px",
    lh: "1.3",
    ls: "-0.01em",
    fw: "700",
    family: "font-heading",
    label: "Heading MD — Lora 700",
  },
  {
    token: "body-lg",
    size: "16px",
    lh: "1.65",
    ls: "normal",
    fw: "400",
    family: "font-sans",
    label: "Body LG — Plus Jakarta Sans 400",
  },
  {
    token: "body-md",
    size: "14px",
    lh: "1.65",
    ls: "normal",
    fw: "400",
    family: "font-sans",
    label: "Body MD — Plus Jakarta Sans 400",
  },
  {
    token: "body-sm",
    size: "12px",
    lh: "1.55",
    ls: "normal",
    fw: "400",
    family: "font-sans",
    label: "Body SM — Plus Jakarta Sans 400",
  },
  {
    token: "ui-md",
    size: "13px",
    lh: "1.4",
    ls: "normal",
    fw: "600",
    family: "font-sans",
    label: "UI MD — Plus Jakarta Sans 600",
  },
  {
    token: "ui-sm",
    size: "11px",
    lh: "1.4",
    ls: "0.10em",
    fw: "600",
    family: "font-sans",
    label: "UI SM — Plus Jakarta Sans 600",
  },
  {
    token: "label",
    size: "10px",
    lh: "1.4",
    ls: "0.14em",
    fw: "600",
    family: "font-sans",
    label: "Label — Plus Jakarta Sans 600",
  },
];

const SPACINGS = [
  { token: "comp-xs", value: "6px" },
  { token: "comp-sm", value: "9px" },
  { token: "comp-md", value: "13px" },
  { token: "comp-lg", value: "18px" },
  { token: "comp-xl", value: "22px" },
  { token: "gap-sm", value: "8px" },
  { token: "gap-md", value: "14px" },
  { token: "gap-lg", value: "24px" },
  { token: "gap-xl", value: "40px" },
];

const RADII = [
  { token: "rounded-sm", value: "8px", cssClass: "rounded-sm" },
  { token: "rounded-md", value: "12px", cssClass: "rounded-md" },
  { token: "rounded-lg", value: "16px", cssClass: "rounded-lg" },
  { token: "rounded-xl", value: "20px", cssClass: "rounded-xl" },
  { token: "rounded-pill", value: "100px", cssClass: "rounded-pill" },
];

const BORDERS = [
  { token: "border-thin", value: "0.5px", style: "0.5px solid #0A0A0A" },
  { token: "border (default)", value: "1px", style: "1px solid #0A0A0A" },
  { token: "border-accent", value: "1.5px", style: "1.5px solid #0A0A0A" },
  { token: "border-featured", value: "2px", style: "2px solid #0A0A0A" },
];

// --- Helpers -----------------------------------------------------------------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-sans text-ui-sm text-muted-foreground uppercase tracking-[0.14em] mb-6 pt-12 pb-2 border-b border-border">
      {children}
    </h2>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-[11px] font-mono bg-muted text-foreground px-1.5 py-0.5 rounded">
      {children}
    </code>
  );
}

// --- Sections ----------------------------------------------------------------

function ColorSection() {
  return (
    <>
      <SectionTitle>Couleurs</SectionTitle>
      <div className="space-y-8">
        {PALETTES.map((palette) => (
          <div key={palette.name}>
            <p className="text-body-sm text-muted-foreground mb-3 font-sans font-semibold">
              {palette.name}
            </p>
            <div className="flex flex-wrap gap-3">
              {palette.swatches.map((swatch) => (
                <div key={swatch.token} className="w-36">
                  <div
                    className="h-16 w-full rounded-md border border-border flex items-end p-2"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    <span
                      className="text-[10px] font-mono font-semibold leading-none"
                      style={{ color: swatch.textDark ? "#FCFCFC" : "#0A0A0A" }}
                    >
                      {swatch.hex}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-foreground mt-1.5">
                    {swatch.token}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ShadcnTokensSection() {
  return (
    <>
      <SectionTitle>Tokens shadcn (semantic)</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SHADCN_TOKENS.map(({ token, usage }) => (
          <div
            key={token}
            className="flex items-center gap-3 bg-card rounded-md px-3 py-2.5 border border-border"
          >
            <div
              className="w-8 h-8 rounded shrink-0 border border-border"
              style={{ background: `var(${token})` }}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-mono text-foreground truncate">
                {token}
              </p>
              <p className="text-[10px] text-muted-foreground">{usage}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TypographySection() {
  return (
    <>
      <SectionTitle>Typographie</SectionTitle>

      {/* Font families */}
      <div className="flex flex-wrap gap-6 mb-10">
        {[
          {
            name: "font-display",
            label: "Display",
            family: "Fraunces",
            weights: "italic 900",
            sample: "The quick brown fox",
          },
          {
            name: "font-heading",
            label: "Heading",
            family: "Lora",
            weights: "700",
            sample: "The quick brown fox",
          },
          {
            name: "font-sans",
            label: "Sans / UI",
            family: "Plus Jakarta Sans",
            weights: "400 500 600 700",
            sample: "The quick brown fox",
          },
        ].map((f) => (
          <div
            key={f.name}
            className="bg-card border border-border rounded-lg p-5 flex-1 min-w-52"
          >
            <Chip>{f.name}</Chip>
            <p className="text-body-sm text-muted-foreground mt-1 mb-3 font-sans">
              {f.family} — {f.weights}
            </p>
            <p
              className="text-2xl text-foreground"
              style={{
                fontFamily: f.family,
                fontStyle: f.name === "font-display" ? "italic" : "normal",
                fontWeight: f.name === "font-sans" ? 400 : 700,
              }}
            >
              {f.sample}
            </p>
          </div>
        ))}
      </div>

      {/* Type scale */}
      <div className="space-y-1 divide-y divide-border">
        {TYPE_SIZES.map((t) => (
          <div key={t.token} className="flex items-baseline gap-4 py-3">
            <div className="w-48 shrink-0 space-y-0.5">
              <Chip>text-{t.token}</Chip>
              <p className="text-[10px] text-muted-foreground font-sans mt-1">
                {t.size} / {t.lh} lh · ls {t.ls} · fw {t.fw}
              </p>
            </div>
            <p
              className="text-foreground flex-1 min-w-0 truncate"
              style={{
                fontFamily:
                  t.family === "font-display"
                    ? "Fraunces"
                    : t.family === "font-heading"
                      ? "Lora"
                      : "Plus Jakarta Sans",
                fontSize: t.size,
                lineHeight: t.lh,
                letterSpacing: t.ls,
                fontWeight: t.fw,
                fontStyle: t.family === "font-display" ? "italic" : "normal",
              }}
            >
              {t.label}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

function SpacingSection() {
  return (
    <>
      <SectionTitle>Espacements</SectionTitle>
      <div className="space-y-3">
        {SPACINGS.map(({ token, value }) => (
          <div key={token} className="flex items-center gap-4">
            <div className="w-36 shrink-0 flex items-center gap-2">
              <Chip>{token}</Chip>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground w-10 shrink-0">
              {value}
            </span>
            <div className="flex items-center">
              <div
                className="bg-rose h-5 rounded-sm"
                style={{ width: value }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function RadiiSection() {
  return (
    <>
      <SectionTitle>Border Radius</SectionTitle>
      <div className="flex flex-wrap gap-6">
        {RADII.map(({ token, value, cssClass }) => (
          <div key={token} className="flex flex-col items-center gap-2">
            <div
              className={`w-20 h-20 bg-muted border-2 border-border ${cssClass}`}
            />
            <Chip>{token}</Chip>
            <span className="text-[10px] text-muted-foreground font-mono">
              {value}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function BordersSection() {
  return (
    <>
      <SectionTitle>Border Width</SectionTitle>
      <div className="flex flex-wrap gap-6">
        {BORDERS.map(({ token, value, style }) => (
          <div key={token} className="flex flex-col gap-2">
            <div
              className="w-32 h-16 rounded-md bg-muted"
              style={{ border: style }}
            />
            <Chip>{token}</Chip>
            <span className="text-[10px] text-muted-foreground font-mono">
              {value}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// --- Page ---------------------------------------------------------------------

export default function Debug() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 pb-12">
        <ColorSection />
        <ShadcnTokensSection />
        <TypographySection />
        <SpacingSection />
        <RadiiSection />
        <BordersSection />
      </div>

      <Footer />
    </div>
  );
}
