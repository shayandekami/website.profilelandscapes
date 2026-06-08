type Props = { html?: string };

/**
 * Renders editor-supplied HTML (from the rich text editor in the admin).
 * IMPORTANT: HTML must be sanitised on the server before storing. The
 * admin save endpoint runs DOMPurify (Phase 2) before persisting.
 */
export function Rich({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  if (!p.html) return null;
  return (
    <section className="rich-section">
      <div className="wrap">
        <div className="rich-body" dangerouslySetInnerHTML={{ __html: p.html }} />
      </div>
    </section>
  );
}
