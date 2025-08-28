// App Router compatible Stripe webhook (Next 13/14)
// - No `export const config`
// - Uses raw body via req.text()
// - Node.js runtime, dynamic (no caching)

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supa } from "@/lib/server/supabase";
import { extendForMonths } from "@/lib/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

const stripe = new Stripe(STRIPE_SECRET, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  // Get the raw body (required for signature verification)
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return new NextResponse(`Webhook signature verification failed: ${err?.message || err}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = (session.metadata || {}) as Record<string, string>;

        // We set these when creating the Checkout Session server-side:
        // metadata: { fingerprint, plan: '3m' | '6m', tier: 'business' }
        const fingerprint = meta.fingerprint || "";
        const plan = (meta.plan === "6m" ? "6m" : "3m") as "3m" | "6m";
        const months = plan === "6m" ? 6 : 3;

        if (!fingerprint) {
          // Nothing to extend; acknowledge to avoid retries but log it
          console.warn("Stripe webhook: missing fingerprint in metadata");
          break;
        }

        // Grant entitlements
        await extendForMonths(fingerprint, months, "business");

        // Record payment (idempotent on provider+external_id)
        const external_id = session.id;
        const amount_cents =
          typeof session.amount_total === "number" ? session.amount_total : (session.amount_subtotal as number) || 0;
        const currency = (session.currency || "gbp").toUpperCase();

        const { error } = await supa.from("payments").insert({
          provider: "stripe",
          external_id,
          fingerprint,
          plan: `business-${plan}`,
          months,
          amount_cents,
          currency,
        });
        if (error) {
          // ignore "duplicate key" conflicts if retried
          if (!String(error.message || "").toLowerCase().includes("duplicate")) {
            console.error("payments insert error:", error);
          }
        }

        break;
      }

      default:
        // Unhandled event types are OK — acknowledge to prevent retries
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
