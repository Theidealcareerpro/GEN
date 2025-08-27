// theidealprogen/src/app/api/entitlements/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { tierFromString } from "@/lib/plans";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const fp = new URL(req.url).searchParams.get("fingerprint") || "";
  if (!fp) return NextResponse.json({ ok: false, error: "Missing fingerprint" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data } = await sb.from("entitlements").select("tier,expires_at").eq("fingerprint", fp).maybeSingle();
  const tier = tierFromString(data?.tier);
  return NextResponse.json({ ok: true, tier, expires_at: data?.expires_at ?? null });
}
