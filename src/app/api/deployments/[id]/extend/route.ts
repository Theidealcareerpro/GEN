import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { HOSTING_DAYS, tierFromString, addDays } from "@/lib/plans";
import { unarchiveRepo } from "@/lib/github";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const sb = supabaseAdmin();

  const { data: row, error } = await sb
    .from("deployments")
    .select("id,fingerprint,plan,status,expires_at,repo_name")
    .eq("id", id)
    .single();

  if (error || !row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (row.status === "deleted") return NextResponse.json({ ok: false, error: "Deployment permanently deleted" }, { status: 410 });

  // Determine tier (entitlement may have changed)
  const { data: ent } = await sb.from("entitlements").select("tier").eq("fingerprint", row.fingerprint).maybeSingle();
  const tier = tierFromString(ent?.tier);
  const days = HOSTING_DAYS[tier];

  // Base = max(now, expires_at)
  const now = new Date();
  const base = new Date(Math.max(now.getTime(), new Date(row.expires_at).getTime()));
  const next = addDays(base, days).toISOString();

  // If archived (within grace), unarchive repo and mark active
  if (row.status === "archived") {
    try { await unarchiveRepo(row.repo_name); } catch {}
    await sb.from("deployments").update({ status: "active", expires_at: next }).eq("id", id);
  } else {
    await sb.from("deployments").update({ expires_at: next }).eq("id", id);
  }

  return NextResponse.json({ ok: true, expiresAt: next, plan: tier });
}
