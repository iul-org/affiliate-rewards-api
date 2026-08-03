import { Hono } from "hono";
import { getSupabase } from "./providers/supabase.js";
import { listSubscriptions, listAffiliates, listCampaigns } from "./providers/ghl.js";
import { surveySubscriptions } from "./routes/survey.js";
import { runSync, getUnlinkedCodes } from "./services/syncService.js";
import { calculateWeeklyRewards } from "./services/rewardService.js";
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
    return c.json({ success: true, data: await getAffiliates(c.env) });
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
        try {
          const sync = await runSync(env);
          console.log("Cron sync complete:", JSON.stringify(sync));

          const rewards = await calculateWeeklyRewards(env);
          console.log("Cron rewards complete:", JSON.stringify(rewards));
        } catch (err) {
          console.error("Cron failed:", err.message);
        }
      })()
    );
  }
};
