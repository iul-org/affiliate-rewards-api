import { getSupabase } from "../providers/supabase.js";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function sumBy(rows, key) {
  return (rows || []).reduce((total, r) => total + Number(r[key] || 0), 0);
}

function groupSum(rows, groupKey, valueKey) {
  const out = {};
  for (const r of rows || []) {
    const k = r[groupKey];
    if (!k) continue;
    out[k] = (out[k] || 0) + Number(r[valueKey] || 0);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* overview                                                            */
/* ------------------------------------------------------------------ */

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

  const { data: affiliateRows } = await supabase
    .from("affiliates")
    .select("id, referral_code, status");

  const affiliateCount = (affiliateRows || []).length;
  const unlinkedAffiliates = (affiliateRows || []).filter(
    (a) => !a.referral_code
  ).length;

  const { data: weeks, error: weekError } = await supabase
    .from("weekly_rewards")
    .select("week_start, week_end, affiliate_id, leads_owed")
    .order("week_start", { ascending: false });

  if (weekError) throw new Error("Weekly rewards: " + weekError.message);

  const { data: deliveries, error: delError } = await supabase
    .from("lead_deliveries")
    .select("affiliate_id, leads, delivered_at")
    .order("delivered_at", { ascending: false });

  if (delError) throw new Error("Deliveries: " + delError.message);

  const lifetimeOwed = sumBy(weeks, "leads_owed");
  const lifetimeDelivered = sumBy(deliveries, "leads");

  const currentWeekStart = weeks?.[0]?.week_start || null;
  const currentRows = (weeks || []).filter(
    (w) => w.week_start === currentWeekStart
  );

  const weekMeta = {};
  for (const w of weeks || []) {
    if (!weekMeta[w.week_start]) {
      weekMeta[w.week_start] = {
        week_start: w.week_start,
        week_end: w.week_end,
        leads_owed: 0,
        leads_delivered: 0
      };
    }
    weekMeta[w.week_start].leads_owed += Number(w.leads_owed || 0);
  }

  const ordered = Object.values(weekMeta).sort((a, b) =>
    a.week_start < b.week_start ? -1 : 1
  );

  for (const d of deliveries || []) {
    const when = String(d.delivered_at || "").slice(0, 10);
    if (!when) continue;

    let bucket = ordered.find((w) => when >= w.week_start && when <= w.week_end);
    if (!bucket) {
      const earlier = ordered.filter((w) => w.week_start <= when);
      bucket = earlier.length ? earlier[earlier.length - 1] : ordered[0];
    }
    if (bucket) bucket.leads_delivered += Number(d.leads || 0);
  }

  const { data: lastSync } = await supabase
    .from("sync_logs")
    .select("sync_started, sync_finished, status, records_processed, records_inserted, error_message")
    .order("sync_started", { ascending: false })
    .limit(1);

  return {
    affiliates: affiliateCount,
    unlinkedAffiliates,
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
    lifetime: {
      leads_owed: lifetimeOwed,
      leads_delivered: lifetimeDelivered,
      balance: lifetimeOwed - lifetimeDelivered,
      deliveries: (deliveries || []).length
    },
    currentWeek: {
      week_start: currentWeekStart,
      week_end: currentRows[0]?.week_end || null,
      leads_owed: sumBy(currentRows, "leads_owed")
    },
    lastDelivery: deliveries?.[0]?.delivered_at || null,
    trend: ordered.slice(-12),
    lastSync: lastSync?.[0] || null
  };
}

/* ------------------------------------------------------------------ */
/* affiliates                                                          */
/* ------------------------------------------------------------------ */

export async function getAffiliates(env) {
  const supabase = getSupabase(env);

  const { data: affiliates, error } = await supabase
    .from("affiliates")
    .select("id, affiliate_id, referral_code, name, email, phone, status, created_at");

  if (error) throw new Error("Affiliates: " + error.message);

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("affiliate_id, status, amount");

  const { data: weeks } = await supabase
    .from("weekly_rewards")
    .select("affiliate_id, week_start, leads_owed")
    .order("week_start", { ascending: false });

  const { data: deliveries } = await supabase
    .from("lead_deliveries")
    .select("affiliate_id, leads, delivered_at")
    .order("delivered_at", { ascending: false });

  const owedByAffiliate = groupSum(weeks, "affiliate_id", "leads_owed");
  const deliveredByAffiliate = groupSum(deliveries, "affiliate_id", "leads");
  const latestWeek = weeks?.[0]?.week_start || null;

  return (affiliates || []).map((a) => {
    const mySubs = (subs || []).filter((s) => s.affiliate_id === a.id);
    const active = mySubs.filter((s) => s.status === "active");

    const thisWeek = (weeks || []).find(
      (w) => w.affiliate_id === a.id && w.week_start === latestWeek
    );

    const owed = owedByAffiliate[a.id] || 0;
    const delivered = deliveredByAffiliate[a.id] || 0;

    const spark = (weeks || [])
      .filter((w) => w.affiliate_id === a.id)
      .sort((x, y) => (x.week_start < y.week_start ? -1 : 1))
      .slice(-10)
      .map((w) => w.leads_owed || 0);

    const lastDelivery = (deliveries || []).find((d) => d.affiliate_id === a.id);

    return {
      id: a.id,
      code: a.referral_code || null,
      linked: Boolean(a.referral_code),
      name: a.name || a.affiliate_id,
      email: a.email,
      phone: a.phone,
      status: a.status,
      total_referrals: mySubs.length,
      active_referrals: active.length,
      weekly_revenue: active.reduce((sum, s) => sum + Number(s.amount || 0), 0),
      weekly_rate: thisWeek ? thisWeek.leads_owed || 0 : 0,
      lifetime_owed: owed,
      lifetime_delivered: delivered,
      balance: owed - delivered,
      last_delivery: lastDelivery ? lastDelivery.delivered_at : null,
      spark
    };
  });
}

/* ------------------------------------------------------------------ */
/* affiliate detail                                                    */
/* ------------------------------------------------------------------ */

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

  const { data: weeks } = await supabase
    .from("weekly_rewards")
    .select("week_start, week_end, active_subscriptions, leads_owed")
    .eq("affiliate_id", affiliateId)
    .order("week_start", { ascending: false });

  const { data: deliveries } = await supabase
    .from("lead_deliveries")
    .select("id, leads, delivered_at, note")
    .eq("affiliate_id", affiliateId)
    .order("delivered_at", { ascending: false });

  const owed = sumBy(weeks, "leads_owed");
  const delivered = sumBy(deliveries, "leads");

  return {
    affiliate: {
      id: affiliate.id,
      code: affiliate.referral_code || null,
      ghl_id: affiliate.affiliate_id,
      name: affiliate.name,
      email: affiliate.email,
      phone: affiliate.phone,
      status: affiliate.status
    },
    totals: {
      lifetime_owed: owed,
      lifetime_delivered: delivered,
      balance: owed - delivered
    },
    subscriptions: (subs || []).map((s) => ({
      ...s,
      product_name: nameByProduct[s.ghl_product_id] || s.ghl_product_id
    })),
    weeks: weeks || [],
    deliveries: deliveries || []
  };
}

