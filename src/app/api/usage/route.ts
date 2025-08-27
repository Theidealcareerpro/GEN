// theidealprogen/src/app/api/usage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supa } from "@/lib/server/supabase";
import { getEntitlements } from "@/lib/entitlements";

function fp(req: NextRequest) {
  const h = req.headers.get("x-fp") || "";
  return h.trim().slice(0, 120);
}

export async function GET(req: NextRequest) {
  const fingerprint = fp(req);
  if (!fingerprint) return NextResponse.json({ error: "Missing fingerprint" }, { status: 400 });

  const ent = await getEntitlements(fingerprint);
  const { data: deployments } = await supa
    .from("deployments")
    .select("id, site_url, status, tier, created_at, expires_at, repo")
    .eq("fingerprint", fingerprint)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  return NextResponse.json({
    fingerprint,
    cv_exports: ent?.cv_exports ?? 0,
    cl_exports: ent?.cl_exports ?? 0,
    deployments: ent?.deployments ?? 0,
    supporter_until: ent?.supporter_until ?? null,
    business_until: ent?.business_until ?? null,
    items: deployments || [],
  });
}
