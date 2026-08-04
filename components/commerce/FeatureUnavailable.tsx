import Link from "next/link";

export function FeatureUnavailable({ title, eyebrow, body }: { title: string; eyebrow: string; body: string }) {
  return (
    <section className="feature-unavailable">
      <div className="feature-unavailable-mark" aria-hidden="true">P</div>
      <p>{eyebrow}</p>
      <h1>{title}</h1>
      <div className="feature-unavailable-rule" />
      <span>{body}</span>
      <div>
        <Link href="/contact">Contact the team →</Link>
        <Link href="/">Return home</Link>
      </div>
    </section>
  );
}
