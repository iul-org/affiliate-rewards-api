import { getSupabase } from "../providers/supabase.js";

/* ------------------------------------------------------------------ */
/* week helpers                                                        */
/* ------------------------------------------------------------------ */

// Monday-to-Sunday week containing the given date
export function getWeekBounds(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay();               // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;   // shift back to Monday

  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  start.setUTCDate(start.getUTCDate() + diff);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  return {
    week_start: start.toISOString().slice(0, 10),
    week_end: end.toISOString().slice(0, 10)
  };
}

function previousWeek(weekStart) {
  const d = new Date(weekStart + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 7);
  return getWeekBounds(d);
}

/* ------------------------------------------------------------------ */
/* shared calculation                                                  */
/* ------------------------------------------------------------------ */

async function buildBreakdown(supabase) {
  const { data: subs, error: subError } = await supabase
    .from("subscriptions")
    .select("id, ghl_product_id, status, affiliate_id, affiliates(name, referral_code)")
    .eq("status", "active");

  if (subError) throw new Error("Subscriptions read: " + subError.message);

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
        name: s.affiliates?.name || s.affiliates?.referral_code || null,
        active_subscriptions: 0,
        leads_owed: 0
      };
    }

    totals[s.affiliate_id].active_subscriptions++;
    totals[s.affiliate_id].leads_owed += leads;
  }

  const breakdown = Object.entries(totals).map(([affiliate_id, t]) => ({
    affiliate_id,
    affiliate_name: t.name,
    active_subscriptions: t.active_subscriptions,
    leads_owed: t.leads_owed
  }));

  return { breakdown, skipped: [...new Set(skipped)] };
}

async function writeWeek(supabase, week, breakdown, { backfilled = false } = {}) {
  if (!breakdown.length) return 0;

  const rows = breakdown.map((b) => ({
    week_start: week.week_start,
    week_end: week.week_end,
    affiliate_id: b.affiliate_id,
    active_subscriptions: b.active_subscriptions,
    leads_owed: b.leads_owed,
    calculated_at: new Date().toISOString(),
    backfilled
  }));

  const { error } = await supabase
    .from("weekly_rewards")
    .upsert(rows, { onConflict: "week_start,affiliate_id" });

  if (error) throw new Error("Weekly rewards upsert: " + error.message);

  return rows.length;
}

/* ------------------------------------------------------------------ */
/* current week                                                        */
/* ------------------------------------------------------------------ */

export async function calculateWeeklyRewards(env, { dryRun = false } = {}) {
  const supabase = getSupabase(env);
  const week = getWeekBounds();

  const { breakdown, skipped } = await buildBreakdown(supabase);

  if (dryRun) {
    return {
      week_start: week.week_start,
      week_end: week.week_end,
      dryRun: true,
      breakdown,
      skippedProducts: skipped
    };
  }

  await writeWeek(supabase, week, breakdown);

  return {
    week_start: week.week_start,
    week_end: week.week_end,
    affiliates: breakdown.length,
    breakdown,
    skippedProducts: skipped
  };
}

/* ------------------------------------------------------------------ */
/* gap detection + backfill                                            */
/* ------------------------------------------------------------------ */

/**
 * Walks back from this week to the first week ever recorded and reports any
 * week with no rows at all. A week can only be missing if the scheduled run
 * did not happen, so each gap is a week of leads nobody was credited for.
 */
export async function findMissingWeeks(env) {
  const supabase = getSupabase(env);

  const { data: weeks, error } = await supabase
    .from("weekly_rewards")
    .select("week_start")
    .order("week_start", { ascending: true });

  if (error) throw new Error("Weekly rewards read: " + error.message);

  if (!weeks || !weeks.length) {
    return { missing: [], firstWeek: null, checked: 0 };
  }

  const present = new Set(weeks.map((w) => w.week_start));
  const firstWeek = weeks[0].week_start;

  const missing = [];
  let cursor = getWeekBounds();
  let guard = 0;

  while (cursor.week_start >= firstWeek && guard < 260) {
    if (!present.has(cursor.week_start)) missing.push(cursor);
    cursor = previousWeek(cursor.week_start);
    guard++;
  }

  return { missing: missing.reverse(), firstWeek, checked: guard };
}

/**
 * Fills any missing week using today's active subscriptions. That is a
 * reconstruction, not a replay: we do not keep a history of what was active
 * in the past, so a backfilled week can differ from what the live run would
 * have produced. Rows are flagged so the difference stays visible.
 */
export async function backfillMissingWeeks(env, { dryRun = false } = {}) {
  const supabase = getSupabase(env);

  const { missing, firstWeek } = await findMissingWeeks(env);

  if (!missing.length) {
    return { filled: 0, weeks: [], firstWeek, note: "No gaps found." };
  }

  if (dryRun) {
    return {
      dryRun: true,
      firstWeek,
      weeks: missing,
      note: `${missing.length} week(s) would be reconstructed from today's active subscriptions.`
    };
  }

  const { breakdown } = await buildBreakdown(supabase);

  let filled = 0;
  for (const week of missing) {
    filled += await writeWeek(supabase, week, breakdown, { backfilled: true });
  }

  return {
    filled,
    weeks: missing,
    firstWeek,
    note: "Backfilled weeks are reconstructed from current subscriptions and flagged in the database."
  };
}
