import { Hono } from "hono";
import { getSupabase } from "./providers/supabase.js";
import { listSubscriptions, listAffiliates, listCampaigns } from "./providers/ghl.js";
import { surveySubscriptions } from "./routes/survey.js";
import { runSync, getUnlinkedCodes } from "./services/syncService.js";
import {
  calculateWeeklyRewards,
  findMissingWeeks,
  backfillMissingWeeks
} from "./services/rewardService.js";
import {
  getOverview,
  getAffiliates,
  getAffiliateDetail,
  getActivity,
  getDeliveries,
  recordDelivery,
  deleteDelivery,
  linkReferralCode,
  unlinkReferralCode
} from "./services/dashboardService.js";
import {
  alertSyncFailed,
  alertWeeklySummary,
  alertTest
} from "./providers/alerts.js";
import {
  recordDeliveryEvent,
  getDeliveryEvents,
  getDeliveryStats
} from "./services/deliveryEvents.js";
import { dashboardHtml } from "./dashboard.js";

const app = new Hono();

function requireSecret(c) {
  const provided =
    c.req.query("secret") ||
    (c.req.header("authorization") || "").replace("Bearer ", "");

  if (!c.env.SYNC_SECRET || provided !== c.env.SYNC_SECRET) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  return null;
}

/* ---------------- public ---------------- */

app.get("/", (c) => {
  return c.json({ success: true, message: "Affiliate Rewards API Running" });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/dashboard", (c) => {
  return c.html(dashboardHtml);
});

app.get("/test-db", async (c) => {
  const supabase = getSupabase(c.env);

  const { data, error } = await supabase.from("settings").select("*").limit(5);

  if (error) return c.json({ success: false, error: error.message }, 500);

  return c.json({ success: true, rows: data });
});

/* ---------------- diagnostics ---------------- */

