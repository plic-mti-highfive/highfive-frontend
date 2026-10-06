import { useId, useState } from "react";

import { Field, Input } from "@shared/ui";
import { normalizeHex } from "@shared/lib/accentColor";
import { presetTheme } from "@shared/lib/projectThemePresets";

/**
 * Une couleur : selecteur natif + code hexadecimal. Le code s'applique des
 * qu'il est complet (6 chiffres) ; le raccourci a 3 chiffres s'applique a la
 * sortie du champ, pour ne pas ecraser la saisie en cours (#fff -> #ffffff
 * avant d'avoir tape #fff000). Un code invalide ne change pas la couleur.
 */
export function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (color: string) => void;
}) {
  const pickerId = useId();
  const hexId = useId();
  /** Saisie en cours dans le champ texte ; `null` = afficher la valeur courante. */
  const [typed, setTyped] = useState<string | null>(null);

  const text = typed ?? value;
  const invalid =
    typed !== null && typed !== "" && normalizeHex(typed) === null;

  function commit(raw: string) {
    const normalized = normalizeHex(raw);
    if (normalized) {
      onChange(normalized);
      setTyped(null);
    }
  }

  return (
    <Field
      label={label}
      htmlFor={hexId}
      description={hint}
      error={
        invalid
          ? `Code invalide. Exemple : ${presetTheme("bonbon").accent}`
          : undefined
      }
    >
      <div className="flex items-center gap-2">
        <input
          id={pickerId}
          type="color"
          aria-label={`${label}, sélecteur`}
          value={value}
          onChange={(event) => {
            setTyped(null);
            onChange(normalizeHex(event.target.value) ?? value);
          }}
          className="h-10 w-14 shrink-0 cursor-pointer rounded-md border border-border bg-card p-1"
        />
        <Input
          id={hexId}
          value={text}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={invalid}
          onChange={(event) => {
            setTyped(event.target.value);
            if (/^#?[0-9a-f]{6}$/i.test(event.target.value.trim())) {
              commit(event.target.value);
            }
          }}
          onBlur={() => {
            if (typed === null) return;
            if (typed.trim() === "") setTyped(null);
            else commit(typed);
          }}
        />
      </div>
    </Field>
  );
}
