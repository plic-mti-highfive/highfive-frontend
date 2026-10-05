import { useId, useState, type CSSProperties } from "react";

import { Button, Field, Input } from "@shared/ui";
import { cn } from "@shared/lib/cn";
import {
  deriveAccentTokens,
  NEUTRAL_ACCENT,
  normalizeHex,
} from "@shared/lib/accentColor";
import { ACCENT_PRESETS, presetColor } from "@shared/lib/accentPresets";

/**
 * Choix de la couleur d'accent : n'importe quelle couleur (selecteur natif ou
 * code hexadecimal), six couleurs rapides, ou « Automatique » (couleur
 * calculee depuis le projet). Les variantes clair/sombre sont derivees par
 * `deriveAccentTokens` avec un contraste garanti ; les deux pastilles
 * d'apercu montrent le resultat dans chaque theme.
 */
export function AccentPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (accent: string | undefined) => void;
}) {
  const pickerId = useId();
  const hexId = useId();
  /** Saisie en cours dans le champ texte ; `null` = afficher la valeur courante. */
  const [typed, setTyped] = useState<string | null>(null);

  const text = typed ?? value ?? "";
  const invalid =
    typed !== null && typed !== "" && normalizeHex(typed) === null;

  function commit(raw: string) {
    const normalized = normalizeHex(raw);
    if (normalized) {
      onChange(normalized);
      setTyped(null);
    }
  }

  function handleText(raw: string) {
    setTyped(raw);
    // On applique des que le code est complet (6 chiffres) ; le raccourci a
    // 3 chiffres s'applique a la sortie du champ, pour ne pas ecraser la
    // saisie en cours (#fff -> #ffffff avant d'avoir tape #fff000).
    if (/^#?[0-9a-f]{6}$/i.test(raw.trim())) commit(raw);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-muted-foreground">
        Choisis la couleur de ta fiche. Elle est ajustée automatiquement pour
        rester lisible en thème clair comme en thème sombre.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Couleur" htmlFor={pickerId}>
          <input
            id={pickerId}
            type="color"
            value={value ?? NEUTRAL_ACCENT}
            onChange={(event) => {
              setTyped(null);
              onChange(normalizeHex(event.target.value) ?? undefined);
            }}
            className="h-10 w-16 cursor-pointer rounded-md border border-border bg-card p-1"
          />
        </Field>
        <Field
          label="Code couleur"
          htmlFor={hexId}
          error={
            invalid
              ? `Code invalide. Exemple : ${presetColor("rose")}`
              : undefined
          }
          className="min-w-32 flex-1"
        >
          <Input
            id={hexId}
            value={text}
            placeholder={presetColor("rose")}
            maxLength={7}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={invalid}
            onChange={(event) => handleText(event.target.value)}
            onBlur={() => {
              if (typed === null) return;
              if (typed.trim() === "") setTyped(null);
              else commit(typed);
            }}
          />
        </Field>
        <Button
          type="button"
          variant="outline"
          aria-pressed={value === undefined}
          onClick={() => {
            setTyped(null);
            onChange(undefined);
          }}
        >
          Automatique
        </Button>
      </div>

      <div
        role="group"
        aria-label="Couleurs rapides"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {ACCENT_PRESETS.map((preset) => (
          <PresetButton
            key={preset.name}
            label={preset.label}
            color={preset.color}
            selected={value === preset.color}
            onSelect={() => {
              setTyped(null);
              onChange(preset.color);
            }}
          />
        ))}
      </div>

      {value ? (
        <ThemePreview color={value} />
      ) : (
        <p className="text-body-sm text-muted-foreground">
          Automatique : la couleur est calculée à partir du projet, comme
          partout ailleurs sur le site.
        </p>
      )}
    </div>
  );
}

function swatchStyle(color: string): CSSProperties {
  return { "--swatch": color } as CSSProperties;
}

function PresetButton({
  label,
  color,
  selected,
  onSelect,
}: {
  label: string;
  color: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-body-md text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected && "border-foreground",
      )}
    >
      <span
        aria-hidden="true"
        style={swatchStyle(color)}
        className="size-5 shrink-0 rounded-pill bg-[var(--swatch)]"
      />
      {label}
    </button>
  );
}

function chipStyle(tokens: {
  base: string;
  surface: string;
  ink: string;
}): CSSProperties {
  return {
    "--chip-base": tokens.base,
    "--chip-surface": tokens.surface,
    "--chip-ink": tokens.ink,
  } as CSSProperties;
}

/** Les deux rendus de la couleur : fond teinte, texte (liens) et couleur d'appui, en clair puis en sombre. */
function ThemePreview({ color }: { color: string }) {
  const tokens = deriveAccentTokens(color);
  return (
    <div className="grid grid-cols-2 gap-2" data-testid="accent-preview">
      {(["light", "dark"] as const).map((theme) => (
        <div
          key={theme}
          style={chipStyle(tokens[theme])}
          className="flex flex-col gap-1.5 rounded-lg border border-border bg-[var(--chip-surface)] p-3"
        >
          <span className="text-label uppercase text-[var(--chip-ink)]">
            Thème {theme === "light" ? "clair" : "sombre"}
          </span>
          <span className="flex items-center gap-2 text-body-md text-[var(--chip-ink)]">
            <span
              aria-hidden="true"
              className="size-3 rounded-pill bg-[var(--chip-base)]"
            />
            Un lien dans la fiche
          </span>
        </div>
      ))}
    </div>
  );
}
