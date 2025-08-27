// theidealprogen/src/app/api/deployments/[id]/archive/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { archiveRepo } from "@/lib/github";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const sb = supabaseAdmin();

  const { data: row, error } = await sb
    .from("deployments")
    .select("id, repo_name, status")
    .eq("id", id)
    .single();

  if (error || !row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (row.status !== "active") return NextResponse.json({ ok: false, error: "Already archived or deleted" }, { status: 400 });

  try { await archiveRepo(row.repo_name); } catch {}
  await sb.from("deployments").update({ status: "archived" }).eq("id", id);
  return NextResponse.json({ ok: true, status: "archived" });
}
