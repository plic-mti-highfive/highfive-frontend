// Convergence vers src/shared/lib/dates.ts (R-X1) : l'implementation vit
// desormais la-bas, ce fichier ne fait que re-exporter pour ne pas casser
// ses appelants existants (ProjectHeader, ProjectSidebar).
export { formatFrenchDate } from "@shared/lib/dates";
