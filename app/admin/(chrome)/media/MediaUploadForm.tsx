"use client";

import { useState, useRef } from "react";

export default function MediaUploadForm() {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setMessage("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("done");
        setMessage(`Uploaded: ${data.filename}`);
        // Reload to show new item in grid
        setTimeout(() => window.location.reload(), 800);
      } else {
        setStatus("error");
        setMessage(data.error ?? "Upload failed");
      }
    } catch {
      setStatus("error");
      setMessage("Network error — please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        required
        style={{ fontSize: 14 }}
      />
      <button
        type="submit"
        className="btn-primary"
        disabled={status === "uploading"}
        style={{ minWidth: 120 }}
      >
        {status === "uploading" ? "Uploading…" : "Upload"}
      </button>
      {message && (
        <span
          style={{
            fontSize: 13,
            color: status === "error" ? "var(--red, #c00)" : "var(--accent, #1f5a3d)",
          }}
        >
          {message}
        </span>
      )}
    </form>
  );
}
