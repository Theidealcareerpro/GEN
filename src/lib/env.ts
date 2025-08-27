// theidealprogen/src/lib/env.ts
export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  STRIPE_PRICE_3M: process.env.STRIPE_PRICE_3M || "",      // price_xxx for £5 / 3 months
  STRIPE_PRICE_6M: process.env.STRIPE_PRICE_6M || "",      // price_xxx for £10 / 6 months
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "",   // e.g. "GEN <noreply@yourdomain>"
  BMC_WEBHOOK_SECRET: process.env.BMC_WEBHOOK_SECRET || "", // simple shared secret
  ADMIN_CRON_TOKEN: process.env.ADMIN_CRON_TOKEN || "",     // for /api/cron/* endpoints
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",             // optional for purge cleanup
};
