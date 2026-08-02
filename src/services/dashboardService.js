import { getSupabase } from "../providers/supabase.js";

export async function getOverview(env) {
  const supabase = getSupabase(env);

  const { data: subs, error: subError } = await supabase
    .from("subscriptions")
    .select("status, amount, affiliate_id");

  if (subError) throw new Error("Subscriptions: " + subError.message);

  const statusCounts = {};
  let activeRevenue = 0;

  for (const s of subs || []) {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
    if (s.status === "active") activeRevenue += Number(s.amount || 0);
  }

  const { count: affiliateCount } = await supabase
    .from("affiliates")
    .select("*", { count: "exact", head: true });

  const { data: allWeeks } = await supabase
    .from("weekly_rewards")
    .select("week_start, week_end, leads_owed, leads_delivered, leads_balance")
    .order("week_start", { ascending: false })
    .limit(500);

  const weekStart = allWeeks?.[0]?.week_start || null;
  const thisWeek = (allWeeks || []).filter((r) => r.week_start === weekStart);

  // roll every week up into a single trend series
  const byWeek = {};
  for (const r of allWeeks || []) {
    if (!byWeek[r.week_start]) {
      byWeek[r.week_start] = {
        week_start: r.week_start,
        week_end: r.week_end,
        leads_owed: 0,
        leads_delivered: 0
      };
    }
    byWeek[r.week_start].leads_owed += r.leads_owed || 0;
    byWeek[r.week_start].leads_delivered += r.leads_delivered || 0;
  }

  const trend = Object.values(byWeek)
    .sort((a, b) => (a.week_start < b.week_start ? -1 : 1))
    .slice(-12);

  const { data: lastSync } = await supabase
    .from("sync_logs")
    .select("sync_started, sync_finished, status, records_processed, records_inserted, error_message")
    .order("sync_started", { ascending: false })
    .limit(1);

  return {
    affiliates: affiliateCount || 0,
    subscriptions: {
      total: (subs || []).length,
      active: statusCounts.active || 0,
      canceled: statusCounts.canceled || 0,
      other:
        (subs || []).length -
        (statusCounts.active || 0) -
        (statusCounts.canceled || 0)
    },
    activeWeeklyRevenue: activeRevenue,
    currentWeek: {
      week_start: weekStart,
      week_end: thisWeek[0]?.week_end || null,
      leads_owed: thisWeek.reduce((a, r) => a + (r.leads_owed || 0), 0),
      leads_delivered: thisWeek.reduce((a, r) => a + (r.leads_delivered || 0), 0),
      leads_balance: thisWeek.reduce((a, r) => a + (r.leads_balance || 0), 0)
    },
    trend,
    lastSync: lastSync?.[0] || null
  };
}

export async function getAffiliates(env) {
  const supabase = getSupabase(env);

  const { data: affiliates, error } = await supabase
    .from("affiliates")
    .select("id, affiliate_id, name, email, status, created_at");

  if (error) throw new Error("Affiliates: " + error.message);

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("affiliate_id, status, amount");

  const { data: rewards } = await supabase
    .from("weekly_rewards")
    .select("affiliate_id, week_start, leads_owed, leads_delivered, leads_balance")
    .order("week_start", { ascending: false });

  const latestWeek = rewards?.[0]?.week_start || null;

  return (affiliates || []).map((a) => {
    const mySubs = (subs || []).filter((s) => s.affiliate_id === a.id);
    const active = mySubs.filter((s) => s.status === "active");
    const current = (rewards || []).find(
      (r) => r.affiliate_id === a.id && r.week_start === latestWeek
    );

    const spark = (rewards || [])
      .filter((r) => r.affiliate_id === a.id)
      .sort((x, y) => (x.week_start < y.week_start ? -1 : 1))
      .slice(-10)
      .map((r) => r.leads_owed || 0);

    return {
      id: a.id,
      code: a.affiliate_id,
      name: a.name,
      email: a.email,
      status: a.status,
      total_referrals: mySubs.length,
      active_referrals: active.length,
      weekly_revenue: active.reduce((sum, s) => sum + Number(s.amount || 0), 0),
      leads_owed: current?.leads_owed || 0,
      leads_delivered: current?.leads_delivered || 0,
      leads_balance: current?.leads_balance || 0,
      spark
    };
  });
}

export async function getAffiliateDetail(env, affiliateId) {
  const supabase = getSupabase(env);

  const { data: affiliate, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("id", affiliateId)
    .single();

  if (error) throw new Error("Affiliate: " + error.message);

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("ghl_subscription_id, contact_name, contact_email, ghl_product_id, status, amount, coupon, started_at")
    .eq("affiliate_id", affiliateId)
    .order("started_at", { ascending: false });

  const { data: products } = await supabase
    .from("products")
    .select("ghl_product_id, product_name");

  const nameByProduct = {};
  for (const p of products || []) {
    nameByProduct[p.ghl_product_id] = p.product_name;
  }

  const { data: history } = await supabase
    .from("weekly_rewards")
    .select("week_start, week_end, active_subscriptions, leads_owed, leads_delivered, leads_balance")
    .eq("affiliate_id", affiliateId)
    .order("week_start", { ascending: false });

  return {
    affiliate: {
      id: affiliate.id,
      code: affiliate.affiliate_id,
      name: affiliate.name,
      email: affiliate.email,
      status: affiliate.status
    },
    subscriptions: (subs || []).map((s) => ({
      ...s,
      product_name: nameByProduct[s.ghl_product_id] || s.ghl_product_id
    })),
    history: history || []
  };
}

export async function getActivity(env) {
  const supabase = getSupabase(env);

  const { data, error } = await supabase
    .from("sync_logs")
    .select("id, sync_started, sync_finished, status, records_processed, records_inserted, error_message")
    .order("sync_started", { ascending: false })
    .limit(40);

  if (error) throw new Error("Activity: " + error.message);

  return data || [];
}

export async function markDelivered(env, { week_start, affiliate_id, leads_delivered }) {
  const supabase = getSupabase(env);

  const { data: row, error: readError } = await supabase
    .from("weekly_rewards")
    .select("leads_owed")
    .eq("week_start", week_start)
    .eq("affiliate_id", affiliate_id)
    .single();

  if (readError) {
    throw new Error("Reward row not found: " + readError.message);
  }

  const owed = row.leads_owed || 0;
  const delivered = Number(leads_delivered) || 0;

  const { error } = await supabase
    .from("weekly_rewards")
    .update({
      leads_delivered: delivered,
      leads_balance: owed - delivered
    })
    .eq("week_start", week_start)
    .eq("affiliate_id", affiliate_id);

  if (error) throw new Error("Update failed: " + error.message);

  return {
    week_start,
    affiliate_id,
    leads_owed: owed,
    leads_delivered: delivered,
    leads_balance: owed - delivered
  };
}
