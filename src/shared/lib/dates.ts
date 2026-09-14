// Utilitaire de dates unique (R-X1, doc 15/16) : relatif tant que < 7 jours
// ("il y a 3 h"), date absolue au-dela ("15 janvier 2024"), et toujours une
// date+heure exacte disponible pour l'info-bulle (attribut `title`). Utilise
// par les listes de conversations, le fil de messages et les notifications.

import { formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Date absolue longue en francais : "15 janvier 2024". */
export function formatAbsoluteDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Date+heure exacte en francais, pour l'attribut `title` (info-bulle) — R-X1. */
export function formatExactDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * R-X1 : relatif ("il y a 3 h") tant que la date a moins de 7 jours, date
 * absolue au-dela. Toujours combiner avec `title={formatExactDateTime(iso)}`
 * sur l'element affiche pour l'info-bulle exacte.
 */
export function formatRelativeDate(
  iso: string,
  now: Date = new Date(),
): string {
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  if (diffMs >= 0 && diffMs < SEVEN_DAYS_MS) {
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: fr });
  }
  return formatAbsoluteDate(iso);
}

/** Heure courte ("14:32"), pour l'horodatage compact d'une bulle de message. */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
