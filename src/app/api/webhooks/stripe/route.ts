// theidealprogen/src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/server/stripe";
import { env } from "@/lib/env";
import Stripe from "stripe";
import { extendForMonths } from "@/lib/entitlements";
import { supa } from "@/lib/server/supabase";

export async function POST(req: NextRequest) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text();

  let evt: Stripe.Event;
  try {
    evt = stripe.webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (e: any) {
    return new NextResponse(`Webhook Error: ${e.message}`, { status: 400 });
  }

  if (evt.type === "checkout.session.completed") {
    const session = evt.data.object as Stripe.Checkout.Session;
    const fp = (session.metadata?.fingerprint || "").slice(0, 120);
    const plan = session.metadata?.plan as "3m" | "6m";
    const tier = (session.metadata?.tier as "supporter" | "business") || "supporter";
    const months = plan === "6m" ? 6 : 3;

    if (fp) {
      await extendForMonths(fp, months, tier);

      // record payment
      await supa.from("payments").insert({
        provider: "stripe",
        external_id: session.id,
        fingerprint: fp,
        plan: `${tier}-${plan}`,
        months,
        amount_cents: (session.amount_total || 0),
        currency: (session.currency || "gbp").toUpperCase(),
      });
    }
  }

  return NextResponse.json({ received: true });
}

export const config = { api: { bodyParser: false } }; // Next.js ignores; App Router already gives raw body to text()
