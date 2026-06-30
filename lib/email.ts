/**
 * Tiny Resend wrapper. If RESEND_API_KEY is unset, falls back to console.log
 * so local dev still works without an account.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.QUOTE_FROM_EMAIL || "Profile Landscapes <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("[email:dev]", { to: opts.to, subject: opts.subject });
    return { ok: true, dev: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        ...(opts.text ? { text: opts.text } : {}),
        ...(opts.html ? { html: opts.html } : {}),
        reply_to: opts.replyTo,
      }),
    });
    if (!res.ok) {
      console.error("[email] resend failed", res.status, await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false };
  }
}

// ---- HTML notifications (a failed email must never break a flow) ----
const esc = (s: string) => String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
const SITE = process.env.NEXT_PUBLIC_URL || "";
const shell = (title: string, body: string) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
    <div style="background:#133024;color:#fff;padding:18px 24px;border-radius:8px 8px 0 0"><strong style="font-size:18px">Profile Landscapes</strong></div>
    <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <h1 style="font-size:20px;margin:0 0 14px">${title}</h1>${body}
      <p style="font-size:12px;color:#6b7280;margin-top:24px;border-top:1px solid #eee;padding-top:14px">Profile Landscapes · 16 New Canterbury Rd, Petersham NSW 2049 · (02) 9568 5868</p>
    </div></div>`;

export async function notifyCustomerQuoteAck(opts: { ref: string; name: string; email: string }) {
  await sendEmail({
    to: opts.email,
    subject: `We've received your enquiry — ${opts.ref}`,
    html: shell("Thanks — we've got it.", `
      <p>Hi ${esc(opts.name.split(" ")[0] || "there")},</p>
      <p>We've received your enquiry and will be in touch within two business days. Your reference is
      <strong>${esc(opts.ref)}</strong> — track it any time at
      <a href="${SITE}/quote/${esc(opts.ref)}">our quote tracker</a>.</p>
      <p>If it's urgent, call (02) 9568 5868.</p>`),
  });
}

export async function notifyOrder(opts: { orderNumber: string; name: string; email: string; totalCents: number; lines: { name: string; quantity: number; priceCents: number }[] }) {
  const rows = opts.lines.map((l) => `<tr><td style="padding:6px 0">${esc(l.name)} × ${l.quantity}</td><td style="padding:6px 0;text-align:right">$${((l.priceCents * l.quantity) / 100).toFixed(2)}</td></tr>`).join("");
  const html = shell("Order confirmed", `
    <p>Hi ${esc(opts.name.split(" ")[0] || "there")}, thanks for your order <strong>${esc(opts.orderNumber)}</strong>.</p>
    <table style="width:100%;font-size:14px;border-collapse:collapse">${rows}
      <tr><td style="padding-top:10px;border-top:1px solid #eee"><strong>Total</strong></td><td style="padding-top:10px;border-top:1px solid #eee;text-align:right"><strong>$${(opts.totalCents / 100).toFixed(2)}</strong></td></tr>
    </table><p style="margin-top:16px">We'll email again when it's ready.</p>`);
  await sendEmail({ to: opts.email, subject: `Order confirmed — ${opts.orderNumber}`, html });
  const staff = process.env.ORDER_NOTIFY_EMAIL;
  if (staff) await sendEmail({ to: staff, subject: `New order ${opts.orderNumber} — $${(opts.totalCents / 100).toFixed(2)}`, html });
}

export async function notifyTradeWelcome(opts: { email: string; company?: string | null }) {
  await sendEmail({
    to: opts.email,
    subject: "Your Profile Landscapes trade account",
    html: shell("Welcome to trade", `
      <p>Your trade account${opts.company ? ` for <strong>${esc(opts.company)}</strong>` : ""} is active.</p>
      <p>Trade rates now apply across the nursery, pricelist and checkout when you're logged in.
      <a href="${SITE}/plants/pricelist">Browse the pricelist →</a></p>`),
  });
}
