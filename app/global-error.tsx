"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "-apple-system, Segoe UI, Roboto, sans-serif", padding: "80px 24px", maxWidth: 640, margin: "0 auto", color: "#133024" }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ color: "#3c554a", marginBottom: 24 }}>Please try again. If the problem persists, call us on (02) 9568 5868.</p>
        <button onClick={reset} style={{ padding: "12px 22px", borderRadius: 999, background: "#133024", color: "#fff", border: "none", fontSize: 15, cursor: "pointer" }}>Try again</button>
        {error?.digest && <p style={{ marginTop: 20, fontSize: 12, color: "#9ca3af" }}>Ref: {error.digest}</p>}
      </body>
    </html>
  );
}
