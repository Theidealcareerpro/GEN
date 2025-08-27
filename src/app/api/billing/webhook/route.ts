import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { addMonths } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !whSecret) return NextResponse.json({ ok: false, error: "Stripe not configured" }, { status: 500 });

  // @ts-ignore
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });

  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text();

  let evt: any;
  try {
    evt = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: `Invalid signature: ${e.message}` }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // 1) Business tier checkout (subscription / one-time)
  if (evt.type === "checkout.session.completed") {
    const session = evt.data.object;
    const action = session.metadata?.action || "tier";
    const fingerprint = session.metadata?.fingerprint as string | undefined;

    // a) Tier upgrade (Business)
    if (action === "tier" && fingerprint) {
      const now = new Date();
      const year = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      await sb.from("entitlements").upsert({ fingerprint, tier: "business", expires_at: year }, { onConflict: "fingerprint" });
      await sb.from("payments").insert({
        fingerprint, provider: "stripe", reference: session.id,
        amount: session.amount_total ?? 0, currency: (session.currency || "gbp").toLowerCase(),
        status: session.payment_status || "paid", payload: evt
      });
      return NextResponse.json({ ok: true });
    }

    // b) Per-deployment paid extension (Business)
    if (action === "extend") {
      const deploymentId = session.metadata?.deployment_id as string | undefined;
      const months = Number(session.metadata?.months || 0);
      if (deploymentId && months > 0 && session.payment_status === "paid") {
        const { data: row, error } = await sb
          .from("deployments")
          .select("id, expires_at, status")
          .eq("id", deploymentId)
          .single();
        if (!error && row && row.status !== "deleted") {
          const base = new Date(Math.max(Date.now(), new Date(row.expires_at).getTime()));
          const next = addMonths(base, months).toISOString();
          await sb.from("deployments").update({ expires_at: next, status: "active" }).eq("id", deploymentId);
        }

        // record payment
        const fp = session.metadata?.fingerprint || "";
        await sb.from("payments").insert({
          fingerprint: fp, provider: "stripe", reference: session.id,
          amount: session.amount_total ?? 0, currency: (session.currency || "gbp").toLowerCase(),
          status: session.payment_status || "paid", payload: evt
        });
      }
      return NextResponse.json({ ok: true });
    }
  }

  // Optional: handle invoice.paid for subscriptions too
  if (evt.type === "invoice.paid") {
    // no-op or renew Business entitlement window
  }

  return NextResponse.json({ ok: true });
}
