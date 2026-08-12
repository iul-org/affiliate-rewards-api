import { listSubscriptions, listAffiliates } from "../providers/ghl.js";
import { getSupabase } from "../providers/supabase.js";

const REFERRAL_PRODUCT_IDS = [
  "6a57d6e9e8faed092a0e2567",
  "6a57d719506fec08ecd6125d",
  "6a57d74895dd140151e1e151"
];

async function getSetting(supabase, key) {
  const { data } = await supabase
    .from("settings")
    .select("setting_value")
    .eq("setting_key", key)
    .maybeSingle();

  return data?.setting_value || null;
}

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

  const { data: logRow, error: logError } = await supabase
    .from("sync_logs")
    .insert({ sync_started: startedAt, status: "running" })
    .select()
    .single();

  if (logError) throw new Error("Sync log insert: " + logError.message);

  const logId = logRow?.id;

  try {
    const campaignId = await getSetting(supabase, "lead_payout_campaign_id");

    if (!campaignId) {
      throw new Error(
        "No lead_payout_campaign_id in settings. Add it before syncing."
      );
    }

    /* ---------- 1. affiliate roster from GHL ---------- */

    const affResponse = await listAffiliates(env, { campaignId });
    const ghlAffiliates = (affResponse.affiliates || []).filter(
      (a) => !a.deleted
    );

    const seenGhlIds = ghlAffiliates.map((a) => a._id);

    if (ghlAffiliates.length) {
      const rows = ghlAffiliates.map((a) => {
        const name = [a.firstName, a.lastName].filter(Boolean).join(" ").trim();

        return {
          affiliate_id: a._id,
          ghl_affiliate_id: a._id,
          name: name || null,
          email: a.email || null,
          phone: a.phone || null,
          status: a.active ? "active" : "inactive",
          ghl_campaign_ids: (a.campaignIds || []).join(","),
          last_synced: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      const { error: affError } = await supabase
        .from("affiliates")
        .upsert(rows, { onConflict: "affiliate_id", ignoreDuplicates: false });

      if (affError) throw new Error("Affiliate upsert: " + affError.message);
    }

    /* ---------- 1b. affiliates that vanished from GHL ---------- */

    // Anyone stored locally who is no longer returned by the campaign has been
    // deleted in GHL or moved to another campaign. We flag rather than delete:
    // their earning history and deliveries stay intact and the change can be
    // undone if the disappearance was a mistake or a partial API response.
    let removed = [];
    let restored = [];

    if (seenGhlIds.length) {
      const { data: localRows, error: localError } = await supabase
        .from("affiliates")
        .select("id, affiliate_id, name, removed_at");

      if (localError) throw new Error("Affiliate read: " + localError.message);

      const seen = new Set(seenGhlIds);

      const gone = (localRows || []).filter(
        (r) => !seen.has(r.affiliate_id) && !r.removed_at
      );

      const back = (localRows || []).filter(
        (r) => seen.has(r.affiliate_id) && r.removed_at
      );

      if (gone.length) {
        const { error } = await supabase
          .from("affiliates")
          .update({
            removed_at: new Date().toISOString(),
            status: "removed",
            updated_at: new Date().toISOString()
          })
          .in("id", gone.map((r) => r.id));

        if (error) throw new Error("Affiliate removal flag: " + error.message);

        removed = gone.map((r) => r.name || r.affiliate_id);
      }

      if (back.length) {
        const { error } = await supabase
          .from("affiliates")
          .update({
            removed_at: null,
            status: "active",
            updated_at: new Date().toISOString()
          })
          .in("id", back.map((r) => r.id));

        if (error) throw new Error("Affiliate restore: " + error.message);

        restored = back.map((r) => r.name || r.affiliate_id);
      }
    }

    /* ---------- 2. subscriptions from GHL ---------- */

    const { all, total } = await fetchAllSubscriptions(env);

    const relevant = all.filter((s) => {
      const ref = s.entitySourceMeta?.affiliateManager?.id;
      const pid = s.recurringProduct?.product?._id;
      return ref && REFERRAL_PRODUCT_IDS.includes(pid);
    });

    /* ---------- 3. map referral code -> affiliate uuid ---------- */

    const { data: affRows, error: affReadError } = await supabase
      .from("affiliates")
      .select("id, affiliate_id, referral_code, name");

    if (affReadError) throw new Error("Affiliate read: " + affReadError.message);

    const { data: ignoredRows } = await supabase
      .from("ignored_codes")
      .select("referral_code");

    const ignoredSet = new Set((ignoredRows || []).map((r) => r.referral_code));

    const byCode = {};
    for (const row of affRows || []) {
      if (row.referral_code) byCode[row.referral_code] = row.id;
    }

    /* ---------- 4. store subscriptions we can attribute ---------- */

    const rows = [];
    const unlinkedCodes = {};

    for (const s of relevant) {
      const code = s.entitySourceMeta.affiliateManager.id;
      const uuid = byCode[code];

      if (!uuid) {
        // no affiliate linked to this referral code yet
        if (ignoredSet.has(code)) continue;
        if (!unlinkedCodes[code]) {
          unlinkedCodes[code] = { code, subscriptions: 0, active: 0 };
        }
        unlinkedCodes[code].subscriptions++;
        if (s.status === "active") unlinkedCodes[code].active++;
        continue;
      }

      rows.push({
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
      });
    }

    if (rows.length) {
      const { error } = await supabase
        .from("subscriptions")
        .upsert(rows, { onConflict: "ghl_subscription_id" });

      if (error) throw new Error("Subscription upsert: " + error.message);
    }

    const unlinked = Object.values(unlinkedCodes);

    const { error: logUpdateError } = await supabase
      .from("sync_logs")
      .update({
        sync_finished: new Date().toISOString(),
        records_processed: total,
        records_inserted: rows.length,
        status: "success",
        error_message: unlinked.length
          ? unlinked.length + " referral code(s) not yet linked to an affiliate"
          : null
      })
      .eq("id", logId);

    if (logUpdateError) {
      throw new Error("Sync log update: " + logUpdateError.message);
    }

    return {
      scanned: total,
      affiliatesFromGhl: ghlAffiliates.length,
      affiliateSubscriptions: relevant.length,
      synced: rows.length,
      unlinked,
      removed,
      restored
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

/**
 * Referral codes seen in GHL subscriptions that no affiliate claims yet,
 * paired with a suggested affiliate based on the first-name prefix.
 */
export async function getUnlinkedCodes(env) {
  const supabase = getSupabase(env);

  const { all } = await fetchAllSubscriptions(env);

  const relevant = all.filter((s) => {
    const ref = s.entitySourceMeta?.affiliateManager?.id;
    const pid = s.recurringProduct?.product?._id;
    return ref && REFERRAL_PRODUCT_IDS.includes(pid);
  });

  const { data: affRows } = await supabase
    .from("affiliates")
    .select("id, affiliate_id, referral_code, name, email, removed_at")
    .is("removed_at", null);

  // Codes deliberately dismissed, e.g. sales made while testing. The
  // subscriptions still exist in GHL and always will, so the only way to stop
  // them resurfacing is to remember that they were dismissed.
  const { data: ignoredRows } = await supabase
    .from("ignored_codes")
    .select("referral_code");

  const ignored = new Set((ignoredRows || []).map((r) => r.referral_code));

  const taken = new Set(
    (affRows || []).filter((a) => a.referral_code).map((a) => a.referral_code)
  );

  const counts = {};
  for (const s of relevant) {
    const code = s.entitySourceMeta.affiliateManager.id;
    if (taken.has(code) || ignored.has(code)) continue;

    if (!counts[code]) counts[code] = { code, subscriptions: 0, active: 0 };
    counts[code].subscriptions++;
    if (s.status === "active") counts[code].active++;
  }

  const openAffiliates = (affRows || []).filter((a) => !a.referral_code);

  return Object.values(counts).map((entry) => {
    // "marcus8575" -> "marcus"
    const prefix = entry.code.replace(/[0-9]+$/, "").toLowerCase();

    const matches = openAffiliates.filter((a) => {
      const first = String(a.name || "").split(" ")[0].toLowerCase();
      return first && first === prefix;
    });

    return {
      ...entry,
      suggestion: matches.length === 1 ? matches[0] : null,
      ambiguous: matches.length > 1,
      candidates: openAffiliates.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email
      }))
    };
  });
}
