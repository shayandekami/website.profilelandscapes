"use client";

import { useState } from "react";

export default function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        marginLeft: 12,
        fontSize: 11.5,
        background: "none",
        border: "none",
        color: copied ? "var(--accent, #1f5a3d)" : "var(--muted)",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {copied ? "Copied!" : "Copy URL"}
    </button>
  );
}
