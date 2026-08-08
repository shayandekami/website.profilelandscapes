import { getPublicSiteUrl } from "@/lib/content";

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
const shell = (title: string, body: string) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
    <div style="background:#133024;color:#fff;padding:18px 24px;border-radius:8px 8px 0 0"><strong style="font-size:18px">Profile Landscapes</strong></div>
    <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <h1 style="font-size:20px;margin:0 0 14px">${title}</h1>${body}
      <p style="font-size:12px;color:#6b7280;margin-top:24px;border-top:1px solid #eee;padding-top:14px">Profile Landscapes · 16 New Canterbury Rd, Petersham NSW 2049 · (02) 9568 5868</p>
    </div></div>`;

export async function notifyCustomerQuoteAck(opts: { ref: string; name: string; email: string; token?: string; origin?: string }) {
  const base = await getPublicSiteUrl(opts.origin);
  const tracker = `${base}/quote/${encodeURIComponent(opts.ref)}${opts.token ? `?token=${encodeURIComponent(opts.token)}` : ""}`;
  await sendEmail({
    to: opts.email,
    subject: `We've received your enquiry — ${opts.ref}`,
    html: shell("Thanks — we've got it.", `
      <p>Hi ${esc(opts.name.split(" ")[0] || "there")},</p>
      <p>We've received your enquiry and will be in touch within two business days. Your reference is
      <strong>${esc(opts.ref)}</strong> — track it any time at
      <a href="${tracker}">our quote tracker</a>.</p>
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

/**
 * Acknowledge a new trade-account application. Accounts are created PENDING and a
 * staff member sets the pricing tier, so this must not claim the account is live.
 */
export async function notifyTradeWelcome(opts: { email: string; company?: string | null; origin?: string }) {
  const base = await getPublicSiteUrl(opts.origin);
  await sendEmail({
    to: opts.email,
    subject: "We've received your Profile Landscapes trade application",
    html: shell("Trade application received", `
      <p>Thanks — we've received your trade account application${opts.company ? ` for <strong>${esc(opts.company)}</strong>` : ""}.</p>
      <p>Our team reviews new accounts (usually within one business day) and sets your
      pricing tier. We'll email you as soon as it's approved, and your rates will apply
      automatically at the pricelist and checkout when you log in.</p>
      <p>In the meantime you can <a href="${base}/plants">browse the range</a> or
      <a href="${base}/quote">request a quote</a>.</p>`),
  });
}

/** Alert staff that a trade account is waiting for approval. */
export async function notifyTradeApplicationStaff(opts: {
  email: string; company?: string | null; contactName?: string | null; phone?: string | null; origin?: string;
}) {
  const staff = process.env.TRADE_NOTIFY_EMAIL || process.env.ORDER_NOTIFY_EMAIL || process.env.QUOTE_NOTIFY_EMAIL;
  if (!staff) return;
  const base = await getPublicSiteUrl(opts.origin);
  await sendEmail({
    to: staff,
    replyTo: opts.email,
    subject: `Trade account application — ${opts.company || opts.email}`,
    html: shell("New trade application", `
      <p>A new trade account is <strong>pending approval</strong>.</p>
      <ul>
        <li><strong>Company:</strong> ${esc(opts.company || "—")}</li>
        <li><strong>Contact:</strong> ${esc(opts.contactName || "—")}</li>
        <li><strong>Email:</strong> ${esc(opts.email)}</li>
        <li><strong>Phone:</strong> ${esc(opts.phone || "—")}</li>
      </ul>
      <p>Verify the business, then approve and set their pricing tier:
      <a href="${base}/admin/trade-accounts">Review trade accounts →</a></p>`),
  });
}

export async function notifyCareerApplication(opts: { name: string; email: string; reference: string; role: string; token: string; origin?: string }) {
  const base = await getPublicSiteUrl(opts.origin);
  const tracker = `${base}/careers/application/${encodeURIComponent(opts.token)}`;
  const html = shell("Application received", `
    <p>Hi ${esc(opts.name)},</p>
    <p>Thank you for applying for <strong>${esc(opts.role)}</strong>. Your reference is <strong>${esc(opts.reference)}</strong>.</p>
    <p>A member of our team will review your application within five business days. If there is a potential fit, the next step is usually a short phone conversation followed by a practical or team interview.</p>
    <p><a href="${tracker}">Track your application →</a></p>
    <p>Please keep that link private. It lets you view progress without creating an account.</p>`);
  await sendEmail({ to: opts.email, subject: `Application received — ${opts.reference}`, html });
  const staff = process.env.CAREERS_NOTIFY_EMAIL || process.env.QUOTE_NOTIFY_EMAIL;
  if (staff) {
    await sendEmail({
      to: staff,
      subject: `New career application: ${opts.role} — ${opts.name}`,
      html: shell("New career application", `<p><strong>${esc(opts.name)}</strong> applied for ${esc(opts.role)}.</p><p>Reference: ${esc(opts.reference)}</p><p><a href="${base}/admin/applicants">Open candidate inbox →</a></p>`),
      replyTo: opts.email,
    });
  }
}

export async function notifyCareerStatus(opts: { name: string; email: string; reference: string; statusLabel: string; message?: string | null; token: string; origin?: string }) {
  const base = await getPublicSiteUrl(opts.origin);
  await sendEmail({
    to: opts.email,
    subject: `Application update — ${opts.reference}`,
    html: shell("Your application has been updated", `
      <p>Hi ${esc(opts.name)},</p>
      <p>Your application status is now <strong>${esc(opts.statusLabel)}</strong>.</p>
      ${opts.message ? `<p>${esc(opts.message)}</p>` : ""}
      <p><a href="${base}/careers/application/${encodeURIComponent(opts.token)}">View your application progress →</a></p>`),
  });
}
