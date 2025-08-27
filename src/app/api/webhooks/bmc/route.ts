// theidealprogen/src/app/api/webhooks/bmc/route.ts
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { extendForMonths } from "@/lib/entitlements";
import { supa } from "@/lib/server/supabase";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-bmc-secret");
  if (!env.BMC_WEBHOOK_SECRET || secret !== env.BMC_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  // Expecting: { fingerprint, months, external_id }
  const fingerprint = String(body?.fingerprint || "").slice(0, 120);
  const months = Number(body?.months || 3);
  const external = String(body?.external_id || "");
  if (!fingerprint || !months) return NextResponse.json({ error: "Bad payload" }, { status: 400 });

  await extendForMonths(fingerprint, months, "supporter");

  await supa.from("payments").insert({
    provider: "bmc",
    external_id: external || `bmc-${Date.now()}`,
    fingerprint,
    plan: `supporter-${months === 6 ? "6m" : "3m"}`,
    months,
    amount_cents: months === 6 ? 1000 : 500,
    currency: "GBP",
  });

  return NextResponse.json({ ok: true });
}
