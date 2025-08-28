import { NextRequest, NextResponse } from "next/server";
import { supa } from "@/lib/server/supabase";
import { extendForMonths } from "@/lib/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BMC_WEBHOOK_SECRET = process.env.BMC_WEBHOOK_SECRET || "";

/**
 * Expecting BMC to POST JSON we can verify:
 * {
 *   "fingerprint": "abc...",
 *   "months": 3 | 6,
 *   "external_id": "receipt or tx id"
 * }
 * If your BMC integration uses HMAC signatures, verify them here before proceeding.
 */
export async function POST(req: NextRequest) {
  if (!BMC_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing BMC_WEBHOOK_SECRET" }, { status: 500 });
  }

  try {
    // If BMC provides an HMAC signature header, verify here (pseudo):
    // const sig = req.headers.get('x-bmc-signature') || '';
    // const raw = await req.text();  // use raw for signature calc
    // verifyHmac(raw, sig, BMC_WEBHOOK_SECRET);

    const body = await req.json().catch(() => ({}));
    const fingerprint = String(body.fingerprint || "");
    const months = Number(body.months) === 6 ? 6 : 3;
    const external_id = String(body.external_id || "");

    if (!fingerprint || !external_id) {
      return NextResponse.json({ error: "Missing fingerprint or external_id" }, { status: 400 });
    }

    await extendForMonths(fingerprint, months, "supporter");

    const { error } = await supa.from("payments").insert({
      provider: "bmc",
      external_id,
      fingerprint,
      plan: `supporter-${months === 6 ? "6m" : "3m"}`,
      months,
      amount_cents: months === 6 ? 1000 : 500,
      currency: "GBP",
    });
    if (error) console.error("payments insert error (bmc):", error);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("BMC webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
