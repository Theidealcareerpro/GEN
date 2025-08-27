// theidealprogen/src/components/portfolio/SkillsEditor.tsx
"use client";
import * as React from "react";

export default function SkillsEditor({
  value,
  onChange,
}: {
  value: Array<{ label: string }>;
  onChange: (arr: Array<{ label: string }>) => void;
}) {
  const [input, setInput] = React.useState("");

  function add() {
    const label = input.trim();
    if (!label) return;
    onChange([...(value || []), { label }]);
    setInput("");
  }
  function remove(i: number) {
    const next = value.slice();
    next.splice(i, 1);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 w-full"
          placeholder="Add a skill and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? add() : undefined)}
        />
        <button onClick={add} className="px-3 py-2 rounded-xl border border-neutral-700">
          Add
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(value || []).map((s, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-2 py-1 rounded-full border border-neutral-700 text-sm">
            {s.label}
            <button className="px-1 text-neutral-400 hover:text-red-400" onClick={() => remove(i)} aria-label={`Remove ${s.label}`}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
