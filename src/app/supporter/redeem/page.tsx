"use client";

import * as React from "react";
import { fingerprint } from "@/lib/fingerprint";

export const metadata = {
  title: "Redeem Supporter — TheIdealProGen",
};

export default function RedeemSupporterPage() {
  const [fp, setFp] = React.useState("");
  const [receipt, setReceipt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState<null | { expires_at: string }>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    fingerprint().then(setFp).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const res = await fetch("/api/supporter/redeem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fingerprint: fp, receipt }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j?.error || "Redeem failed");
      setOk({ expires_at: j.expires_at });
    } catch (e: any) {
      setErr(e?.message || "Redeem failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4" id="main">
      <h1 className="text-2xl font-semibold">Redeem Supporter</h1>
      <p className="text-sm text-neutral-400">
        If your Buy Me a Coffee payment didn’t link automatically, paste your <strong>receipt / transaction ID</strong> here.
        We’ll grant Supporter (90 days) to your current device.
      </p>

      {ok && (
        <div className="rounded-xl border border-emerald-700 bg-emerald-900/30 text-emerald-200 p-3">
          Success! Your Supporter plan is active. New expiry: {new Date(ok.expires_at).toLocaleString()}.
        </div>
      )}
      {err && <div className="rounded-xl border border-red-700 bg-red-900/30 text-red-200 p-3">{err}</div>}

      <form onSubmit={submit} className="space-y-3 max-w-xl">
        <div>
          <label className="block mb-1 text-sm text-neutral-400">BMC Receipt / Transaction ID</label>
          <input
            className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100"
            placeholder="e.g. C_ABC123XYZ"
            value={receipt}
            onChange={(e) => setReceipt(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-xl border border-neutral-700 bg-indigo-600 text-white disabled:opacity-50"
            type="submit"
            disabled={loading || !receipt}
          >
            {loading ? "Redeeming…" : "Redeem"}
          </button>
          <a className="px-3 py-2 rounded-xl border border-neutral-700" href="/deployments">
            Go to My Deployments
          </a>
        </div>

        <p className="text-xs text-neutral-500">
          We match your receipt in our records and bind it to your device (fingerprint: {fp ? fp.slice(0, 8) : "…"}).
        </p>
      </form>
    </div>
  );
}
