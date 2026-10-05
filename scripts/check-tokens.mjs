#!/usr/bin/env node
// Garde-fou automatique (V2-2, docs/v2/CONVENTIONS.md "Greps de controle") :
// echoue (exit 1) si `src/**/*.{ts,tsx}` contient une valeur visuelle en dur
// (hex, palette Tailwind brute, valeur arbitraire de dimension/couleur,
// `style={{}}` hors variable CSS). Node pur, aucune dependance.
//
// Usage : node scripts/check-tokens.mjs

import { globSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

// --- Exceptions explicites --------------------------------------------------
//
// Fichiers entiers exemptes des quatre regles ci-dessous :
// - src/features/lab/wall/tldrawTheme.ts : palette interne du package
//   `tldraw` (formes/notes/curseurs), independante de nos tokens (voir le
//   commentaire en tete de ce fichier) ; seul endroit qui y touche.
//
// - Calcul et donnees de couleur de l'accent de projet : ce sont des valeurs de
//   couleur manipulees comme des donnees (conversion OKLab, contraste, presets
//   miroir de src/index.css, cas de test), pas du style ecrit en dur. Le style
//   rendu reste exclusivement porte par des variables CSS (--pa-*).
const EXEMPT_FILES = new Set([
  "src/features/lab/wall/tldrawTheme.ts",
  "src/shared/lib/accentColor.ts",
  "src/shared/lib/accentColor.test.ts",
  "src/shared/lib/accentPresets.ts",
  "src/shared/lib/accentPresets.test.ts",
  "src/features/projects/components/customize/AccentPicker.test.tsx",
]);

// Commentaires (// ligne, /* bloc */, JSDoc) : jamais verifies — seul le code
// reellement execute/rendu compte pour ces regles (voir stripComments()).

// --- Regles ------------------------------------------------------------------

const TAILWIND_PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

const RULES = [
  {
    id: "hex-color",
    message: "couleur hexadecimale en dur (utilise un token src/index.css)",
    re: /#[0-9a-fA-F]{3,8}\b/g,
  },
  {
    id: "raw-tailwind-palette",
    message:
      "classe de palette Tailwind brute (utilise la roue d'accent ou un token semantique)",
    re: new RegExp(
      `\\b(?:bg|text|border|ring|fill|stroke|from|to|via|outline|decoration|shadow)-(?:${TAILWIND_PALETTE})-\\d{2,3}\\b`,
      "g",
    ),
  },
  {
    id: "arbitrary-value",
    message:
      "valeur arbitraire de couleur/dimension (utilise un token src/index.css)",
    re: /\[(?:#[0-9a-fA-F]{3,8}|rgba?\([^\]]*|hsla?\([^\]]*|[0-9.]+(?:px|rem))\]/g,
  },
  {
    id: "inline-style",
    message:
      'style={{}} visuel (autorise uniquement pour une variable CSS dynamique, ex. style={{ "--card-accent": token }})',
    // Verifie par ligne plus bas : toute ligne avec `style={{` et sans `--`.
    re: null,
  },
];

// --- Suppression des commentaires (pour ne verifier que le code reel) ------
//
// Approche pragmatique (pas de parseur TS complet, "sans dependance") :
// - blocs /* ... */ remplaces par des espaces (les retours a la ligne sont
//   preserves pour garder des numeros de ligne corrects) ;
// - `// ...` en fin de ligne retire uniquement quand precede d'un espace ou
//   d'un debut de ligne, pour ne pas casser une chaine contenant "://" (URL).
function stripComments(source) {
  const noBlockComments = source.replace(/\/\*[\s\S]*?\*\//g, (match) =>
    match.replace(/[^\n]/g, " "),
  );
  return noBlockComments
    .split("\n")
    .map((line) => line.replace(/(^|\s)\/\/.*$/, "$1"))
    .join("\n");
}

function listSourceFiles() {
  return globSync("src/**/*.{ts,tsx}", { cwd: ROOT }).map((p) =>
    p.split(sep).join("/"),
  );
}

function checkFile(relPath) {
  const absPath = join(ROOT, relPath);
  const raw = readFileSync(absPath, "utf8");
  const code = stripComments(raw);
  const lines = code.split("\n");
  const violations = [];

  for (const rule of RULES) {
    if (rule.id === "inline-style") continue;
    for (const match of code.matchAll(rule.re)) {
      const before = code.slice(0, match.index);
      const line = before.split("\n").length;
      violations.push({
        rule: rule.id,
        message: rule.message,
        line,
        text: match[0],
      });
    }
  }

  lines.forEach((line, index) => {
    if (line.includes("style={{") && !line.includes("--")) {
      violations.push({
        rule: "inline-style",
        message: RULES.find((r) => r.id === "inline-style").message,
        line: index + 1,
        text: line.trim(),
      });
    }
  });

  return violations;
}

function main() {
  const files = listSourceFiles().filter(
    (relPath) => !EXEMPT_FILES.has(relPath),
  );

  let total = 0;
  for (const relPath of files) {
    const violations = checkFile(relPath);
    for (const v of violations) {
      total += 1;
      console.error(`${relPath}:${v.line}  [${v.rule}]  ${v.message}`);
      console.error(`  ${v.text}`);
    }
  }

  if (total > 0) {
    console.error(
      `\ncheck-tokens : ${total} violation(s) — voir docs/v2/CONVENTIONS.md (V2-2).`,
    );
    process.exit(1);
  }

  console.log(`check-tokens : OK (${files.length} fichiers verifies).`);
}

main();
