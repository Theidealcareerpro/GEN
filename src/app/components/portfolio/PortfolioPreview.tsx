// theidealprogen/src/components/portfolio/PortfolioPreview.tsx
"use client";
import * as React from "react";
import type { PortfolioData } from "@/lib/portfolio-types";

export default function PortfolioPreview({ data }: { data: PortfolioData }) {
  const tokens: React.CSSProperties = {
    // CSS custom props via React inline style for fast theme preview
    ["--bg" as any]: data.theme.darkMode ? "#0b0b0c" : "#ffffff",
    ["--fg" as any]: data.theme.darkMode ? "#eaeaea" : "#0b0b0c",
    ["--muted" as any]: data.theme.darkMode ? "#9ca3af" : "#4b5563",
    ["--card" as any]: data.theme.darkMode ? "#0f0f11" : "#f8fafc",
    ["--border" as any]: data.theme.darkMode ? "#232323" : "#e5e7eb",
    ["--primary" as any]: data.theme.primary,
  };

  return (
    <div className="rounded-2xl border border-neutral-800 overflow-hidden" style={tokens}>
      <div className="flex items-center gap-1 px-3 py-2 border-b border-neutral-800 bg-neutral-900/50">
        <Dot c="#ff5f57" />
        <Dot c="#febc2e" />
        <Dot c="#28c840" />
        <div className="text-xs text-neutral-400 ml-2">Preview</div>
      </div>
      <div className="p-4 bg-[var(--card)] text-[var(--fg)]">
        <h2 className="text-xl font-semibold">{data.fullName || "Your Name"}</h2>
        <div className="text-sm text-[var(--muted)]">
          {(data.role || "Your Role") + (data.location ? ` · ${data.location}` : "")}
        </div>
        {data.about ? <p className="mt-2">{data.about}</p> : <p className="mt-2 text-[var(--muted)]">Short professional summary…</p>}

        {data.skills?.length ? (
          <>
            <h3 className="mt-4 font-medium">Skills</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.skills.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-2 py-1 rounded-full border border-neutral-700 text-sm">
                  {s.label}
                </span>
              ))}
            </div>
          </>
        ) : null}

        {data.projects?.length ? (
          <>
            <h3 className="mt-4 font-medium">Projects</h3>
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              {data.projects.map((p, i) => (
                <article key={i} className="rounded-xl border border-neutral-800 p-3">
                  <div className="font-semibold">{p.title || "Project title"}</div>
                  <div className="text-sm text-[var(--muted)] mt-1">{p.description || "Description…"}</div>
                  {p.tags?.length ? (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {p.tags.map((t, ti) => (
                        <span key={ti} className="inline-flex items-center gap-2 px-2 py-1 rounded-full border border-neutral-700 text-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {p.link ? (
                    <a
                      target="_blank"
                      rel="noopener"
                      href={p.link}
                      className="inline-block mt-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-[var(--primary)] text-white"
                    >
                      Visit
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </>
        ) : null}

        {data.testimonials?.length ? (
          <>
            <h3 className="mt-4 font-medium">Testimonials</h3>
            <div className="grid gap-3 mt-2">
              {data.testimonials.map((t, i) => (
                <blockquote key={i} className="rounded-xl border border-neutral-800 p-3">
                  <div className="italic">“{t.quote}”</div>
                  <div className="text-sm text-[var(--muted)] mt-1">
                    — {t.name}
                    {t.role ? `, ${t.role}` : ""}
                  </div>
                </blockquote>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Dot({ c }: { c: string }) {
  return <span style={{ width: 10, height: 10, borderRadius: 999, background: c }} className="inline-block" />;
}
