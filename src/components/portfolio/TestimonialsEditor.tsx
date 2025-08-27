// theidealprogen/src/components/portfolio/TestimonialsEditor.tsx
"use client";
import * as React from "react";

export default function TestimonialsEditor({
  value,
  onChange,
}: {
  value: Array<{ name: string; role?: string; quote: string }>;
  onChange: (arr: Array<{ name: string; role?: string; quote: string }>) => void;
}) {
  function add() {
    onChange([...(value || []), { name: "", role: "", quote: "" }]);
  }
  function rm(i: number) {
    const next = value.slice();
    next.splice(i, 1);
    onChange(next);
  }
  function upd(i: number, patch: any) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <button onClick={add} className="px-3 py-2 rounded-xl border border-neutral-700">
        Add testimonial
      </button>
      <ul className="space-y-2">
        {(value || []).map((t, i) => (
          <li key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2">
            <div className="grid sm:grid-cols-3 gap-2">
              <input
                className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900"
                placeholder="Name"
                value={t.name}
                onChange={(e) => upd(i, { name: e.target.value })}
              />
              <input
                className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900"
                placeholder="Role (optional)"
                value={t.role || ""}
                onChange={(e) => upd(i, { role: e.target.value })}
              />
              <button className="px-3 py-2 rounded-xl border border-neutral-700 text-red-400" onClick={() => rm(i)}>
                Remove
              </button>
            </div>
            <textarea
              className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900"
              rows={3}
              placeholder="Quote"
              value={t.quote}
              onChange={(e) => upd(i, { quote: e.target.value })}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
