// Genere les JSON Schema (zod 4 natif, `z.toJSONSchema`) de tous les schemas
// exportes par `src/domain/index.ts`, plus quelques instanciations
// `Paginated<X>` reperees dans `docs/v2/API-ROUTES.md` (utiles pour
// `docs/v2/backend/openapi.yaml`). Ecrit dans `docs/v2/backend/schemas/`.
//
// Ne depend d'aucun outil supplementaire : Vite (deja une dependance du
// projet) charge `src/domain/index.ts` en SSR (`ssrLoadModule`), ce qui
// resout `@/*` et compile le TS a la volee sans ajouter tsx/vite-node.
//
// Usage : pnpm export:schemas

import { createServer } from "vite";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "docs/v2/backend/schemas");

/** Instanciations `Paginated<X>` utilisees par au moins une route (voir API-ROUTES.md). */
const PAGINATED_EXPORTS = {
  PaginatedProjectSummary: "projectSummarySchema",
  PaginatedUserSummary: "userSummarySchema",
  PaginatedNotificationSummary: "notificationSummarySchema",
  PaginatedMessageWithAuthor: "messageWithAuthorSchema",
  PaginatedReportSummary: "reportSummarySchema",
  PaginatedCurrentUser: "currentUserSchema",
  PaginatedTag: "tagSchema",
};

function isZodSchema(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.parse === "function" &&
    typeof value.safeParse === "function" &&
    "_zod" in value
  );
}

/** `projectSummarySchema` -> `ProjectSummary`, `apiErrorBodySchema` -> `ApiErrorBody`. */
function schemaNameFromExport(exportName) {
  const stripped = exportName.replace(/Schema$/, "");
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

function writeSchema(name, zodSchema) {
  const jsonSchema = z.toJSONSchema(zodSchema, { unrepresentable: "any" });
  jsonSchema.title = name;
  fs.writeFileSync(
    path.join(outDir, `${name}.json`),
    JSON.stringify(jsonSchema, null, 2) + "\n",
    "utf8",
  );
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const file of fs.readdirSync(outDir)) {
    if (file.endsWith(".json")) fs.rmSync(path.join(outDir, file));
  }

  const server = await createServer({
    root,
    logLevel: "warn",
    server: { middlewareMode: true },
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
  });

  const written = [];
  const skipped = [];
  const failed = [];

  try {
    const mod = await server.ssrLoadModule("/src/domain/index.ts");

    for (const [exportName, value] of Object.entries(mod)) {
      if (!isZodSchema(value)) {
        skipped.push(exportName);
        continue;
      }
      const name = schemaNameFromExport(exportName);
      try {
        writeSchema(name, value);
        written.push(name);
      } catch (err) {
        failed.push(`${exportName} (${name}): ${err.message}`);
      }
    }

    for (const [name, itemExportName] of Object.entries(PAGINATED_EXPORTS)) {
      const itemSchema = mod[itemExportName];
      if (!isZodSchema(itemSchema)) {
        failed.push(
          `${name}: export "${itemExportName}" introuvable dans src/domain`,
        );
        continue;
      }
      try {
        writeSchema(name, mod.paginatedSchema(itemSchema));
        written.push(name);
      } catch (err) {
        failed.push(`${name}: ${err.message}`);
      }
    }
  } finally {
    await server.close();
  }

  written.sort();
  console.log(
    `[export-schemas] ${written.length} schemas ecrits dans docs/v2/backend/schemas/`,
  );
  console.log(
    `[export-schemas] exports ignores (non-schema) : ${skipped.join(", ")}`,
  );
  if (failed.length > 0) {
    console.error(`[export-schemas] echecs (${failed.length}) :`);
    for (const line of failed) console.error(`  - ${line}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("[export-schemas] erreur fatale :", err);
  process.exit(1);
});
