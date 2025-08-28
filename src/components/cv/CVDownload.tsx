// theidealprogen/src/components/cv/CVDownload.tsx
"use client";

import * as React from "react";
import { pdf } from "@react-pdf/renderer";
import { sanitizeCV, type CVData } from "@/lib/cv-types";
import { cvFileName } from "@/lib/filename";
import ClassicDoc from "./templates/CVTemplateClassic";
import ModernDoc from "./templates/CVTemplateModern";

type Props = {
  data: CVData;
  showOpen?: boolean;
  className?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export default function CVDownload({
  data,
  showOpen = true,
  className = "",
  onSuccess,
  onError,
}: Props) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function generate(action: "download" | "open") {
    setBusy(true); setErr(null);
    try {
      const clean = sanitizeCV(data);
      const doc = clean.templateId === "modern" ? <ModernDoc data={clean} /> : <ClassicDoc data={clean} />;
      const blob = await pdf(doc).toBlob();

      if (action === "open") {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener");
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = cvFileName(clean.fullName);
        a.click();
        URL.revokeObjectURL(a.href);
      }
      onSuccess?.();
    } catch (e: any) {
      const msg = e?.message || "Failed to generate PDF";
      setErr(msg);
      onError?.(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showOpen && (
        <button className="btn" onClick={() => generate("open")} disabled={busy}>
          {busy ? "Rendering…" : "Open PDF"}
        </button>
      )}
      <button className="btn btn-primary" onClick={() => generate("download")} disabled={busy}>
        {busy ? "Rendering…" : "Download PDF"}
      </button>
      {err ? <span className="text-red-400 text-sm">{err}</span> : null}
    </div>
  );
}
