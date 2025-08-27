// theidealprogen/src/components/portfolio/ImportExport.tsx
"use client";
import * as React from "react";

export default function ImportExport({
  templateId,
  data,
  onImport,
}: {
  templateId: string;
  data: any;
  onImport: (incoming: any) => void;
}) {
  const file = React.useRef<HTMLInputElement>(null);

  function exportJson() {
    const blob = new Blob([JSON.stringify({ templateId, site: data }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const name = (data?.fullName || "portfolio").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `${name || "portfolio"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(String(r.result || "{}"));
        if (!j.site) throw new Error("Invalid file");
        onImport(j.site);
      } catch {
        alert("Invalid JSON");
      }
    };
    r.readAsText(f);
    e.currentTarget.value = "";
  }

  return (
    <section className="rounded-2xl border border-neutral-800 p-4 space-y-3">
      <div className="font-medium">Import / Export</div>
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-900" onClick={exportJson}>
          Export JSON
        </button>
        <button className="px-3 py-2 rounded-xl border border-neutral-700" onClick={() => file.current?.click()}>
          Import JSON
        </button>
        <input ref={file} type="file" accept="application/json" className="hidden" onChange={importJson} />
      </div>
      <p className="text-xs text-neutral-500">Reuse your content across templates.</p>
    </section>
  );
}