/* ------------------------------------------------------------------ */
/* referral code linking                                               */
/* ------------------------------------------------------------------ */

export async function linkReferralCode(env, { affiliate_id, referral_code }) {
  const supabase = getSupabase(env);

  if (!affiliate_id) throw new Error("An affiliate must be given.");

  const code = String(referral_code || "").trim();
  if (!code) throw new Error("A referral code must be given.");
  if (code.length > 100) throw new Error("That referral code looks too long.");

  const { data: clash } = await supabase
    .from("affiliates")
    .select("id, name")
    .eq("referral_code", code)
    .maybeSingle();

  if (clash && clash.id !== affiliate_id) {
    throw new Error(
      `That referral code is already linked to ${clash.name || "another affiliate"}.`
    );
  }

  const { data, error } = await supabase
    .from("affiliates")
    .update({ referral_code: code, updated_at: new Date().toISOString() })
    .eq("id", affiliate_id)
    .select()
    .single();

  if (error) throw new Error("Could not link the code: " + error.message);

  return { id: data.id, name: data.name, referral_code: data.referral_code };
}

export async function unlinkReferralCode(env, affiliateId) {
  const supabase = getSupabase(env);

  const { error } = await supabase
    .from("affiliates")
    .update({ referral_code: null, updated_at: new Date().toISOString() })
    .eq("id", affiliateId);

  if (error) throw new Error("Could not unlink: " + error.message);

  return { id: affiliateId, referral_code: null };
}

