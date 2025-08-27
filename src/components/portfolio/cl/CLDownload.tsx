// theidealprogen/src/components/cl/CLDownload.tsx
"use client";

import * as React from "react";
import { pdf } from "@react-pdf/renderer";
import { sanitizeCL, type CLData } from "@/lib/cl-types";
import { clFileName } from "@/lib/filename";
import ClassicDoc from "./templates/CLTemplateClassic";
import ModernDoc from "./templates/CLTemplateModern";

export default function CLDownload({ data, showOpen = true, className = "" }: { data: CLData; showOpen?: boolean; className?: string; }) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function generate(action: "download" | "open") {
    setBusy(true); setErr(null);
    try {
      const clean = sanitizeCL(data);
      const doc = clean.templateId === "modern" ? <ModernDoc data={clean} /> : <ClassicDoc data={clean} />;
      const blob = await pdf(doc).toBlob();

      if (action === "open") {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener");
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = clFileName(clean.fullName, clean.company);
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to generate PDF");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showOpen && <button className="btn" onClick={() => generate("open")} disabled={busy}>{busy ? "Rendering…" : "Open PDF"}</button>}
      <button className="btn btn-primary" onClick={() => generate("download")} disabled={busy}>{busy ? "Rendering…" : "Download PDF"}</button>
      {err ? <span className="text-red-400 text-sm">{err}</span> : null}
    </div>
  );
}
