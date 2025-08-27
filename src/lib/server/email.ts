// theidealprogen/src/lib/server/email.ts
import { Resend } from "resend";
import { env } from "@/lib/env";

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendExpiryReminder(toEmail: string, siteUrl: string, daysLeft: number) {
  if (!resend || !env.RESEND_FROM_EMAIL) return;
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: toEmail,
    subject: `Your portfolio expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
    html: `
      <p>Hi there,</p>
      <p>Your hosted portfolio will expire in <strong>${daysLeft} day${daysLeft === 1 ? "" : "s"}</strong>.</p>
      <p>Visit <a href="${siteUrl}">${siteUrl}</a> to extend (Supporter or Business) and keep it live.</p>
      <p>— GEN</p>
    `,
  });
}
