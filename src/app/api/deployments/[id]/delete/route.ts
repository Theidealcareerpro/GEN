// theidealprogen/src/app/api/deployments/[id]/delete/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { deleteRepo } from "@/lib/github";

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
  if (row.status === "deleted") return NextResponse.json({ ok: true, status: "deleted" });

  try { await deleteRepo(row.repo_name); } catch {} // requires PAT with delete_repo
  await sb.from("deployments").update({ status: "deleted", deleted_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.json({ ok: true, status: "deleted" });
}
