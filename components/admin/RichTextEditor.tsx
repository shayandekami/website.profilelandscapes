"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight WYSIWYG editor (contentEditable + toolbar), no dependency.
 * Emits HTML via onChange; the server sanitises with sanitizeHtml() before
 * persisting. Toolbar: paragraph/H2/H3, bold, italic, lists, link, clear.
 */
export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  // Seed the editable div once (and when the external value changes while blurred).
  useEffect(() => {
    if (ref.current && !focused && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value, focused]);

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function cmd(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  }

  function makeLink() {
    const url = window.prompt("Link URL (https://…)");
    if (url == null) return;
    if (url === "") cmd("unlink");
    else cmd("createLink", url);
  }

  const Btn = ({ on, label, title }: { on: () => void; label: string; title: string }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); on(); }}
      style={{ minWidth: 30, height: 28, border: "1px solid var(--line,#d1d5db)", background: "#fff", borderRadius: 5, cursor: "pointer", fontSize: 13, color: "var(--ink,#133024)", fontFamily: "inherit" }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ border: "1px solid var(--line,#d1d5db)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", padding: 8, borderBottom: "1px solid var(--line,#eee)", background: "var(--bone,#f4efe4)" }}>
        <Btn on={() => cmd("formatBlock", "P")} label="¶" title="Paragraph" />
        <Btn on={() => cmd("formatBlock", "H2")} label="H2" title="Heading 2" />
        <Btn on={() => cmd("formatBlock", "H3")} label="H3" title="Heading 3" />
        <span style={{ width: 1, background: "var(--line,#d1d5db)", margin: "0 3px" }} />
        <Btn on={() => cmd("bold")} label="B" title="Bold" />
        <Btn on={() => cmd("italic")} label="I" title="Italic" />
        <span style={{ width: 1, background: "var(--line,#d1d5db)", margin: "0 3px" }} />
        <Btn on={() => cmd("insertUnorderedList")} label="• List" title="Bullet list" />
        <Btn on={() => cmd("insertOrderedList")} label="1. List" title="Numbered list" />
        <Btn on={() => cmd("formatBlock", "BLOCKQUOTE")} label="❝" title="Quote" />
        <span style={{ width: 1, background: "var(--line,#d1d5db)", margin: "0 3px" }} />
        <Btn on={makeLink} label="🔗" title="Link" />
        <Btn on={() => cmd("removeFormat")} label="✕" title="Clear formatting" />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); emit(); }}
        style={{ minHeight: 160, padding: "14px 16px", fontSize: 15, lineHeight: 1.6, color: "var(--ink,#133024)", outline: "none" }}
      />
    </div>
  );
}