app.get("/test-ghl", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const result = await listSubscriptions(c.env, { limit: 5 });

    const preview = (result.data || []).map((s) => ({
      subscriptionId: s._id,
      contactName: s.contactName,
      status: s.status,
      amount: s.amount,
      product: s.recurringProduct?.product?.name || null,
      referralCode: s.entitySourceMeta?.affiliateManager?.id || null,
      startedAt: s.subscriptionStartDate
    }));

    return c.json({
      success: true,
      totalCount: result.totalCount,
      returned: preview.length,
      subscriptions: preview
    });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/test-affiliates", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const supabase = getSupabase(c.env);
    const { data: setting } = await supabase
      .from("settings")
      .select("setting_value")
      .eq("setting_key", "lead_payout_campaign_id")
      .maybeSingle();

    const result = await listAffiliates(c.env, {
      campaignId: setting?.setting_value
    });

    return c.json({ success: true, raw: result });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/test-campaigns", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const result = await listCampaigns(c.env);

    const preview = (result.campaigns || []).map((x) => ({
      id: x._id,
      name: x.name,
      affiliates: (x.affiliates || []).length,
      leads: x.leads,
      link: x.referralRealLink
    }));

    return c.json({ success: true, campaigns: preview });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/test-alert", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const result = await alertTest(c.env);
    return c.json({ success: true, ...result });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/survey", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const result = await surveySubscriptions(c.env);
    return c.json({ success: true, ...result });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

/* ---------------- sync + rewards ---------------- */

app.get("/sync", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const result = await runSync(c.env);
    return c.json({ success: true, ...result });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/rewards/preview", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const result = await calculateWeeklyRewards(c.env, { dryRun: true });
    return c.json({ success: true, ...result });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/rewards/calculate", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const result = await calculateWeeklyRewards(c.env);
    return c.json({ success: true, ...result });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/rewards/gaps", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    return c.json({ success: true, ...(await findMissingWeeks(c.env)) });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/rewards/backfill", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const dryRun = c.req.query("confirm") !== "yes";
    return c.json({
      success: true,
      ...(await backfillMissingWeeks(c.env, { dryRun }))
    });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

/* ---------------- twyne webhook ---------------- */

async function checkWebhookToken(c) {
  const supabase = getSupabase(c.env);

  const { data } = await supabase
    .from("settings")
    .select("setting_value")
    .eq("setting_key", "twyne_webhook_token")
    .maybeSingle();

  const expected = data?.setting_value;
  const given = c.req.param("token");

  if (!expected || given !== expected) {
    return c.json({ success: false, error: "Invalid webhook token" }, 401);
  }

  return null;
}

// Some platforms verify an endpoint with a GET before allowing a POST.
app.get("/hooks/twyne/:token", async (c) => {
  const bad = await checkWebhookToken(c); if (bad) return bad;

  return c.json({
    success: true,
    message: "Webhook is live. Send delivery notifications here as POST with a JSON body."
  });
});

app.post("/hooks/twyne/:token", async (c) => {
  const bad = await checkWebhookToken(c); if (bad) return bad;

  let payload;

  try {
    payload = await c.req.json();
  } catch (err) {
    // fall back to form encoding, which some senders use by default
    try {
      const form = await c.req.parseBody();
      payload = { ...form };
    } catch (err2) {
      return c.json(
        { success: false, error: "Could not read the body as JSON or form data." },
        400
      );
    }
  }

  try {
    const result = await recordDeliveryEvent(c.env, payload, { source: "twyne" });
    return c.json({ success: true, ...result });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/api/delivery-events", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    return c.json({
      success: true,
      stats: await getDeliveryStats(c.env),
      data: await getDeliveryEvents(c.env)
    });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

/* ---------------- dashboard api ---------------- */

app.get("/api/overview", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    return c.json({ success: true, data: await getOverview(c.env) });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/api/affiliates", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const includeRemoved = c.req.query("includeRemoved") === "yes";
    return c.json({
      success: true,
      data: await getAffiliates(c.env, { includeRemoved })
    });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/api/affiliates/:id", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    return c.json({
      success: true,
      data: await getAffiliateDetail(c.env, c.req.param("id"))
    });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/api/unlinked", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    return c.json({ success: true, data: await getUnlinkedCodes(c.env) });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post("/api/link", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const body = await c.req.json();
    return c.json({ success: true, data: await linkReferralCode(c.env, body) });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.delete("/api/link/:id", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    return c.json({
      success: true,
      data: await unlinkReferralCode(c.env, c.req.param("id"))
    });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/api/activity", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    return c.json({ success: true, data: await getActivity(c.env) });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/api/deliveries", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    return c.json({ success: true, data: await getDeliveries(c.env) });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post("/api/deliveries", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const body = await c.req.json();
    return c.json({ success: true, data: await recordDelivery(c.env, body) });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.delete("/api/deliveries/:id", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    return c.json({
      success: true,
      data: await deleteDelivery(c.env, c.req.param("id"))
    });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

/* ---------------- cron ---------------- */

export default {
  fetch: app.fetch,

  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      (async () => {
        let stage = "sync";

        try {
          const sync = await runSync(env);
          console.log("Cron sync complete:", JSON.stringify(sync));

          stage = "backfill";
          const gaps = await backfillMissingWeeks(env);
          if (gaps.filled) {
            console.log("Cron backfilled missing weeks:", JSON.stringify(gaps));
          }

          stage = "reward calculation";
          const rewards = await calculateWeeklyRewards(env);
          console.log("Cron rewards complete:", JSON.stringify(rewards));

          stage = "summary";
          let balances = null;
          try {
            const overview = await getOverview(env);
            balances = overview.lifetime;
          } catch (err) {
            console.error("Could not load balances for summary:", err.message);
          }

          const mail = await alertWeeklySummary(env, { sync, rewards, gaps, balances });
          console.log("Cron summary email:", JSON.stringify(mail));
        } catch (err) {
          console.error("Cron failed during " + stage + ":", err.message);

          const mail = await alertSyncFailed(env, { error: err.message, stage });
          console.log("Cron failure email:", JSON.stringify(mail));
        }
      })()
    );
  }
};
