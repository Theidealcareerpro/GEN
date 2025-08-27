"use client";

import * as React from "react";
import { fingerprint } from "@/lib/fingerprint";

type Tier = "free" | "supporter" | "business";
type Deployment = { status: "active" | "archived" | "deleted" };

export default function DeployStatus() {
  const [fp, setFp] = React.useState<string>("");
  const [tier, setTier] = React.useState<Tier>("free");
  const [active, setActive] = React.useState(0);
  const [archived, setArchived] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const id = await fingerprint();
      setFp(id);
      const ent = await fetch(`/api/entitlements?fingerprint=${encodeURIComponent(id)}`, { cache: "no-store" }).then(r => r.json()).catch(() => null);
      if (ent?.ok && ent?.tier) setTier(ent.tier);

      const list = await fetch(`/api/deployments?fingerprint=${encodeURIComponent(id)}`, { cache: "no-store" }).then(r => r.json()).catch(() => null);
      if (list?.ok && Array.isArray(list.items)) {
        const a = (list.items as Deployment[]).filter(x => x.status === "active").length;
        const ar = (list.items as Deployment[]).filter(x => x.status === "archived").length;
        setActive(a); setArchived(ar);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <section className="rounded-2xl border border-neutral-800 p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-1">
        <div className="text-sm text-neutral-400">Account & Deployments</div>
        {loading ? (
          <div className="text-neutral-400">Loading…</div>
        ) : (
          <>
            <div className="text-lg font-semibold capitalize">Plan: {tier}</div>
            <div className="text-xs text-neutral-500">Active: {active} · Archived: {archived}</div>
          </>
        )}
      </div>
      <a className="px-3 py-2 rounded-xl border border-neutral-700 bg-indigo-600 text-white" href="/deployments">
        My Deployments
      </a>
    </section>
  );
}
