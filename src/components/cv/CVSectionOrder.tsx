// theidealprogen/src/components/cv/CVSectionOrder.tsx
"use client";

import * as React from "react";
import type { SectionKeyT } from "@/lib/cv-types";

const ALL: SectionKeyT[] = [
  "summary","skills","experience","education","projects","certifications","languages","interests"
];

export default function CVSectionOrder({
  order,
  hidden,
  onChange,
}: {
  order: SectionKeyT[];
  hidden: SectionKeyT[];
  onChange: (nextOrder: SectionKeyT[], nextHidden: SectionKeyT[]) => void;
}) {
  const [localOrder, setLocalOrder] = React.useState<SectionKeyT[]>(order.length ? order : ALL);
  const [localHidden, setLocalHidden] = React.useState<SectionKeyT[]>(hidden || []);

  React.useEffect(() => { setLocalOrder(order.length ? order : ALL); }, [order.join("|")]);
  React.useEffect(() => { setLocalHidden(hidden || []); }, [hidden.join("|")]);

  function up(i: number) {
    if (i <= 0) return;
    const next = localOrder.slice();
    [next[i-1], next[i]] = [next[i], next[i-1]];
    setLocalOrder(next); onChange(next, localHidden);
  }
  function down(i: number) {
    if (i >= localOrder.length - 1) return;
    const next = localOrder.slice();
    [next[i+1], next[i]] = [next[i], next[i+1]];
    setLocalOrder(next); onChange(next, localHidden);
  }
  function toggleHide(k: SectionKeyT) {
    const set = new Set(localHidden);
    if (set.has(k)) set.delete(k); else set.add(k);
    const next = Array.from(set) as SectionKeyT[];
    setLocalHidden(next); onChange(localOrder, next);
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {localOrder.map((k, i) => (
          <li key={k} className="rounded-xl border border-neutral-800 p-2 flex items-center gap-2">
            <button className="btn" onClick={() => up(i)} title="Move up">↑</button>
            <button className="btn" onClick={() => down(i)} title="Move down">↓</button>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!localHidden.includes(k)} onChange={() => toggleHide(k)} />
              <span className="capitalize">{k}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="text-xs text-neutral-500">Uncheck to hide a section. Use arrows to reorder.</p>
    </div>
  );
}
