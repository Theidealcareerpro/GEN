// theidealprogen/src/app/deployments/page.tsx
"use client";

import * as React from "react";
import { fingerprint } from "@/lib/fingerprint";
import { BUSINESS_EXTEND_OPTIONS } from "@/lib/plans";

type Deployment = {
  id: string;
  repo_name: string;
  pages_url: string;
  status: "active" | "archived" | "deleted";
  plan: "free" | "supporter" | "business";
  created_at: string;
  expires_at: string;
};

type Tier = "free" | "supporter" | "business";

export const metadata = {
  title: "My Deployments — TheIdealProGen",
};

export default function DeploymentsPage() {
  const [fp, setFp] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<Deployment[]>([]);
  const [tier, setTier] = React.useState<Tier>("free");
  const [banner, setBanner] = React.useState<null | { kind: "success" | "warn"; text: string }>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<null | { id: string; repo: string }>(null);

  // pick up query signals (?extend=success/cancel)
  React.useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const extend = search.get("extend");
    if (extend === "success") setBanner({ kind: "success", text: "Extension payment succeeded. Your expiry should update shortly." });
    if (extend === "cancel") setBanner({ kind: "warn", text: "Extension payment was cancelled." });
  }, []);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const id = await fingerprint();
        setFp(id);
        // read entitlements
        const ent = await fetch(`/api/entitlements?fingerprint=${encodeURIComponent(id)}`, { cache: "no-store" }).then(r => r.json());
        if (ent?.ok) setTier(ent.tier);
        // read deployments
        const res = await fetch(`/api/deployments?fingerprint=${encodeURIComponent(id)}`, { cache: "no-store" });
        const j = await res.json();
        if (!res.ok || !j.ok) throw new Error(j?.error || "Failed to load deployments");
        setItems(j.items || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function refresh() {
    if (!fp) return;
    const res = await fetch(`/api/deployments?fingerprint=${encodeURIComponent(fp)}`, { cache: "no-store" });
    const j = await res.json();
    if (j?.ok) setItems(j.items || []);
  }

  async function extend(id: string) {
    setError(null);
    const res = await fetch(`/api/deployments/${id}/extend`, { method: "POST" });
    const j = await res.json();
    if (!res.ok || !j.ok) { setError(j?.error || "Extend failed"); return; }
    setBanner({ kind: "success", text: `Extended to ${new Date(j.expiresAt).toLocaleString()}` });
    await refresh();
  }

  async function archive(id: string) {
    setError(null);
    const res = await fetch(`/api/deployments/${id}/archive`, { method: "POST" });
    const j = await res.json();
    if (!res.ok || !j.ok) { setError(j?.error || "Archive failed"); return; }
    await refresh();
  }

  async function unarchive(id: string) {
    setError(null);
    const res = await fetch(`/api/deployments/${id}/unarchive`, { method: "POST" });
    const j = await res.json();
    if (!res.ok || !j.ok) { setError(j?.error || "Unarchive failed"); return; }
    await refresh();
  }

  async function del(id: string) {
    setError(null);
    const res = await fetch(`/api/deployments/${id}/delete`, { method: "POST" });
    const j = await res.json();
    if (!res.ok || !j.ok) { setError(j?.error || "Delete failed"); return; }
    setConfirmDelete(null);
    await refresh();
  }

  async function businessExtendCheckout(deploymentId: string, months: number) {
    setError(null);
    const res = await fetch("/api/billing/extend/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ deploymentId, fingerprint: fp, months })
    });
    const j = await res.json();
    if (!res.ok || !j.ok || !j.url) { setError(j?.error || "Checkout failed"); return; }
    window.location.href = j.url;
  }

  async function upgradeBusinessCheckout() {
    setError(null);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fingerprint: fp })
    });
    const j = await res.json();
    if (!res.ok || !j.ok || !j.url) { setError(j?.error || "Checkout failed"); return; }
    window.location.href = j.url;
  }

  return (
    <div className="space-y-4" id="main">
      <h1 className="text-2xl font-semibold">My Deployments</h1>

      {/* Banner */}
      {banner && (
        <div className={`rounded-xl border p-3 ${banner.kind === "success" ? "border-emerald-700 bg-emerald-900/30 text-emerald-200" : "border-amber-700 bg-amber-900/30 text-amber-200"}`}>
          {banner.text}
        </div>
      )}
      {error && <div className="rounded-xl border border-red-800 bg-red-900/30 text-red-200 p-3">{error}</div>}

      {/* Tier card */}
      <section className="rounded-2xl border border-neutral-800 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm text-neutral-400">Current Plan</div>
          <div className="text-lg font-semibold capitalize">{tier}</div>
          <p className="text-xs text-neutral-500">
            Free: 21 days · Supporter: 90 days · Business: 365 days. Archived items are hard-deleted after 7 days.
          </p>
        </div>
        {tier === "business" ? (
          <div className="flex flex-wrap gap-2">
            {BUSINESS_EXTEND_OPTIONS.map((opt) => (
              <button
                key={opt.months}
                className="px-3 py-2 rounded-xl border border-neutral-700 bg-indigo-600 text-white"
                onClick={() => {
                  const active = items.find((i) => i.status !== "deleted");
                  if (!active) { setError("No deployment selected. Use the Extend buttons on a deployment."); return; }
                  businessExtendCheckout(active.id, opt.months);
                }}
                title="Buy per-deployment extension"
              >
                Extend {opt.months} mo — £{(opt.amount_gbp / 100).toFixed(2)}
              </button>
            ))}
          </div>
        ) : (
          <button className="px-3 py-2 rounded-xl border border-neutral-700 bg-indigo-600 text-white" onClick={upgradeBusinessCheckout}>
            Upgrade to Business
          </button>
        )}
      </section>

      {/* List */}
      <section className="space-y-3">
        {loading ? (
          <div className="text-neutral-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 p-4 text-neutral-400">
            No deployments yet. Create one from the <a className="underline" href="/portfolio">Portfolio builder</a>.
          </div>
        ) : (
          items.map((d) => (
            <article key={d.id} className="rounded-2xl border border-neutral-800 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-semibold">{d.repo_name}</div>
                  <div className="text-xs text-neutral-500">
                    Created: {fmt(d.created_at)} · Expires: <span className={new Date(d.expires_at) < new Date() ? "text-red-400" : ""}>{fmt(d.expires_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill text={d.status} />
                  <Pill text={d.plan} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  readOnly
                  value={d.pages_url}
                  className="flex-1 min-w-[240px] px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100"
                />
                <button
                  className="px-3 py-2 rounded-xl border border-neutral-700"
                  onClick={() => navigator.clipboard?.writeText(d.pages_url)}
                >
                  Copy URL
                </button>
                <a
                  className="px-3 py-2 rounded-xl border border-neutral-700 bg-indigo-600 text-white"
                  href={d.pages_url}
                  target="_blank"
                  rel="noopener"
                >
                  Open
                </a>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {/* Tier-based extend (free/supporter/business base window) */}
                {d.status !== "deleted" && (
                  <button className="px-3 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-900"
                          onClick={() => extend(d.id)}>
                    Extend
                  </button>
                )}
                {/* Paid extension only visible when user is Business */}
                {tier === "business" && d.status !== "deleted" &&
                  BUSINESS_EXTEND_OPTIONS.map(opt => (
                    <button key={opt.months}
                            className="px-3 py-2 rounded-xl border border-neutral-700"
                            onClick={() => businessExtendCheckout(d.id, opt.months)}>
                      +{opt.months} mo — £{(opt.amount_gbp/100).toFixed(2)}
                    </button>
                ))}
                {d.status === "active" && (
                  <button className="px-3 py-2 rounded-xl border border-neutral-700"
                          onClick={() => archive(d.id)}>
                    Archive
                  </button>
                )}
                {d.status === "archived" && (
                  <button className="px-3 py-2 rounded-xl border border-neutral-700"
                          onClick={() => unarchive(d.id)}>
                    Unarchive
                  </button>
                )}
                {d.status !== "deleted" && (
                  <button className="px-3 py-2 rounded-xl border border-red-700 text-red-200"
                          onClick={() => setConfirmDelete({ id: d.id, repo: d.repo_name })}>
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </section>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-3">
            <div className="text-lg font-semibold">Delete deployment</div>
            <p className="text-sm text-neutral-400">
              This will permanently delete the GitHub repository <span className="font-mono">{confirmDelete.repo}</span>.
              Type <span className="font-semibold">DELETE</span> to confirm.
            </p>
            <DeleteConfirm
              onCancel={() => setConfirmDelete(null)}
              onConfirm={() => del(confirmDelete.id)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ text }: { text: string }) {
  const colors =
    text === "active"
      ? "bg-emerald-900/30 border-emerald-700 text-emerald-200"
      : text === "archived"
      ? "bg-amber-900/30 border-amber-700 text-amber-200"
      : text === "deleted"
      ? "bg-red-900/30 border-red-700 text-red-200"
      : text === "business"
      ? "bg-indigo-900/30 border-indigo-700 text-indigo-200"
      : text === "supporter"
      ? "bg-sky-900/30 border-sky-700 text-sky-200"
      : "bg-neutral-900/30 border-neutral-700 text-neutral-300";
  return <span className={`text-xs px-2 py-1 rounded-full border ${colors} capitalize`}>{text}</span>;
}

function fmt(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleString();
  } catch {
    return s;
  }
}

function DeleteConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const [txt, setTxt] = React.useState("");
  const can = txt.trim().toUpperCase() === "DELETE";
  return (
    <div className="space-y-3">
      <input
        className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100"
        placeholder="Type DELETE to confirm"
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button className="px-3 py-2 rounded-xl border border-neutral-700" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="px-3 py-2 rounded-xl border border-red-700 text-red-200 disabled:opacity-50"
          onClick={onConfirm}
          disabled={!can}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
