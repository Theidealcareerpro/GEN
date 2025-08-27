// theidealprogen/src/app/api/deployments/[id]/unarchive/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { unarchiveRepo } from "@/lib/github";

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
  if (row.status !== "archived") return NextResponse.json({ ok: false, error: "Only archived deployments can be unarchived" }, { status: 400 });

  try { await unarchiveRepo(row.repo_name); } catch {}
  await sb.from("deployments").update({ status: "active" }).eq("id", id);
  return NextResponse.json({ ok: true, status: "active" });
}
