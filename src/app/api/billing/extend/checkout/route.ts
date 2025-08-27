import { NextResponse } from "next/server";
import { isSupportedBusinessMonths, priceForBusinessMonthsGBP } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const deploymentId = String(body?.deploymentId || "");
    const fingerprint = String(body?.fingerprint || "");
    const months = Number(body?.months || 0);

    if (!deploymentId || !fingerprint) return NextResponse.json({ ok: false, error: "Missing deploymentId or fingerprint" }, { status: 400 });
    if (!isSupportedBusinessMonths(months)) return NextResponse.json({ ok: false, error: "Unsupported months" }, { status: 400 });

    const secret = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (!secret) return NextResponse.json({ ok: false, error: "Stripe not configured" }, { status: 500 });

    // Dynamic (no price IDs)
    // @ts-ignore
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });

    const amount = priceForBusinessMonthsGBP(months)!; // pence
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "gbp",
          unit_amount: amount,
          product_data: {
            name: `Extend hosting ${months} month${months > 1 ? "s" : ""}`,
            description: "Business extension for one portfolio deployment"
          }
        },
        quantity: 1
      }],
      success_url: `${siteUrl}/deployments?extend=success`,
      cancel_url: `${siteUrl}/deployments?extend=cancel`,
      metadata: {
        action: "extend",
        deployment_id: deploymentId,
        fingerprint,
        months: String(months)
      }
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Checkout failed" }, { status: 500 });
  }
}
