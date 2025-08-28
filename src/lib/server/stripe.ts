// theidealprogen/src/lib/server/stripe.ts
import Stripe from "stripe";
import { env } from "@/lib/env";

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-28.basil" })
  : (null as unknown as Stripe);
