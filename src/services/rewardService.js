import { getSupabase } from "../providers/supabase.js";

// Monday-to-Sunday week containing the given date
function getWeekBounds(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay();               // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;   // shift back to Monday

  const start = new Date(d);
  start.setUTCDate(d.getUTCDate() + diff);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  return {
    week_start: start.toISOString().slice(0, 10),
    week_end: end.toISOString().slice(0, 10)
  };
}

export async function calculateWeeklyRewards(env, { dryRun = false } = {}) {
  const supabase = getSupabase(env);
  const { week_start, week_end } = getWeekBounds();

  // 1. active subscriptions with their affiliate + product
  const { data: subs, error: subError } = await supabase
    .from("subscriptions")
    .select("id, ghl_product_id, status, affiliate_id, affiliates(affiliate_id)")
    .eq("status", "active");

  if (subError) throw new Error("Subscriptions read: " + subError.message);

  // 2. product -> weekly_leads lookup
  const { data: rules, error: ruleError } = await supabase
    .from("reward_rules")
    .select("weekly_leads, active, products(ghl_product_id)")
    .eq("active", true);

  if (ruleError) throw new Error("Reward rules read: " + ruleError.message);

  const leadsByProduct = {};
  for (const r of rules || []) {
    const pid = r.products?.ghl_product_id;
    if (pid) leadsByProduct[pid] = r.weekly_leads;
  }

  // 3. group by affiliate
  const totals = {};
  const skipped = [];

  for (const s of subs || []) {
    if (!s.affiliate_id) continue;

    const leads = leadsByProduct[s.ghl_product_id];
    if (leads === undefined) {
      skipped.push(s.ghl_product_id);
      continue;
    }

    if (!totals[s.affiliate_id]) {
      totals[s.affiliate_id] = {
        code: s.affiliates?.affiliate_id || null,
        active_subscriptions: 0,
        leads_owed: 0
      };
    }

    totals[s.affiliate_id].active_subscriptions++;
    totals[s.affiliate_id].leads_owed += leads;
  }

  const breakdown = Object.entries(totals).map(([affiliate_id, t]) => ({
    affiliate_id,
    affiliate_code: t.code,
    active_subscriptions: t.active_subscriptions,
    leads_owed: t.leads_owed
  }));

  if (dryRun) {
    return { week_start, week_end, dryRun: true, breakdown, skippedProducts: [...new Set(skipped)] };
  }

  // 4. write the ledger, preserving leads already delivered
  if (breakdown.length) {
    const { data: existing } = await supabase
      .from("weekly_rewards")
      .select("affiliate_id, leads_delivered")
      .eq("week_start", week_start);

    const deliveredMap = {};
    for (const row of existing || []) {
      deliveredMap[row.affiliate_id] = row.leads_delivered || 0;
    }

    const rows = breakdown.map((b) => {
      const delivered = deliveredMap[b.affiliate_id] || 0;
      return {
        week_start,
        week_end,
        affiliate_id: b.affiliate_id,
        active_subscriptions: b.active_subscriptions,
        leads_owed: b.leads_owed,
        leads_delivered: delivered,
        leads_balance: b.leads_owed - delivered,
        calculated_at: new Date().toISOString()
      };
    });

    const { error } = await supabase
      .from("weekly_rewards")
      .upsert(rows, { onConflict: "week_start,affiliate_id" });

    if (error) throw new Error("Weekly rewards upsert: " + error.message);
  }

  return {
    week_start,
    week_end,
    affiliates: breakdown.length,
    breakdown,
    skippedProducts: [...new Set(skipped)]
  };
}