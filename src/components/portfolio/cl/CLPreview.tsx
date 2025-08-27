// theidealprogen/src/components/cl/CLPreview.tsx
"use client";

import * as React from "react";
import type { CLData } from "@/lib/cl-types";

export default function CLPreview({ data }: { data: CLData }) {
  const tokens: React.CSSProperties = {
    ["--bg-page" as any]: data.theme.darkMode ? "#0f0f11" : "#ffffff",
    ["--fg-page" as any]: data.theme.darkMode ? "#e7e7e7" : "#0b0b0c",
    ["--muted" as any]: data.theme.darkMode ? "#9ca3af" : "#4b5563",
    ["--border" as any]: data.theme.darkMode ? "#2a2a2a" : "#e5e7eb",
    ["--primary" as any]: data.theme.primary,
  };

  const aspect = data.pdf?.pageSize === "LETTER" ? 216/279 : 210/297;

  return (
    <div className="rounded-2xl border border-neutral-800 overflow-hidden" style={tokens}>
      <div className="flex items-center gap-1 px-3 py-2 border-b border-neutral-800 bg-neutral-900/60">
        <Dot c="#ff5f57" /><Dot c="#febc2e" /><Dot c="#28c840" />
        <div className="text-xs text-neutral-400 ml-2">Preview ({data.pdf?.pageSize || "A4"})</div>
      </div>

      <div className="p-4 bg-neutral-950">
        <div
          className="mx-auto w-full max-w-[820px] rounded-lg border"
          style={{
            background: "var(--bg-page)",
            color: "var(--fg-page)",
            borderColor: "var(--border)",
            boxShadow: "0 10px 30px rgba(0,0,0,.25)",
            aspectRatio: `${aspect}`,
            padding: 24 * (data.pdf?.scale ?? 1),
            overflow: "hidden",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700 }}>{data.fullName || "Your Name"}</div>
          {data.role ? <div style={{ color: "var(--muted)", marginTop: 2 }}>{data.role}</div> : null}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6, fontSize: 11, color: "var(--muted)" }}>
            {data.contact.email && <span>{data.contact.email}</span>}
            {data.contact.phone && <span>{data.contact.phone}</span>}
            {data.contact.website && <span>{data.contact.website}</span>}
            {data.contact.location && <span>{data.contact.location}</span>}
          </div>
          <div style={{ borderBottom: "1px solid var(--border)", marginTop: 8, marginBottom: 8 }} />
          <div style={{ fontSize: 12, marginBottom: 4 }}>{data.greeting || "Dear Hiring Manager,"}</div>
          {data.opener && <p style={{ fontSize: 12, lineHeight: 1.45 }}>{data.opener}</p>}
          {(data.paragraphs || []).map((p, i) => (
            <p key={i} style={{ fontSize: 12, lineHeight: 1.45 }}>{p}</p>
          ))}
          {(data.highlights || []).length > 0 && (
            <ul style={{ marginLeft: 16, marginTop: 6 }}>
              {data.highlights.map((h, i) => <li key={i} style={{ fontSize: 12, lineHeight: 1.45 }}>{h}</li>)}
            </ul>
          )}
          {data.closing && <p style={{ fontSize: 12, lineHeight: 1.45 }}>{data.closing}</p>}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12 }}>{data.signoff || "Sincerely,"}</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>{data.signatureName || data.fullName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot({ c }: { c: string }) {
  return <span style={{ width: 10, height: 10, borderRadius: 999, background: c }} className="inline-block" />;
}
