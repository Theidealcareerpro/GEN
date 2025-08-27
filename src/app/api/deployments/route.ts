// theidealprogen/src/app/api/deployments/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fp = searchParams.get("fingerprint");
  if (!fp) return NextResponse.json({ ok: false, error: "Missing fingerprint" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data } = await sb
    .from("deployments")
    .select("id, repo_name, pages_url, status, plan, created_at, expires_at")
    .eq("fingerprint", fp)
    .order("created_at", { ascending: false });

  return NextResponse.json({ ok: true, items: data || [] });
}
