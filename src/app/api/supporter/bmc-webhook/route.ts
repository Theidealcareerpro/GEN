import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/**
 * POST /api/supporter/bmc-webhook
 * Header: x-bmc-signature: <secret>
 * Body: BMC payload. If body.metadata.fingerprint exists: grant Supporter immediately.
 * Otherwise: store the payment row; user can link it via /supporter/redeem.
 */
export async function POST(req: Request) {
  const secret = process.env.BMC_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "BMC secret not set" }, { status: 500 });

  const sig = req.headers.get("x-bmc-signature");
  if (sig !== secret) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const sb = supabaseAdmin();

  // extract basics safely
  const provider = "bmc";
  const reference = String(body?.id || "");
  const amount = Math.round(Number(body?.amount || 0) * 100);
  const currency = String(body?.currency || "gbp").toLowerCase();
  const status = "paid"; // BMC webhooks fire after payment

  const incomingFp = String(body?.metadata?.fingerprint || "").trim() || null;

  // Always store the payment for audit / later redemption
  await sb.from("payments").insert({
    fingerprint: incomingFp, provider, reference, amount, currency, status, payload: body
  });

  // If we have a fingerprint, also grant Supporter now (+90 days)
  if (incomingFp) {
    const now = new Date();
    const ninety = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
    await sb.from("entitlements").upsert(
      { fingerprint: incomingFp, tier: "supporter", expires_at: ninety },
      { onConflict: "fingerprint" }
    );
  }

  return NextResponse.json({ ok: true });
}
