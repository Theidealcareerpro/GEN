import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { archiveRepo, deleteRepo } from "@/lib/github";

export const runtime = "nodejs";

const CRON_SECRET = process.env.CRON_SECRET;
const GRACE_DAYS = 7;

export async function GET(req: Request) {
  if (!CRON_SECRET) return NextResponse.json({ ok: false, error: "CRON_SECRET not set" }, { status: 500 });
  const token = new URL(req.url).searchParams.get("secret");
  if (token !== CRON_SECRET) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const sb = supabaseAdmin();
  const nowIso = new Date().toISOString();
  const graceCutoff = new Date(Date.now() - GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // 1) Expired actives → archive (soft)
  const { data: toArchive } = await sb
    .from("deployments")
    .select("id, repo_name")
    .eq("status", "active")
    .lt("expires_at", nowIso);

  let archived = 0;
  for (const d of toArchive || []) {
    try { await archiveRepo(d.repo_name); } catch {}
    await sb.from("deployments").update({ status: "archived" }).eq("id", d.id);
    archived++;
  }

  // 2) Expired & beyond grace → delete (hard)
  const { data: toDelete } = await sb
    .from("deployments")
    .select("id, repo_name, expires_at")
    .eq("status", "archived")
    .lt("expires_at", graceCutoff);

  let deleted = 0;
  for (const d of toDelete || []) {
    try { await deleteRepo(d.repo_name); } catch {}
    await sb.from("deployments").update({ status: "deleted", deleted_at: new Date().toISOString() }).eq("id", d.id);
    deleted++;
  }

  return NextResponse.json({ ok: true, archived, deleted, graceDays: GRACE_DAYS });
}
