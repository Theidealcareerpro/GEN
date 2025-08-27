// theidealprogen/src/components/cl/CLImportExport.tsx
"use client";
import * as React from "react";

export default function CLImportExport({ data, onImport }: { data: any; onImport: (j: any) => void }) {
  const file = React.useRef<HTMLInputElement>(null);

  function exportJson() {
    const name = (data?.fullName || "cover-letter").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const blob = new Blob([JSON.stringify({ coverLetter: data }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name || "cover-letter"}.json`;
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
        if (!j.coverLetter) throw new Error("Invalid file");
        onImport(j.coverLetter);
      } catch {
        alert("Invalid JSON");
      }
    };
    r.readAsText(f);
    e.currentTarget.value = "";
  }

  return (
    <section className="card p-4 space-y-3">
      <div className="font-medium">Import / Export</div>
      <div className="flex gap-2">
        <button className="btn" onClick={exportJson}>Export JSON</button>
        <button className="btn" onClick={() => file.current?.click()}>Import JSON</button>
        <input ref={file} type="file" accept="application/json" className="hidden" onChange={importJson} />
      </div>
      <p className="text-xs text-neutral-500">Backup your letter or move it between templates.</p>
    </section>
  );
}
