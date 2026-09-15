/**
 * Rendu markdown restreint (mission item 1 : "description markdown restreint
 * rendue proprement"). Volontairement minimal — pas de dependance ajoutee au
 * projet pour un besoin aussi borne : gras, italique, liens, paragraphes et
 * retours a la ligne. Tout le reste du texte est echappe, jamais interprete
 * comme du HTML.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** N'autorise que des liens http(s), jamais javascript:/data:. */
function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function renderInline(text: string): string {
  let html = escapeHtml(text);

  html = html.replace(
    /\[([^[\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (match, label: string, url: string) =>
      isSafeUrl(url)
        ? `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="underline underline-offset-2 hover:text-foreground">${label}</a>`
        : match,
  );
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/\n/g, "<br />");

  return html;
}

/** Un paragraphe par bloc separe d'une ligne vide. */
export function renderRestrictedMarkdown(source: string): string {
  return source
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${renderInline(block)}</p>`)
    .join("");
}
