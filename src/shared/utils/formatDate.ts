/** Formate une date ISO en format long français : "15 janvier 2024". */
export function formatFrenchDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
