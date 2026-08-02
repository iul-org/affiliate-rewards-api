import { listSubscriptions } from "../providers/ghl.js";
import { getSupabase } from "../providers/supabase.js";

const REFERRAL_PRODUCT_IDS = [
  "6a57d6e9e8faed092a0e2567",
  "6a57d719506fec08ecd6125d",
  "6a57d74895dd140151e1e151"
];

async function fetchAllSubscriptions(env) {
  const pageSize = 100;
  let offset = 0;
  let total = null;
  const all = [];

  while (true) {
    const res = await listSubscriptions(env, { limit: pageSize, offset });
    const batch = res.data || [];
    if (total === null) total = res.totalCount ?? 0;

    all.push(...batch);
    offset += pageSize;

    if (batch.length === 0 || all.length >= total || offset > 20000) break;
  }

  return { all, total };
}

export async function runSync(env) {
  const supabase = getSupabase(env);
  const startedAt = new Date().toISOString();

  const { data: logRow } = await supabase
    .from("sync_logs")
    .insert({ sync_started: startedAt, status: "running" })
    .select()
    .single();

  const logId = logRow?.id;

  try {
    const { all, total } = await fetchAllSubscriptions(env);

    const relevant = all.filter((s) => {
      const aff = s.entitySourceMeta?.affiliateManager?.id;
      const pid = s.recurringProduct?.product?._id;
      return aff && REFERRAL_PRODUCT_IDS.includes(pid);
    });

    // 1. upsert affiliates
    const affiliateCodes = [
      ...new Set(relevant.map((s) => s.entitySourceMeta.affiliateManager.id))
    ];

    if (affiliateCodes.length) {
      const { error: affError } = await supabase
        .from("affiliates")
        .upsert(
          affiliateCodes.map((code) => ({
            affiliate_id: code,
            status: "active",
            updated_at: new Date().toISOString()
          })),
          { onConflict: "affiliate_id", ignoreDuplicates: false }
        );

      if (affError) throw new Error("Affiliate upsert: " + affError.message);
    }

    // 2. map affiliate code -> uuid
    const { data: affRows, error: affReadError } = await supabase
      .from("affiliates")
      .select("id, affiliate_id");

    if (affReadError) throw new Error("Affiliate read: " + affReadError.message);

    const affMap = {};
    for (const row of affRows || []) affMap[row.affiliate_id] = row.id;

    // 3. upsert subscriptions
    const rows = relevant.map((s) => {
      const code = s.entitySourceMeta.affiliateManager.id;
      const uuid = affMap[code];
      if (!uuid) throw new Error("No affiliate row found for code: " + code);

      return {
        ghl_subscription_id: s._id,
        ghl_contact_id: s.contactId,
        contact_name: s.contactName || null,
        contact_email: s.contactEmail || null,
        ghl_product_id: s.recurringProduct?.product?._id || null,
        affiliate_id: uuid,
        amount: s.amount ?? 0,
        currency: s.currency || "USD",
        status: s.status,
        coupon: s.couponCode || null,
        started_at: s.subscriptionStartDate || null,
        last_synced: new Date().toISOString()
      };
    });

    if (rows.length) {
      const { error } = await supabase
        .from("subscriptions")
        .upsert(rows, { onConflict: "ghl_subscription_id" });

      if (error) throw new Error("Subscription upsert: " + error.message);
    }

    await supabase
      .from("sync_logs")
      .update({
        sync_finished: new Date().toISOString(),
        records_processed: total,
        records_inserted: rows.length,
        status: "success"
      })
      .eq("id", logId);

    return {
      scanned: total,
      affiliateSubscriptions: relevant.length,
      affiliates: affiliateCodes.length,
      synced: rows.length
    };
  } catch (err) {
    await supabase
      .from("sync_logs")
      .update({
        sync_finished: new Date().toISOString(),
        status: "failed",
        error_message: err.message
      })
      .eq("id", logId);

    throw err;
  }
}