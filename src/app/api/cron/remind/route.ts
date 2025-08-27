// theidealprogen/src/app/api/cron/remind/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supa } from "@/lib/server/supabase";
import { sendExpiryReminder } from "@/lib/server/email";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-cron-token");
  if (!env.ADMIN_CRON_TOKEN || auth !== env.ADMIN_CRON_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If you collect emails when deploying (optional), they could be stored in deployments.metadata.email
  const target = new Date(); target.setDate(target.getDate() + 3);
  const soon = target.toISOString();

  const { data: items } = await supa
    .from("deployments")
    .select("site_url, metadata")
    .gt("expires_at", new Date().toISOString())
    .lte("expires_at", soon)
    .eq("status", "active");

  let sent = 0;
  for (const d of items || []) {
    const email = (d.metadata as any)?.email;
    if (email) {
      await sendExpiryReminder(email, d.site_url, 3);
      sent++;
    }
  }
  return NextResponse.json({ reminded: sent });
}
