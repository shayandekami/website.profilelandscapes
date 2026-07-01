/**
 * Dependency-free HTML sanitizer for rich-text content produced by the admin
 * editor. Admins are authenticated/trusted, so this is defence-in-depth: it
 * allowlists a small set of formatting tags, strips everything else to plain
 * text, removes all attributes except safe links, and neutralises script/style/
 * iframe/on*-handlers/javascript: URLs. Run on the SERVER before persisting.
 */

const ALLOWED = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "h2", "h3", "h4", "ul", "ol", "li", "a", "blockquote", "span",
]);

export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return "";
  let out = String(html);

  // 1. Remove dangerous elements *including* their contents.
  out = out.replace(/<(script|style|iframe|object|embed|form|noscript)\b[\s\S]*?<\/\1>/gi, "");
  // 2. Remove stray dangerous / metadata tags (void or unclosed).
  out = out.replace(/<\/?(script|style|iframe|object|embed|form|link|meta|base|noscript)\b[^>]*>/gi, "");

  // 3. Walk remaining tags: keep the allowlist (scrubbing attributes), drop the
  //    rest but keep their inner text.
  out = out.replace(/<(\/?)([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (_m, slash: string, tag: string, attrs: string) => {
    const t = tag.toLowerCase();
    if (!ALLOWED.has(t)) return "";
    if (slash) return `</${t}>`;
    if (t === "a") {
      const m = /href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
      let url = m ? (m[2] ?? m[3] ?? m[4] ?? "") : "";
      if (/^\s*(javascript|data|vbscript):/i.test(url)) url = "";
      return url ? `<a href="${url.replace(/"/g, "&quot;")}" rel="noopener noreferrer">` : "<a>";
    }
    return `<${t}>`;
  });

  // 4. Belt-and-braces: strip any lingering inline event handlers.
  out = out.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  return out.trim();
}
