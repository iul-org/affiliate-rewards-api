/**
 * Email alerts via Resend.
 *
 * Alerting must never break the job it is reporting on, so every function
 * here swallows its own errors and returns a result object instead of
 * throwing. A failed email is logged, not escalated.
 */

function recipients(env) {
  return String(env.ALERT_TO || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

async function send(env, { subject, html }) {
  const to = recipients(env);

  if (!env.RESEND_API_KEY) {
    console.log("Alert skipped: no RESEND_API_KEY set.");
    return { sent: false, reason: "no api key" };
  }

  if (!to.length) {
    console.log("Alert skipped: no ALERT_TO set.");
    return { sent: false, reason: "no recipients" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.ALERT_FROM || "Affiliate Rewards <alerts@safermoney.org>",
        to,
        subject,
        html
      })
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("Alert send failed:", res.status, text.slice(0, 300));
      return { sent: false, reason: `${res.status} ${text.slice(0, 200)}` };
    }

    return { sent: true, to };
  } catch (err) {
    console.error("Alert send threw:", err.message);
    return { sent: false, reason: err.message };
  }
}

/* ------------------------------------------------------------------ */
/* templates                                                           */
/* ------------------------------------------------------------------ */

const WRAP = (title, accent, body) => `
<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
            background:#F6F5F1;padding:28px 16px;color:#16232B">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E4E2DA;
              border-radius:5px;overflow:hidden">
    <div style="background:#0B2C3D;padding:18px 24px">
      <div style="color:#fff;font-size:17px;font-weight:600">Affiliate Rewards</div>
      <div style="color:#9DB6C2;font-size:12px;margin-top:3px">IUL.org</div>
    </div>
    <div style="height:3px;background:${accent}"></div>
    <div style="padding:24px">
      <h1 style="margin:0 0 14px;font-size:19px;font-weight:600">${title}</h1>
      ${body}
    </div>
    <div style="padding:14px 24px;border-top:1px solid #EFEDE6;color:#6D7F8A;font-size:12px">
      Sent automatically by the affiliate rewards system.
    </div>
  </div>
</div>`;

const P = (text) =>
  `<p style="margin:0 0 12px;font-size:14.5px;line-height:1.55">${text}</p>`;

const BOX = (text) =>
  `<div style="background:#F6F5F1;border:1px solid #E4E2DA;border-radius:3px;
               padding:12px 14px;font-family:ui-monospace,Menlo,Consolas,monospace;
               font-size:12.5px;color:#16232B;word-break:break-word;margin:0 0 14px">${text}</div>`;

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ------------------------------------------------------------------ */
/* alerts                                                              */
/* ------------------------------------------------------------------ */

export async function alertSyncFailed(env, { error, stage }) {
  const when = new Date().toUTCString();

  return send(env, {
    subject: "Affiliate rewards: weekly run failed",
    html: WRAP(
      "The weekly run did not finish",
      "#A32C1E",
      P(`The scheduled job failed during <b>${esc(stage || "the weekly run")}</b>, so this week's leads have not been credited yet.`) +
        BOX(esc(error)) +
        P(`Attempted at ${esc(when)}.`) +
        P("The next scheduled run will attempt to fill any missed week automatically. If it fails again, the cause above needs fixing — an expired GoHighLevel token is the most common reason.")
    )
  });
}

export async function alertWeeklySummary(env, { sync, rewards, gaps, balances }) {
  const affiliates = rewards?.breakdown?.length || 0;
  const added = rewards?.breakdown?.reduce((a, b) => a + (b.leads_owed || 0), 0) || 0;

  const rows =
    (rewards?.breakdown || [])
      .map(
        (b) => `<tr>
          <td style="padding:7px 0;border-bottom:1px solid #EFEDE6">${esc(b.affiliate_name || "Unnamed")}</td>
          <td style="padding:7px 0;border-bottom:1px solid #EFEDE6;text-align:right">${b.active_subscriptions}</td>
          <td style="padding:7px 0;border-bottom:1px solid #EFEDE6;text-align:right"><b>${b.leads_owed}</b></td>
        </tr>`
      )
      .join("") ||
    `<tr><td colspan="3" style="padding:10px 0;color:#6D7F8A">No affiliates earned leads this week.</td></tr>`;

  const warnings = [];

  if (sync?.unlinked?.length) {
    warnings.push(
      `${sync.unlinked.length} referral code(s) have sales but no affiliate linked, so those sales are not being credited.`
    );
  }
  if (gaps?.filled) {
    warnings.push(
      `${gaps.filled} row(s) were backfilled for a previously missed week. Backfilled weeks are reconstructed from current subscriptions and may differ from what was actually active then.`
    );
  }

  return send(env, {
    subject: `Affiliate rewards: ${added} leads added this week`,
    html: WRAP(
      "This week's rewards have been calculated",
      "#1F9D55",
      P(`<b>${added}</b> leads were added across <b>${affiliates}</b> affiliate${affiliates === 1 ? "" : "s"}.`) +
        `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 16px">
          <tr>
            <th style="text-align:left;padding:0 0 7px;border-bottom:1px solid #E4E2DA;
                       font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#6D7F8A">Affiliate</th>
            <th style="text-align:right;padding:0 0 7px;border-bottom:1px solid #E4E2DA;
                       font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#6D7F8A">Active</th>
            <th style="text-align:right;padding:0 0 7px;border-bottom:1px solid #E4E2DA;
                       font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#6D7F8A">Leads</th>
          </tr>
          ${rows}
        </table>` +
        (balances
          ? P(`Total still owed across everyone: <b>${balances.balance}</b> leads (${balances.leads_owed} earned, ${balances.leads_delivered} delivered).`)
          : "") +
        (warnings.length
          ? `<div style="background:#FDF6EC;border:1px solid #F0DCC0;border-radius:3px;
                        padding:12px 14px;font-size:13.5px;line-height:1.5">
               <b>Needs attention</b><ul style="margin:7px 0 0;padding-left:18px">
               ${warnings.map((w) => `<li style="margin-bottom:5px">${esc(w)}</li>`).join("")}
               </ul></div>`
          : "") +
        P(`<span style="color:#6D7F8A;font-size:13px">${sync?.scanned || 0} subscriptions scanned in GoHighLevel.</span>`)
    )
  });
}

export async function alertTest(env) {
  return send(env, {
    subject: "Affiliate rewards: test alert",
    html: WRAP(
      "Alerts are working",
      "#1F9D55",
      P("This is a test message. If you are reading it, failure alerts and weekly summaries will reach this address.") +
        P(`Sent ${esc(new Date().toUTCString())}.`)
    )
  });
}
