"use client";

import * as React from "react";
import { getFingerprint } from "@/lib/client/fp";

export default function RedeemSupporterPage() {
  const [fp, setFp] = React.useState("");
  const [months, setMonths] = React.useState<3 | 6>(3);
  const [receipt, setReceipt] = React.useState("");
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    const u = new URL(window.location.href);
    const pref = u.searchParams.get("fp");
    const m = u.searchParams.get("months");
    setFp(pref || getFingerprint());
    if (m === "6") setMonths(6); else setMonths(3);
  }, []);

  async function redeem() {
    setBusy(true); setMsg(null); setErr(null);
    try {
      const res = await fetch("/api/redeem/supporter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fingerprint: fp, months, external_id: receipt, code }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Redeem failed");
      setMsg("Success! Entitlements extended.");
    } catch (e: any) {
      setErr(e?.message || "Redeem failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4" id="main">
      <h1 className="text-2xl font-semibold">Supporter Redeem</h1>
      <p className="text-sm text-neutral-400">Manual redemption when BMC can’t pass the fingerprint.</p>

      <section className="card p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-2">
          <div>
            <div className="text-sm text-neutral-400 mb-1">Fingerprint</div>
            <input className="input" value={fp} onChange={e => setFp(e.target.value)} />
          </div>
          <div>
            <div className="text-sm text-neutral-400 mb-1">Months</div>
            <select className="input" value={months} onChange={e => setMonths(Number(e.target.value) as 3 | 6)}>
              <option value={3}>3 months (£5)</option>
              <option value={6}>6 months (£10)</option>
            </select>
          </div>
        </div>
        <div>
          <div className="text-sm text-neutral-400 mb-1">Receipt / Reference</div>
          <input className="input" placeholder="Paste BMC receipt ID, email, or note" value={receipt} onChange={e => setReceipt(e.target.value)} />
        </div>
        <div>
          <div className="text-sm text-neutral-400 mb-1">Redeem code</div>
          <input className="input" placeholder="Admin redeem code" value={code} onChange={e => setCode(e.target.value)} />
          <p className="text-xs text-neutral-500">Ask the site owner for a one-time code after they verify your receipt.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={redeem} disabled={busy || !fp || !receipt || !code}>{busy ? "Redeeming…" : "Redeem"}</button>
          <a className="btn" href="/deployments">Go to My Deployments</a>
        </div>
        {msg ? <div className="text-emerald-400 text-sm">{msg}</div> : null}
        {err ? <div className="text-red-400 text-sm">{err}</div> : null}
      </section>
    </div>
  );
}
