import { getSupabase } from "../providers/supabase.js";

/**
 * Receives delivery notifications from Twyne (or anything else that can POST).
 *
 * We do not know which field names Twyne will send, so this deliberately does
 * not demand a fixed shape. Every payload is stored whole in `raw`, and we
 * make a best effort at pulling out an identifier. Anything we cannot match
 * is kept as `unmatched` rather than dropped, so nothing is ever lost while
 * the mapping is still being worked out.
 */

/* ------------------------------------------------------------------ */
/* field sniffing                                                      */
/* ------------------------------------------------------------------ */

// Walk a nested object and collect every leaf value keyed by lowercased path.
function flatten(obj, prefix = "", out = {}) {
  if (obj === null || obj === undefined) return out;

  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flatten(v, prefix ? `${prefix}.${i}` : String(i), out));
    return out;
  }

  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
    return out;
  }

  out[prefix.toLowerCase()] = obj;
  return out;
}

function pick(flat, needles, { strict = false } = {}) {
  for (const needle of needles) {
    for (const [key, value] of Object.entries(flat)) {
      if (value === null || value === undefined || value === "") continue;
      if (key === needle || key.endsWith("." + needle)) return String(value);
    }
  }

  if (strict) return null;

  // looser pass: any key containing the needle
  for (const needle of needles) {
    for (const [key, value] of Object.entries(flat)) {
      if (value === null || value === undefined || value === "") continue;
      if (key.includes(needle)) return String(value);
    }
  }

  return null;
}

function looksLikeEmail(v) {
  return typeof v === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
}

function digitsOnly(v) {
  return String(v || "").replace(/[^0-9]/g, "");
}

export function interpret(payload) {
  const flat = flatten(payload);

  let email = pick(flat, ["email", "email_address", "emailaddress", "e_mail"]);
  if (email && !looksLikeEmail(email)) email = null;

  // fall back to any value in the payload that looks like an email
  if (!email) {
    for (const value of Object.values(flat)) {
      if (looksLikeEmail(value)) {
        email = String(value);
        break;
      }
    }
  }

  const phone = pick(flat, ["phone", "phone_number", "phonenumber", "mobile", "cell"]);

  // strict: a loose match here would grab things like "buyer_id" and make
  // every delivery to the same customer look like a repeat of the first
  const externalId = pick(
    flat,
    [
      "delivery_id",
      "deliveryid",
      "event_id",
      "eventid",
      "lead_id",
      "leadid",
      "transaction_id",
      "transactionid",
      "uuid",
      "reference",
      "id"
    ],
    { strict: true }
  );

  const customerRef = pick(
    flat,
    [
      "contact_id",
      "contactid",
      "customer_id",
      "customerid",
      "buyer_id",
      "buyerid",
      "account_id",
      "accountid"
    ],
    { strict: true }
  );

  const rawLeads = pick(flat, [
    "leads",
    "lead_count",
    "leadcount",
    "quantity",
    "qty",
    "count",
    "volume",
    "delivered"
  ]);

  let leads = parseInt(rawLeads, 10);
  if (!Number.isFinite(leads) || leads <= 0) leads = 1;
  if (leads > 100000) leads = 100000;

  return {
    email: email ? email.trim().toLowerCase() : null,
    phone: phone ? digitsOnly(phone) : null,
    externalId: externalId ? String(externalId).slice(0, 200) : null,
    customerRef: customerRef ? String(customerRef).slice(0, 200) : null,
    leads,
    fieldsSeen: Object.keys(flat).slice(0, 60)
  };
}

/* ------------------------------------------------------------------ */
/* matching                                                            */
/* ------------------------------------------------------------------ */

