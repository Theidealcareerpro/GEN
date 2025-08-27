// theidealprogen/src/components/cl/CLBuilderPage.tsx
"use client";

import * as React from "react";
import { EMPTY_CL, sanitizeCL, type CLData, wordCount, type SectionKeyT } from "@/lib/cl-types";
import CLPreview from "./CLPreview";
import CLWrapper from "./CLWrapper";
import CLDownload from "./CLDownload";
import CLImportExport from "./CLImportExport";
import CLATSChecklist from "./CLATSChecklist";
import CLSectionOrder from "./CLSectionOrder";

const DEBOUNCE = 150;

export default function CLBuilderPage() {
  const [data, setData] = React.useState<CLData>({ ...EMPTY_CL });

  React.useEffect(() => {
    const id = setTimeout(() => { try { localStorage.setItem("cl.draft", JSON.stringify(data)); } catch {} }, DEBOUNCE);
    return () => clearTimeout(id);
  }, [data]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("cl.draft");
      if (raw) setData(sanitizeCL(JSON.parse(raw)));
      else setData(sampleCL());
    } catch {}
  }, []);

  function patch(p: Partial<CLData>) { setData(d => sanitizeCL({ ...d, ...p })); }
  function importFromJSON(incoming: any) {
    try { setData(sanitizeCL({ ...data, ...incoming })); } catch { alert("Invalid JSON"); }
  }

  const contentWordCount = wordCount([data.opener, ...(data.paragraphs || []), data.closing].join(" "));
  const fitness = contentWordCount < 200 ? "⚠️ Short (aim 200–450 words)" :
                  contentWordCount > 450 ? "⚠️ Long (aim 200–450 words)" : "✅ Good length";

  return (
    <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
      {/* Left Pane */}
      <aside className="space-y-4">
        <section className="card p-4 space-y-3">
          <div className="font-medium">Identity</div>
          <input className="input" placeholder="Full name" value={data.fullName} onChange={e => patch({ fullName: e.target.value })} />
          <input className="input" placeholder="Role (optional)" value={data.role || ""} onChange={e => patch({ role: e.target.value })} />
          <input className="input" placeholder="Email" value={data.contact.email} onChange={e => patch({ contact: { ...data.contact, email: e.target.value } })} />
          <input className="input" placeholder="Phone" value={data.contact.phone} onChange={e => patch({ contact: { ...data.contact, phone: e.target.value } })} />
          <input className="input" placeholder="Website (https://…)" value={data.contact.website} onChange={e => patch({ contact: { ...data.contact, website: e.target.value } })} />
          <input className="input" placeholder="Location" value={data.contact.location} onChange={e => patch({ contact: { ...data.contact, location: e.target.value } })} />
        </section>

        <section className="card p-4 space-y-3">
          <div className="font-medium">Target</div>
          <input className="input" placeholder="Company" value={data.company} onChange={e => patch({ company: e.target.value })} />
          <input className="input" placeholder="Job Title" value={data.jobTitle} onChange={e => patch({ jobTitle: e.target.value })} />
          <input className="input" placeholder="Job Reference (optional)" value={data.jobRef} onChange={e => patch({ jobRef: e.target.value })} />
        </section>

        <section className="card p-4 space-y-3">
          <div className="font-medium">Template & Layout</div>
          <select className="input" value={data.templateId} onChange={e => patch({ templateId: e.target.value as any })}>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
          </select>
          <select className="input" value={data.font} onChange={e => patch({ font: e.target.value as any })}>
            <option value="helvetica">Helvetica</option>
            <option value="times">Times</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-sm text-neutral-400 mb-1">Page size</div>
              <select className="input" value={data.pdf.pageSize} onChange={e => patch({ pdf: { ...data.pdf, pageSize: e.target.value as any } })}>
                <option value="A4">A4</option>
                <option value="LETTER">Letter</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-neutral-400 mb-1">Scale ({data.pdf.scale.toFixed(2)}x)</div>
              <input
                type="range" min={0.9} max={1.2} step={0.01} value={data.pdf.scale}
                onChange={e => patch({ pdf: { ...data.pdf, scale: Number(e.target.value) } })}
                className="w-full"
              />
            </div>
          </div>
        </section>

        <section className="card p-4 space-y-3">
          <div className="font-medium">Sections order & visibility</div>
          <CLSectionOrder
            order={data.sectionsOrder as SectionKeyT[]}
            hidden={data.hiddenSections as SectionKeyT[]}
            onChange={(nextOrder, nextHidden) => patch({ sectionsOrder: nextOrder, hiddenSections: nextHidden })}
          />
        </section>

        <CLImportExport data={data} onImport={importFromJSON} />
      </aside>

      {/* Right Pane */}
      <main className="space-y-4">
        <section className="card p-4 space-y-3">
          <div className="font-medium">Greeting</div>
          <input className="input" placeholder="Dear Hiring Manager," value={data.greeting} onChange={e => patch({ greeting: e.target.value })} />
        </section>

        <section className="card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium">Opener & Body</div>
            <div className="text-xs text-neutral-400">{contentWordCount} words · {fitness}</div>
          </div>
          <textarea className="textarea" placeholder="Opener paragraph (why you're a fit + company hook)" value={data.opener} onChange={e => patch({ opener: e.target.value })} />
          <BodyEditor
            value={data.paragraphs}
            onChange={(v) => patch({ paragraphs: v })}
          />
        </section>

        <section className="card p-4 space-y-3">
          <div className="font-medium">Highlights (optional)</div>
          <HighlightsEditor
            value={data.highlights}
            onChange={(v) => patch({ highlights: v })}
          />
        </section>

        <section className="card p-4 space-y-3">
          <div className="font-medium">Closing</div>
          <textarea className="textarea" placeholder="Closing paragraph (CTA + thanks)" value={data.closing} onChange={e => patch({ closing: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-2">
            <input className="input" placeholder='Sign-off (e.g., "Sincerely,")' value={data.signoff} onChange={e => patch({ signoff: e.target.value })} />
            <input className="input" placeholder="Signature name" value={data.signatureName || data.fullName} onChange={e => patch({ signatureName: e.target.value })} />
          </div>
        </section>

        <CLATSChecklist data={data} />

        <CLWrapper
          preview={<CLPreview data={data} />}
          actions={<CLDownload data={data} />}
        />
      </main>
    </div>
  );
}

function BodyEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [items, setItems] = React.useState<string[]>(value || []);
  React.useEffect(() => setItems(value || []), [JSON.stringify(value)]);

  function add() { const next = [...items, ""]; setItems(next); onChange(next); }
  function rm(i: number) { const next = items.slice(); next.splice(i, 1); setItems(next); onChange(next); }
  function upd(i: number, text: string) { const next = items.slice(); next[i] = text; setItems(next); onChange(next); }

  return (
    <div className="space-y-2">
      <button className="btn" onClick={add}>Add paragraph</button>
      {items.map((p, i) => (
        <div key={i} className="flex gap-2">
          <textarea className="textarea" placeholder={`Paragraph ${i+1}`} value={p} onChange={e => upd(i, e.target.value)} />
          <button className="btn" onClick={() => rm(i)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

function HighlightsEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [items, setItems] = React.useState<string[]>(value || []);
  React.useEffect(() => setItems(value || []), [JSON.stringify(value)]);

  function add() { const next = [...items, ""]; setItems(next); onChange(next); }
  function rm(i: number) { const next = items.slice(); next.splice(i, 1); setItems(next); onChange(next); }
  function upd(i: number, text: string) { const next = items.slice(); next[i] = text; setItems(next); onChange(next); }

  return (
    <div className="space-y-2">
      <button className="btn" onClick={add}>Add highlight</button>
      {items.map((t, i) => (
        <div key={i} className="flex gap-2">
          <input className="input" placeholder="Impact bullet" value={t} onChange={e => upd(i, e.target.value)} />
          <button className="btn" onClick={() => rm(i)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

function sampleCL(): CLData {
  return {
    fullName: "Alex Johnson",
    role: "Frontend Engineer",
    contact: { email: "alex@example.com", phone: "+44 7700 900000", website: "https://alex.dev", location: "London, UK" },
    company: "Acme Corp",
    jobTitle: "Senior Frontend Engineer",
    jobRef: "REQ-12345",
    greeting: "Dear Hiring Manager,",
    opener: "I’m excited to apply for the Senior Frontend Engineer role at Acme Corp. With 5+ years building fast, accessible web apps in React/Next.js, I can contribute immediately to your growth roadmap.",
    paragraphs: [
      "At Bright Studio, I led a design system initiative that standardized UI across 5 product teams, reducing build time by 30% and improving accessibility scores to AA.",
      "I enjoy partnering with design and backend to ship pragmatic features under performance budgets. I introduced visual regression tests and raised Lighthouse scores across key flows.",
    ],
    highlights: [
      "Migrated legacy SSR stack to Next.js App Router; improved TTFB by 32%.",
      "Built analytics dashboards that reduced decision latency for PMs by 40%.",
    ],
    closing: "I’d welcome the chance to discuss how I can help Acme deliver delightful, performant experiences at scale. Thank you for your time.",
    signoff: "Sincerely,",
    signatureName: "Alex Johnson",
    templateId: "modern",
    font: "helvetica",
    theme: { primary: "#6366f1", darkMode: true },
    pdf: { pageSize: "A4", scale: 1 },
    sectionsOrder: ["header","dateLine","recipient","greeting","opener","body","highlights","closing","signature"],
    hiddenSections: [],
  };
}
