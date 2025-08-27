// theidealprogen/src/app/api/billing/checkout/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fingerprint = String(body?.fingerprint || "");
    if (!fingerprint) return NextResponse.json({ ok: false, error: "Missing fingerprint" }, { status: 400 });

    const secret = process.env.STRIPE_SECRET_KEY;
    const price = process.env.STRIPE_PRICE_ID; // recurring or one-time
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (!secret || !price) return NextResponse.json({ ok: false, error: "Stripe not configured" }, { status: 500 });

    // dynamic import so build doesn't fail if stripe isn't installed yet
    // @ts-ignore
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // or "payment" if one-time
      line_items: [{ price, quantity: 1 }],
      success_url: `${siteUrl}/upgrade?status=success`,
      cancel_url: `${siteUrl}/upgrade?status=cancel`,
      metadata: { fingerprint }
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Checkout failed" }, { status: 500 });
  }
}
