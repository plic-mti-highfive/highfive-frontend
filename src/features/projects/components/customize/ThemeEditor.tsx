import type { CSSProperties } from "react";

import { Button } from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { deriveProjectTheme } from "@shared/lib/projectTheme";
import {
  DEFAULT_PROJECT_THEME,
  matchPreset,
  PROJECT_THEME_PRESETS,
} from "@shared/lib/projectThemePresets";
import type { ProjectTheme } from "@/domain";
import { ColorField } from "./ColorField";

/**
 * Couleurs de la fiche, optionnelles : sans palette, la fiche suit le theme
 * clair/sombre du site. Une palette (un preset, puis des ajustements) s'impose
 * a toute la fiche pour tous les visiteurs. Quatre couleurs seulement ; le
 * reste est derive, et le texte est corrige s'il manque de contraste
 * (`deriveProjectTheme`), l'editeur le signale.
 */
export function ThemeEditor({
  value,
  onChange,
}: {
  value: ProjectTheme | undefined;
  onChange: (theme: ProjectTheme | undefined) => void;
}) {
  const activePreset = matchPreset(value);
  const adjusted = value ? deriveProjectTheme(value).adjusted : false;

  function setColor(key: keyof ProjectTheme, color: string) {
    onChange({ ...(value ?? DEFAULT_PROJECT_THEME), [key]: color });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-muted-foreground">
        Facultatif. Par défaut, la fiche suit le thème clair ou sombre du site.
        Une palette s'applique à toute la fiche (fond, blocs, texte, liens et
        boutons), quel que soit le thème du visiteur.
      </p>

      <div
        role="group"
        aria-label="Palettes"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        <PaletteButton
          label="Par défaut"
          selected={value === undefined}
          onSelect={() => onChange(undefined)}
        />
        {PROJECT_THEME_PRESETS.map((preset) => (
          <PaletteButton
            key={preset.id}
            label={preset.label}
            theme={preset.theme}
            selected={activePreset === preset.id}
            onSelect={() => onChange(preset.theme)}
          />
        ))}
      </div>

      {value && (
        <div className="flex flex-col gap-4" data-testid="theme-colors">
          <p className="text-label font-semibold uppercase tracking-wider text-muted-foreground">
            {activePreset ? "Couleurs de la palette" : "Palette personnalisée"}
          </p>
          <ColorField
            label="Fond de la page"
            hint="Derrière toute la fiche."
            value={value.background}
            onChange={(color) => setColor("background", color)}
          />
          <ColorField
            label="Fond des blocs"
            hint="Commentaires, équipe, cartes."
            value={value.panel}
            onChange={(color) => setColor("panel", color)}
          />
          <ColorField
            label="Texte"
            hint="Titres et paragraphes."
            value={value.text}
            onChange={(color) => setColor("text", color)}
          />
          <ColorField
            label="Accent"
            hint="Liens, boutons, onglet actif."
            value={value.accent}
            onChange={(color) => setColor("accent", color)}
          />
          {adjusted && (
            <p role="status" className="text-body-sm text-muted-foreground">
              Le texte a été ajusté automatiquement pour rester lisible sur ces
              fonds.
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => onChange(undefined)}
          >
            Revenir au thème du site
          </Button>
        </div>
      )}
    </div>
  );
}

function swatchStyle(theme: ProjectTheme): CSSProperties {
  return {
    "--sw-bg": theme.background,
    "--sw-panel": theme.panel,
    "--sw-text": theme.text,
    "--sw-accent": theme.accent,
  } as CSSProperties;
}

/** Pastille de palette : miniature fond / bloc / texte / accent, avec son nom en texte. */
function PaletteButton({
  label,
  theme,
  selected,
  onSelect,
}: {
  label: string;
  theme?: ProjectTheme;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-card p-2 text-left text-body-md text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected && "border-foreground",
      )}
    >
      <span
        aria-hidden="true"
        style={theme ? swatchStyle(theme) : undefined}
        className={cn(
          "flex h-12 items-center gap-2 rounded-md p-2",
          theme ? "bg-[var(--sw-bg)]" : "bg-muted",
        )}
      >
        {theme ? (
          <>
            <span className="flex h-full flex-1 flex-col justify-center gap-1 rounded-sm bg-[var(--sw-panel)] px-2">
              <span className="h-1 w-3/4 rounded-pill bg-[var(--sw-text)]" />
              <span className="h-1 w-1/2 rounded-pill bg-[var(--sw-text)] opacity-50" />
            </span>
            <span className="size-4 shrink-0 rounded-pill bg-[var(--sw-accent)]" />
          </>
        ) : (
          <span className="text-body-sm text-muted-foreground">
            Thème du site
          </span>
        )}
      </span>
      {label}
    </button>
  );
}