/* ------------------------------------------------------------------ */
/* deliveries                                                          */
/* ------------------------------------------------------------------ */

export async function recordDelivery(env, { affiliate_id, leads, note }) {
  const supabase = getSupabase(env);

  const count = Number(leads);

  if (!affiliate_id) throw new Error("An affiliate must be given.");
  if (!Number.isFinite(count) || !Number.isInteger(count) || count <= 0) {
    throw new Error("Leads delivered must be a whole number greater than zero.");
  }
  if (count > 1000000) {
    throw new Error("That number looks wrong. Enter 1,000,000 or fewer leads.");
  }

  const { data: affiliate, error: affError } = await supabase
    .from("affiliates")
    .select("id, name, referral_code")
    .eq("id", affiliate_id)
    .single();

  if (affError) throw new Error("Affiliate not found: " + affError.message);

  const { data: row, error } = await supabase
    .from("lead_deliveries")
    .insert({
      affiliate_id,
      leads: count,
      note: note ? String(note).slice(0, 500) : null
    })
    .select()
    .single();

  if (error) throw new Error("Could not record the delivery: " + error.message);

  const { data: weeks } = await supabase
    .from("weekly_rewards")
    .select("leads_owed")
    .eq("affiliate_id", affiliate_id);

  const { data: deliveries } = await supabase
    .from("lead_deliveries")
    .select("leads")
    .eq("affiliate_id", affiliate_id);

  const owed = sumBy(weeks, "leads_owed");
  const delivered = sumBy(deliveries, "leads");

  return {
    delivery: row,
    affiliate_name: affiliate.name || affiliate.referral_code,
    lifetime_owed: owed,
    lifetime_delivered: delivered,
    balance: owed - delivered
  };
}

export async function deleteDelivery(env, deliveryId) {
  const supabase = getSupabase(env);

  const { data: row, error: readError } = await supabase
    .from("lead_deliveries")
    .select("id, affiliate_id, leads")
    .eq("id", deliveryId)
    .single();

  if (readError) throw new Error("Delivery not found: " + readError.message);

  const { error } = await supabase
    .from("lead_deliveries")
    .delete()
    .eq("id", deliveryId);

  if (error) throw new Error("Could not remove the delivery: " + error.message);

  return { removed: row.leads, affiliate_id: row.affiliate_id };
}

export async function getDeliveries(env) {
  const supabase = getSupabase(env);

  const { data, error } = await supabase
    .from("lead_deliveries")
    .select("id, leads, delivered_at, note, affiliates(name, referral_code)")
    .order("delivered_at", { ascending: false })
    .limit(100);

  if (error) throw new Error("Deliveries: " + error.message);

  return (data || []).map((d) => ({
    id: d.id,
    leads: d.leads,
    delivered_at: d.delivered_at,
    note: d.note,
    affiliate_name: d.affiliates?.name || d.affiliates?.referral_code || null
  }));
}

/* ------------------------------------------------------------------ */
/* activity                                                            */
/* ------------------------------------------------------------------ */

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
