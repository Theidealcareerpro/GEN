// theidealprogen/src/lib/entitlements.ts
import { supa } from "@/lib/server/supabase";

export type Tier = "free" | "supporter" | "business";

export async function getEntitlements(fingerprint: string) {
  const { data } = await supa.from("v_profile").select("*").eq("fingerprint", fingerprint).maybeSingle();
  return data || null;
}

export async function extendForMonths(fingerprint: string, months: number, tier: Exclude<Tier, "free">) {
  const now = new Date();
  const field = tier === "business" ? "business_until" : "supporter_until";

  // read current
  const { data: cur } = await supa.from("entitlements").select("*").eq("fingerprint", fingerprint).maybeSingle();
  const current = cur?.[field] ? new Date(cur[field]) : null;
  const base = current && current > now ? current : now;

  const next = new Date(base);
  next.setMonth(next.getMonth() + months);

  // upsert entitlement row
  const payload = { fingerprint, [field]: next.toISOString(), updated_at: new Date().toISOString() } as any;
  await supa.from("entitlements").upsert(payload, { onConflict: "fingerprint" });

  // extend all active deployments belonging to fingerprint
  const { data: deps } = await supa.from("deployments")
    .select("id, expires_at, status, tier")
    .eq("fingerprint", fingerprint)
    .neq("status", "deleted");

  const updates = (deps || []).map((d) => {
    const curExp = d.expires_at ? new Date(d.expires_at) : now;
    const baseExp = curExp > now ? curExp : now;
    const exp = new Date(baseExp);
    exp.setMonth(exp.getMonth() + months);
    return supa
      .from("deployments")
      .update({ expires_at: exp.toISOString(), tier, last_extended_at: new Date().toISOString() })
      .eq("id", d.id);
  });

  await Promise.all(updates);
}