async function findSubscription(supabase, { email, phone, customerRef }) {
  if (customerRef) {
    const { data } = await supabase
      .from("subscriptions")
      .select("id, contact_name, contact_email, status")
      .eq("ghl_contact_id", customerRef)
      .limit(1);

    if (data && data.length) return { row: data[0], matchedOn: "contact id" };
  }

  if (email) {
    const { data } = await supabase
      .from("subscriptions")
      .select("id, contact_name, contact_email, status")
      .ilike("contact_email", email)
      .limit(1);

    if (data && data.length) return { row: data[0], matchedOn: "email" };
  }

  if (phone && phone.length >= 7) {
    const tail = phone.slice(-9);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("id, contact_name, contact_email, status")
      .ilike("contact_phone", "%" + tail)
      .limit(1);

    // contact_phone only exists once the column has been added and synced;
    // treat its absence as "no phone match" rather than a failure
    if (!error && data && data.length) {
      return { row: data[0], matchedOn: "phone" };
    }
  }

  return { row: null, matchedOn: null };
}

/* ------------------------------------------------------------------ */
/* entry point                                                         */
/* ------------------------------------------------------------------ */

export async function recordDeliveryEvent(env, payload, { source = "twyne" } = {}) {
  const supabase = getSupabase(env);

  const seen = interpret(payload);

  // idempotency: if Twyne retries with the same id, do not count it twice
  if (seen.externalId) {
    const { data: existing } = await supabase
      .from("delivery_events")
      .select("id, status, received_at")
      .eq("external_id", seen.externalId)
      .maybeSingle();

    if (existing) {
      return {
        duplicate: true,
        id: existing.id,
        status: existing.status,
        message: "Already recorded, ignored as a repeat."
      };
    }
  }

  const match = await findSubscription(supabase, seen);

  const { data: row, error } = await supabase
    .from("delivery_events")
    .insert({
      source,
      raw: payload,
      external_id: seen.externalId,
      customer_email: seen.email,
      customer_phone: seen.phone,
      customer_ref: seen.customerRef,
      leads: seen.leads,
      matched_subscription: match.row ? match.row.id : null,
      status: match.row ? "matched" : "unmatched",
      note: match.matchedOn ? "Matched on " + match.matchedOn : "No customer matched"
    })
    .select()
    .single();

  if (error) throw new Error("Could not store the delivery: " + error.message);

  return {
    duplicate: false,
    id: row.id,
    leads: seen.leads,
    status: row.status,
    matchedOn: match.matchedOn,
    customer: match.row ? match.row.contact_name || match.row.contact_email : null,
    identifiersFound: {
      email: seen.email,
      phone: seen.phone,
      reference: seen.externalId,
      customerRef: seen.customerRef
    }
  };
}

/* ------------------------------------------------------------------ */
/* reading back                                                        */
/* ------------------------------------------------------------------ */

export async function getDeliveryEvents(env, { limit = 60 } = {}) {
  const supabase = getSupabase(env);

  const { data, error } = await supabase
    .from("delivery_events")
    .select("id, received_at, source, leads, customer_email, customer_phone, customer_ref, external_id, status, note, raw, matched_subscription")
    .order("received_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error("Delivery events: " + error.message);

  const subIds = [
    ...new Set((data || []).map((d) => d.matched_subscription).filter(Boolean))
  ];

  const names = {};
  if (subIds.length) {
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("id, contact_name, contact_email, ghl_product_id")
      .in("id", subIds);

    for (const s of subs || []) {
      names[s.id] = s.contact_name || s.contact_email;
    }
  }

  return (data || []).map((d) => ({
    ...d,
    customer_name: d.matched_subscription ? names[d.matched_subscription] || null : null
  }));
}

export async function getDeliveryStats(env) {
  const supabase = getSupabase(env);

  const { data, error } = await supabase
    .from("delivery_events")
    .select("leads, status, received_at");

  if (error) throw new Error("Delivery stats: " + error.message);

  const rows = data || [];
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 7);

  const week = rows.filter((r) => new Date(r.received_at) >= since);

  return {
    events: rows.length,
    leads: rows.reduce((a, r) => a + (r.leads || 0), 0),
    matched: rows.filter((r) => r.status === "matched").length,
    unmatched: rows.filter((r) => r.status === "unmatched").length,
    last7days: {
      events: week.length,
      leads: week.reduce((a, r) => a + (r.leads || 0), 0)
    },
    lastReceived: rows.length
      ? rows.map((r) => r.received_at).sort().reverse()[0]
      : null
  };
}
