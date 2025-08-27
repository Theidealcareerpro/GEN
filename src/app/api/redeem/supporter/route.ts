// theidealprogen/src/app/api/redeem/supporter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supa } from "@/lib/server/supabase";
import { extendForMonths } from "@/lib/entitlements";

const CODE = process.env.REDEEM_SUPPORTER_CODE || "";

export async function POST(req: NextRequest) {
  const { fingerprint, months, external_id, code } = await req.json();
  if (!fingerprint || !months || !external_id || !code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!CODE || code !== CODE) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await extendForMonths(String(fingerprint), Number(months) === 6 ? 6 : 3, "supporter");

  await supa.from("payments").insert({
    provider: "bmc",
    external_id: String(external_id),
    fingerprint: String(fingerprint),
    plan: `supporter-${Number(months) === 6 ? "6m" : "3m"}`,
    months: Number(months) === 6 ? 6 : 3,
    amount_cents: Number(months) === 6 ? 1000 : 500,
    currency: "GBP",
  });

  return NextResponse.json({ ok: true });
}
