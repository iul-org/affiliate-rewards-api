import { Hono } from "hono";
import { getSupabase } from "./providers/supabase.js";
import { listSubscriptions } from "./providers/ghl.js";
import { surveySubscriptions } from "./routes/survey.js";
import { runSync } from "./services/syncService.js";
import { calculateWeeklyRewards } from "./services/rewardService.js";
import {
  getOverview,
  getAffiliates,
  getAffiliateDetail,
  getActivity,
  markDelivered
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

app.get("/", (c) => {
  return c.json({
    success: true,
    message: "Affiliate Rewards API Running"
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.get("/dashboard", (c) => {
  return c.html(dashboardHtml);
});

app.get("/test-db", async (c) => {
  const supabase = getSupabase(c.env);

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .limit(5);

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({ success: true, rows: data });
});

app.get("/test-ghl", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const result = await listSubscriptions(c.env, { limit: 5 });

    const preview = (result.data || []).map((s) => ({
      subscriptionId: s._id,
      contactId: s.contactId,
      contactName: s.contactName,
      status: s.status,
      amount: s.amount,
      product: s.recurringProduct?.product?.name || null,
      productId: s.recurringProduct?.product?._id || null,
      affiliate: s.entitySourceMeta?.affiliateManager?.id || null,
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

app.get("/survey", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const result = await surveySubscriptions(c.env);
    return c.json({ success: true, ...result });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

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

app.get("/api/activity", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    return c.json({ success: true, data: await getActivity(c.env) });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post("/api/rewards/delivered", async (c) => {
  const auth = requireSecret(c); if (auth) return auth;

  try {
    const body = await c.req.json();
    return c.json({ success: true, data: await markDelivered(c.env, body) });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

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
