"use client";

import * as React from "react";
import { fingerprint } from "@/lib/fingerprint";

export default function AdminPreflightPage() {
  const [fp, setFp] = React.useState("");
  const [cronToken, setCronToken] = React.useState("");
  const [usage, setUsage] = React.useState<any>(null);
  const [purge, setPurge] = React.useState<any>(null);
  const [remind, setRemind] = React.useState<any>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => { fingerprint().then(setFp).catch(() => {}); }, []);

  async function pingUsage() {
    setErr(null); setUsage(null);
    try {
      const res = await fetch("/api/usage", { headers: { "x-fp": fp } });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Usage failed");
      setUsage(j);
    } catch (e: any) { setErr(e?.message || "Usage failed"); }
  }
  async function pingPurge() {
    setErr(null); setPurge(null);
    try {
      const res = await fetch("/api/cron/purge", { headers: { "x-cron-token": cronToken } });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Purge failed");
      setPurge(j);
    } catch (e: any) { setErr(e?.message || "Purge failed"); }
  }
  async function pingRemind() {
    setErr(null); setRemind(null);
    try {
      const res = await fetch("/api/cron/remind", { headers: { "x-cron-token": cronToken } });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Remind failed");
      setRemind(j);
    } catch (e: any) { setErr(e?.message || "Remind failed"); }
  }

  return (
    <div className="space-y-4" id="main">
      <h1 className="text-2xl font-semibold">Admin Preflight</h1>
      <p className="text-sm text-neutral-400">Quickly test API wiring and environment.</p>

      <section className="card p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-2">
          <div>
            <div className="text-sm text-neutral-400 mb-1">Fingerprint</div>
            <input className="input" value={fp} onChange={e => setFp(e.target.value)} />
          </div>
          <div>
            <div className="text-sm text-neutral-400 mb-1">Cron token</div>
            <input className="input" value={cronToken} onChange={e => setCronToken(e.target.value)} placeholder="ADMIN_CRON_TOKEN" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={pingUsage}>Ping /api/usage</button>
          <button className="btn" onClick={pingPurge}>Ping /api/cron/purge</button>
          <button className="btn" onClick={pingRemind}>Ping /api/cron/remind</button>
        </div>
        {err ? <div className="text-red-400 text-sm">{err}</div> : null}
        {usage ? <pre className="text-xs overflow-auto p-2 rounded bg-neutral-900">{JSON.stringify(usage, null, 2)}</pre> : null}
        {purge ? <pre className="text-xs overflow-auto p-2 rounded bg-neutral-900">{JSON.stringify(purge, null, 2)}</pre> : null}
        {remind ? <pre className="text-xs overflow-auto p-2 rounded bg-neutral-900">{JSON.stringify(remind, null, 2)}</pre> : null}
      </section>
    </div>
  );
}
