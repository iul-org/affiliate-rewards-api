function buildHeaders(env) {
  return {
    Authorization: `Bearer ${env.GHL_API_KEY}`,
    Version: "2021-07-28",
    Accept: "application/json"
  };
}

async function request(env, url) {
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: buildHeaders(env)
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`GHL ${res.status} on ${url.pathname}: ${text.slice(0, 400)}`);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`GHL returned non-JSON on ${url.pathname}: ${text.slice(0, 200)}`);
  }
}

/**
 * Endpoints that identify the location through altId / altType query params
 * (payments, subscriptions).
 */
export async function ghlFetch(env, path, params = {}) {
  const url = new URL(env.GHL_API_BASE + path);

  url.searchParams.set("altId", env.GHL_LOCATION_ID);
  url.searchParams.set("altType", "location");

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  return request(env, url);
}

/**
 * Endpoints that carry the location in the path instead
 * (affiliate manager).
 */
export async function ghlFetchPath(env, path, params = {}) {
  const url = new URL(env.GHL_API_BASE + path);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  return request(env, url);
}

export async function listSubscriptions(env, { limit = 100, offset = 0 } = {}) {
  return ghlFetch(env, "/payments/subscriptions", { limit, offset });
}

/**
 * Affiliates for a campaign. Passing campaignId makes GHL do the filtering,
 * so only Lead Payout affiliates come back.
 */
export async function listAffiliates(env, { campaignId } = {}) {
  return ghlFetchPath(
    env,
    `/affiliate-manager/${env.GHL_LOCATION_ID}/affiliates`,
    campaignId ? { campaignId } : {}
  );
}

export async function listCampaigns(env) {
  return ghlFetchPath(env, `/affiliate-manager/${env.GHL_LOCATION_ID}/campaigns`);
}
