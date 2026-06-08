/**
 * Tiny Resend wrapper. If RESEND_API_KEY is unset, falls back to console.log
 * so local dev still works without an account.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.QUOTE_FROM_EMAIL || "Profile Landscapes <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("[email:dev]", { to: opts.to, subject: opts.subject, text: opts.text.slice(0, 200) });
    return { ok: true, dev: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      reply_to: opts.replyTo,
    }),
  });
  if (!res.ok) {
    console.error("[email] resend failed", res.status, await res.text());
    return { ok: false };
  }
  return { ok: true };
}
