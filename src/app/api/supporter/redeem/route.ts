import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { addDays } from "@/lib/plans";

export const runtime = "nodejs";

/**
 * POST /api/supporter/redeem
 * body: { fingerprint: string, receipt: string, email?: string }
 *
 * Logic:
 * - Look up a BMC payment by `reference` (the receipt/transaction id)
 * - If found & status=paid:
 *   - Upsert entitlements to supporter: expires_at = max(now, current) + 90 days
 *   - Update that payment row to attach the user's fingerprint (if not already set)
 * - If not found: 404 with a helpful message
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fingerprint = String(body?.fingerprint || "");
    const receipt = String(body?.receipt || "").trim();

    if (!fingerprint || !receipt) {
      return NextResponse.json({ ok: false, error: "Missing fingerprint or receipt" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // 1) find payment by receipt (reference)
    const { data: pay, error: e1 } = await sb
      .from("payments")
      .select("id, fingerprint, provider, reference, status, created_at")
      .eq("provider", "bmc")
      .eq("reference", receipt)
      .maybeSingle();

    if (e1) return NextResponse.json({ ok: false, error: e1.message || "Lookup failed" }, { status: 500 });
    if (!pay) return NextResponse.json({
      ok: false,
      error: "Receipt not found. If you just paid, wait 1–2 minutes and retry. Otherwise contact support."
    }, { status: 404 });

    if (String(pay.status).toLowerCase() !== "paid") {
      return NextResponse.json({ ok: false, error: "Payment not confirmed as paid yet." }, { status: 422 });
    }

    // 2) upsert entitlement → supporter, +90 days from max(now, current expiry)
    const { data: ent0 } = await sb
      .from("entitlements")
      .select("tier, expires_at")
      .eq("fingerprint", fingerprint)
      .maybeSingle();

    const now = new Date();
    const current = ent0?.expires_at ? new Date(ent0.expires_at) : null;
    const base = current && current.getTime() > now.getTime() ? current : now;
    const next = addDays(base, 90).toISOString();

    await sb.from("entitlements").upsert({
      fingerprint,
      tier: "supporter",
      expires_at: next
    }, { onConflict: "fingerprint" });

    // 3) attach fingerprint to the payment row if empty/different (for audit)
    if (!pay.fingerprint || pay.fingerprint !== fingerprint) {
      await sb.from("payments").update({ fingerprint }).eq("id", pay.id);
    }

    return NextResponse.json({ ok: true, tier: "supporter", expires_at: next });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Redeem failed" }, { status: 500 });
  }
}
