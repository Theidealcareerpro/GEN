// theidealprogen/src/components/cv/CVPreview.tsx
"use client";

import * as React from "react";
import type { CVData } from "@/lib/cv-types";

export default function CVPreview({ data }: { data: CVData }) {
  const tokens: React.CSSProperties = {
    ["--bg-page" as any]: data.theme.darkMode ? "#0f0f11" : "#ffffff",
    ["--fg-page" as any]: data.theme.darkMode ? "#e7e7e7" : "#0b0b0c",
    ["--muted" as any]: data.theme.darkMode ? "#9ca3af" : "#4b5563",
    ["--border" as any]: data.theme.darkMode ? "#2a2a2a" : "#e5e7eb",
    ["--primary" as any]: data.theme.primary,
  };

  const aspect = data.pdf?.pageSize === "LETTER" ? 216/279 : 210/297; // width/height in mm

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
          {/* Simple on-screen layout approximation */}
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 22 * (data.pdf?.scale ?? 1), fontWeight: 700 }}>{data.fullName || "Your Name"}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{data.role || "Your Role"}</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6, fontSize: 11, color: "var(--muted)" }}>
              {data.contact.email && <span>{data.contact.email}</span>}
              {data.contact.phone && <span>{data.contact.phone}</span>}
              {data.contact.website && <span>{data.contact.website}</span>}
              {data.contact.location && <span>{data.contact.location}</span>}
            </div>
          </div>

          <Section title="Summary">
            <p style={{ lineHeight: 1.4, fontSize: 12 }}>
              {data.summary || "Crisp, results-oriented summary goes here (3–4 sentences)."}
            </p>
          </Section>

          {!!data.skills?.length && (
            <Section title="Skills">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.skills.map((s, i) => (
                  <span key={i} className="px-2 py-1 rounded border" style={{ borderColor: "var(--border)", fontSize: 11 }}>
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <section style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{title}</div>
      {children}
    </section>
  );
}

function Dot({ c }: { c: string }) {
  return <span style={{ width: 10, height: 10, borderRadius: 999, background: c }} className="inline-block" />;
}
