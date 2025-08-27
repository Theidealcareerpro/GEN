// theidealprogen/src/app/api/cron/purge/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supa } from "@/lib/server/supabase";
import { env } from "@/lib/env";
// optional: GitHub cleanup (delete repos) if desired:
import { Octokit } from "@octokit/rest";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-cron-token");
  if (!env.ADMIN_CRON_TOKEN || auth !== env.ADMIN_CRON_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const { data: items } = await supa
    .from("deployments")
    .select("id, repo, status, site_url")
    .lte("expires_at", now)
    .neq("status", "deleted");

  // Mark expired/deleted (optionally delete GH Pages repo if GITHUB_TOKEN present)
  const gh = env.GITHUB_TOKEN ? new Octokit({ auth: env.GITHUB_TOKEN }) : null;

  const updates = (items || []).map(async (d) => {
    if (gh) {
      try {
        // repo is like "ORG/NAME"
        const [owner, repo] = d.repo.split("/");
        await gh.repos.update({ owner, repo, archived: true }).catch(() => {});
        // You could also delete the repo here if that’s your policy:
        // await gh.repos.delete({ owner, repo });
      } catch {}
    }
    await supa.from("deployments").update({ status: "expired" }).eq("id", d.id);
  });

  await Promise.all(updates);
  return NextResponse.json({ purged: items?.length || 0 });
}
