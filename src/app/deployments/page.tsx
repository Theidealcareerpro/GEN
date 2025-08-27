"use client";

import * as React from "react";
import { getUsage, createExtendCheckout } from "@/lib/client/api";
import { getFingerprint } from "@/lib/client/fp";

type Item = {
  id: string;
  site_url: string;
  status: "active" | "expired" | "deleted";
  tier: "free" | "supporter" | "business";
  created_at: string;
  expires_at: string;
  repo: string;
};

export default function DeploymentsPage() {
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [fp, setFp] = React.useState<string>("");
  const [items, setItems] = React.useState<Item[]>([]);
  const [meta, setMeta] = React.useState<any>(null);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const f = getFingerprint(); setFp(f);
      const res = await fetch("/api/usage", { headers: { "x-fp": f } });
      if (!res.ok) throw new Error("Failed to fetch usage");
      const j = await res.json();
      setItems(j.items || []);
      setMeta(j);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  async function goBusiness(plan: "3m" | "6m") {
    try {
      const { url } = await createExtendCheckout({ fingerprint: fp, plan, tier: "business" });
      if (url) window.location.href = url;
    } catch (e: any) {
      alert(e?.message || "Checkout failed");
    }
  }

  function goSupporter(months: 3 | 6) {
    const u = new URL(window.location.origin + "/supporter/redeem");
    u.searchParams.set("fp", fp);
    u.searchParams.set("months", String(months));
    window.location.href = u.toString();
  }

  function copy(url: string) {
    navigator.clipboard?.writeText(url);
  }

  return (
    <div className="space-y-4" id="main">
      <h1 className="text-2xl font-semibold">My Deployments</h1>
      <p className="text-sm text-neutral-400">
        Fingerprint: <span className="font-mono">{fp || "—"}</span>
      </p>

      {loading ? <div className="text-neutral-400">Loading…</div> : null}
      {err ? <div className="text-red-400">{err}</div> : null}

      {!!meta && (
        <div className="card p-4 grid gap-2 sm:grid-cols-3">
          <div><div className="text-xs text-neutral-400">CV exports</div><div className="text-lg">{meta.cv_exports ?? 0}</div></div>
          <div><div className="text-xs text-neutral-400">Cover letters</div><div className="text-lg">{meta.cl_exports ?? 0}</div></div>
          <div><div className="text-xs text-neutral-400">Deployments</div><div className="text-lg">{meta.deployments ?? (items?.length ?? 0)}</div></div>
          <div className="sm:col-span-3 text-xs text-neutral-500">
            Supporter until: {meta.supporter_until || "—"} · Business until: {meta.business_until || "—"}
          </div>
        </div>
      )}

      <section className="card p-4 space-y-3">
        <div className="font-medium">Extend Hosting</div>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={() => goSupporter(3)}>Supporter 3 months (£5)</button>
          <button className="btn" onClick={() => goSupporter(6)}>Supporter 6 months (£10)</button>
          <button className="btn btn-primary" onClick={() => goBusiness(3)}>Business 3 months (£5)</button>
          <button className="btn btn-primary" onClick={() => goBusiness(6)}>Business 6 months (£10)</button>
        </div>
        <p className="text-xs text-neutral-500">
          Supporter uses Buy Me a Coffee (via Redeem). Business uses Stripe Checkout.
        </p>
      </section>

      <section className="card p-4 space-y-3">
        <div className="font-medium">Sites</div>
        <div className="space-y-2">
          {(items || []).length === 0 ? (
            <div className="text-neutral-400 text-sm">No deployments yet.</div>
          ) : (
            items.map((d) => (
              <div key={d.id} className="rounded-xl border border-neutral-800 p-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                <div className="min-w-0">
                  <div className="truncate">
                    <a className="text-sky-400 hover:underline" href={d.site_url} target="_blank" rel="noreferrer">{d.site_url}</a>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Repo: {d.repo} · Status: {d.status} · Tier: {d.tier} · Expires: {d.expires_at || "—"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn" onClick={() => copy(d.site_url)}>Copy URL</button>
                  <a className="btn" href={d.site_url} target="_blank" rel="noreferrer">Open</a>
                  <button className="btn" onClick={() => goSupporter(3)}>Extend Supporter 3m</button>
                  <button className="btn" onClick={() => goBusiness(3)}>Extend Business 3m</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
