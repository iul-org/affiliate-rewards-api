import { listSubscriptions } from "../providers/ghl.js";

export async function surveySubscriptions(env) {
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

    if (batch.length === 0 || all.length >= total || offset > 5000) break;
  }

  const statuses = {};
  const products = {};
  const affiliates = {};

  for (const s of all) {
    const status = s.status || "unknown";
    statuses[status] = (statuses[status] || 0) + 1;

    const pid = s.recurringProduct?.product?._id;
    const pname = s.recurringProduct?.product?.name || "(no product)";
    if (pid) {
      if (!products[pid]) products[pid] = { name: pname, count: 0, active: 0 };
      products[pid].count++;
      if (status === "active") products[pid].active++;
    }

    const aff = s.entitySourceMeta?.affiliateManager?.id;
    if (aff) {
      if (!affiliates[aff]) affiliates[aff] = { total: 0, active: 0 };
      affiliates[aff].total++;
      if (status === "active") affiliates[aff].active++;
    }
  }

  return {
    fetched: all.length,
    totalCount: total,
    statuses,
    withAffiliate: all.filter((s) => s.entitySourceMeta?.affiliateManager?.id).length,
    products,
    affiliates
  };
}