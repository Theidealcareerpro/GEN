// theidealprogen/src/components/portfolio/ThemePanel.tsx
"use client";
import * as React from "react";

export default function ThemePanel({
  value,
  onChange,
}: {
  value: { primary: string; darkMode: boolean };
  onChange: (v: { primary: string; darkMode: boolean }) => void;
}) {
  return (
    <section className="rounded-2xl border border-neutral-800 p-4 space-y-3">
      <div className="font-medium">Theme</div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm text-neutral-400">Primary</label>
        <input
          type="color"
          value={value.primary}
          onChange={(e) => onChange({ ...value, primary: e.target.value })}
          className="h-9 w-12 rounded-md border border-neutral-700 bg-neutral-900"
          aria-label="Primary color"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.darkMode}
          onChange={(e) => onChange({ ...value, darkMode: e.target.checked })}
          className="accent-indigo-500"
        />
        Dark mode
      </label>
    </section>
  );
}
