import { calculateWeeklyRewards } from "./services/rewardService.js";
import { runSync } from "./services/syncService.js";
import { surveySubscriptions } from "./routes/survey.js";
import { Hono } from "hono";
import { getSupabase } from "./providers/supabase.js";
import { listSubscriptions } from "./providers/ghl.js";

const app = new Hono();

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
  try {
    const result = await surveySubscriptions(c.env);
    return c.json({ success: true, ...result });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/sync", async (c) => {
  try {
    const result = await runSync(c.env);
    return c.json({ success: true, ...result });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
app.get("/rewards/preview", async (c) => {
  try {
    const result = await calculateWeeklyRewards(c.env, { dryRun: true });
    return c.json({ success: true, ...result });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get("/rewards/calculate", async (c) => {
  try {
    const result = await calculateWeeklyRewards(c.env);
    return c.json({ success: true, ...result });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
export default app;