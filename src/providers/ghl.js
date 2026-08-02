export async function ghlFetch(env, path, params = {}) {
  const url = new URL(env.GHL_API_BASE + path);

  url.searchParams.set("altId", env.GHL_LOCATION_ID);
  url.searchParams.set("altType", "location");

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${env.GHL_API_KEY}`,
      Version: "2021-07-28",
      Accept: "application/json"
    }
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`GHL ${res.status} on ${path}: ${text.slice(0, 300)}`);
  }

  return JSON.parse(text);
}

export async function listSubscriptions(env, { limit = 100, offset = 0 } = {}) {
  return ghlFetch(env, "/payments/subscriptions", { limit, offset });
}