"use client";

import * as React from "react";
import { fingerprint } from "@/lib/fingerprint";
import { createExtendCheckout } from "@/lib/client/api";

export default function DeploySuccessPage({ searchParams }: { searchParams?: { url?: string; repo?: string } }) {
  const url = searchParams?.url || "";
  const repo = searchParams?.repo || "";
  const [fp, setFp] = React.useState("");

  React.useEffect(() => { fingerprint().then(setFp).catch(() => {}); }, []);

  function copy() { if (url) navigator.clipboard?.writeText(url); }
  function openNew() { if (url) window.open(url, "_blank", "noopener,noreferrer"); }

  function supporter(months: 3 | 6) {
    const u = new URL(window.location.origin + "/supporter/redeem");
    u.searchParams.set("fp", fp);
    u.searchParams.set("months", String(months));
    window.location.href = u.toString();
  }

  async function business(plan: "3m" | "6m") {
    try {
      const { url: checkout } = await createExtendCheckout({ fingerprint: fp, plan, tier: "business" });
      if (checkout) window.location.href = checkout;
    } catch (e: any) { alert(e?.message || "Checkout failed"); }
  }

  return (
    <div className="space-y-4" id="main">
      <h1 className="text-2xl font-semibold">Deployment Successful 🎉</h1>
      <section className="card p-4 space-y-3">
        <div className="font-medium">Your site</div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
          <div className="truncate">
            <a className="text-sky-400 hover:underline" href={url} target="_blank" rel="noreferrer">{url || "—"}</a>
            <div className="text-xs text-neutral-500">Repo: {repo || "—"}</div>
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={copy}>Copy URL</button>
            <button className="btn btn-primary" onClick={openNew}>Open in new tab</button>
          </div>
        </div>
      </section>

      <section className="card p-4 space-y-3">
        <div className="font-medium">Keep it live longer</div>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={() => supporter(3)}>Supporter 3 months (£5)</button>
          <button className="btn" onClick={() => supporter(6)}>Supporter 6 months (£10)</button>
          <button className="btn btn-primary" onClick={() => business(3)}>Business 3 months (£5)</button>
          <button className="btn btn-primary" onClick={() => business(6)}>Business 6 months (£10)</button>
        </div>
        <p className="text-xs text-neutral-500">Supporter via Redeem, Business via Stripe Checkout.</p>
      </section>

      <div className="text-sm text-neutral-500">
        Tip: bookmark your <a className="text-sky-400 hover:underline" href="/deployments">Deployments</a> to manage status and extensions.
      </div>
    </div>
  );
}
