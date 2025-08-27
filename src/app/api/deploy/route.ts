// theidealprogen/src/app/api/deploy/route.ts
import { NextResponse } from "next/server";
import { sanitizePortfolio, type PortfolioData } from "@/lib/portfolio-types";
import { buildStaticFiles } from "@/lib/portfolio-build";
import { createPagesRepoAndPublish } from "@/lib/github";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { HOSTING_DAYS, tierFromString, addDays } from "@/lib/plans";

export const runtime = "nodejs";

function bad(code: number, message: string) {
  return new NextResponse(JSON.stringify({ ok: false, error: message }), { status: code, headers: { "content-type": "application/json" } });
}
const LIMIT_ACTIVE_FREE = 3;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fingerprint = String(body?.fingerprint || "");
    if (!fingerprint) return bad(400, "Missing fingerprint");
    const site: PortfolioData = sanitizePortfolio(body?.portfolio);

    const repoName = slug(`${site.fullName}-${Date.now()}`);
    const files = buildStaticFiles(site);

    const sb = supabaseAdmin();

    // entitlement (tier) → hosting duration
    const { data: ent } = await sb.from("entitlements").select("tier").eq("fingerprint", fingerprint).maybeSingle();
    const tier = tierFromString(ent?.tier);
    const hostingDays = HOSTING_DAYS[tier];

    // free active limit
    if (tier === "free") {
      const { count } = await sb.from("deployments").select("*", { count: "exact", head: true }).eq("fingerprint", fingerprint).eq("status", "active");
      if ((count || 0) >= LIMIT_ACTIVE_FREE) return bad(429, `Limit reached: ${LIMIT_ACTIVE_FREE} active deployments on Free. Archive/delete one to continue.`);
    }

    // publish
    const { repoName: finalRepo, pagesUrl } = await createPagesRepoAndPublish({ repoName, files });

    // record deployment
    const expires = addDays(new Date(), hostingDays).toISOString();
    await sb.from("deployments").insert({
      fingerprint, repo_name: finalRepo, pages_url: pagesUrl,
      plan: tier, status: "active", expires_at: expires
    });

    return NextResponse.json({ ok: true, repoName: finalRepo, pagesUrl, expiresAt: expires, plan: tier });
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : "Deploy failed";
    return bad(500, msg);
  }
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
