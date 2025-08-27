// theidealprogen/src/app/api/checkout/extend/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/server/stripe";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

  const { plan, fingerprint, tier } = await req.json(); 
  // plan: '3m' | '6m'; tier: 'supporter' | 'business'
  if (!fingerprint || !plan || !tier) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const price = plan === "3m" ? env.STRIPE_PRICE_3M : env.STRIPE_PRICE_6M;
  if (!price) return NextResponse.json({ error: "Missing Stripe price id" }, { status: 500 });

  const site = env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "http://localhost:3000";
  const success = `${site}/deployments?entitlement=ok`;
  const cancel = `${site}/deployments?entitlement=cancelled`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price, quantity: 1 }],
    success_url: success,
    cancel_url: cancel,
    metadata: {
      fingerprint,
      plan,
      tier,
    },
  });

  return NextResponse.json({ id: session.id, url: session.url });
}
