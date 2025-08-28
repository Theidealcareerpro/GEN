// theidealprogen/src/components/cv/CVBuilderPage.tsx
"use client";

import * as React from "react";
import { z } from "zod";
import { EMPTY_CV, sanitizeCV, type CVData, type SectionKeyT, wordCount } from "@/lib/cv-types";
import CVPreview from "./CVPreview";
import CVImportExport from "./CVImportExport";
import CVDownload from "./CVDownload";
import CVWrapper from "./CVWrapper";
import CVSectionOrder from "./CVSectionOrder";
import CVATSChecklist from "./CVATSChecklist";

const DEBOUNCE = 150;
const BulletSchema = z.string().min(1).max(200);

export default function CVBuilderPage() {
  const [data, setData] = React.useState<CVData>({ ...EMPTY_CV });

  React.useEffect(() => {
    const id = setTimeout(() => { try { localStorage.setItem("cv.draft", JSON.stringify(data)); } catch {} }, DEBOUNCE);
    return () => clearTimeout(id);
  }, [data]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("cv.draft");
      if (raw) setData(sanitizeCV(JSON.parse(raw)));
      else setData(sampleCV());
    } catch {}
  }, []);

  function patch(p: Partial<CVData>) { setData(d => sanitizeCV({ ...d, ...p })); }
  function importFromJSON(incoming: any) {
    try { setData(sanitizeCV({ ...data, ...incoming })); } catch { alert("Invalid JSON"); }
  }

  // “one-page fitness”
  const wc = wordCount([data.summary, ...(data.experience?.flatMap(e => e.bullets.map(b => b.text)) || [])].join(" "));
  const fitness = wc <= 350 ? "✅ Likely 1 page" : wc <= 550 ? "⚠️ May spill to 2 pages" : "⛔ Too long";

  return (
    <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
      {/* Left Pane */}
      <aside className="space-y-4">
        <section className="card p-4 space-y-3">
          <div className="font-medium">Identity</div>
          <input className="input" placeholder="Full name" value={data.fullName} onChange={e => patch({ fullName: e.target.value })} />
          <input className="input" placeholder="Role (e.g., Frontend Engineer)" value={data.role} onChange={e => patch({ role: e.target.value })} />
        </section>

        <section className="card p-4 space-y-3">
          <div className="font-medium">Contact</div>
          <input className="input" placeholder="Email" value={data.contact.email} onChange={e => patch({ contact: { ...data.contact, email: e.target.value } })} />
          <input className="input" placeholder="Phone" value={data.contact.phone} onChange={e => patch({ contact: { ...data.contact, phone: e.target.value } })} />
          <input className="input" placeholder="Website (https://…)" value={data.contact.website} onChange={e => patch({ contact: { ...data.contact, website: e.target.value } })} />
          <input className="input" placeholder="Location" value={data.contact.location} onChange={e => patch({ contact: { ...data.contact, location: e.target.value } })} />
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
          <CVSectionOrder
            order={data.sectionsOrder as SectionKeyT[]}
            hidden={data.hiddenSections as SectionKeyT[]}
            onChange={(nextOrder, nextHidden) => patch({ sectionsOrder: nextOrder, hiddenSections: nextHidden })}
          />
        </section>

        <CVImportExport data={data} onImport={importFromJSON} />
      </aside>

      {/* Right Pane */}
      <main className="space-y-4">
        <section className="card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium">Summary</div>
            <div className="text-xs text-neutral-400">{wc} words · {fitness}</div>
          </div>
          <textarea className="textarea" placeholder="3–4 sentence professional summary" value={data.summary} onChange={e => patch({ summary: e.target.value })} />
        </section>

        <section className="card p-4 space-y-3">
          <div className="font-medium">Skills</div>
          <TagInput value={data.skills} onChange={(v) => patch({ skills: v })} />
        </section>

        <section className="card p-4 space-y-3">
          <div className="font-medium">Experience</div>
          <ExpList value={data.experience} onChange={(v) => patch({ experience: v })} />
        </section>

        <section className="card p-4 space-y-3">
          <div className="font-medium">Education</div>
          <EduList value={data.education} onChange={(v) => patch({ education: v })} />
        </section>

        <section className="card p-4 space-y-3">
          <div className="font-medium">Projects</div>
          <ProjList value={data.projects} onChange={(v) => patch({ projects: v })} />
        </section>

        <CVATSChecklist data={data} />

        {/* Wrapper + Preview + Download actions */}
        <CVWrapper
          preview={<CVPreview data={data} />}
          actions={<CVDownload data={data} />}
        />
      </main>
    </div>
  );
}

/* --- small editors --- */
function TagInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = React.useState("");
  function add() { const t = input.trim(); if (!t) return; onChange([...(value || []), t]); setInput(""); }
  function rm(i: number) { const next = value.slice(); next.splice(i, 1); onChange(next); }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input className="input" placeholder="Add item and press Enter" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" ? add() : undefined} />
        <button className="btn" onClick={add}>Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(value || []).map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-2 py-1 rounded-full border border-neutral-700 text-sm">
            {t}
            <button className="px-1 text-neutral-400 hover:text-red-400" onClick={() => rm(i)} aria-label={`Remove ${t}`}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function ExpList({ value, onChange }: { value: CVData["experience"]; onChange: (v: CVData["experience"]) => void }) {
  function add() { onChange([...(value || []), { company: "", role: "", start: "2024-01", end: "Present", location: "", bullets: [{ text: "" }] }]); }
  function rm(i: number) { onChange(value.filter((_, idx) => idx !== i)); }
  function upd(i: number, patch: Partial<CVData["experience"][number]>) { onChange(value.map((it, idx) => idx === i ? { ...it, ...patch } : it)); }
  function updBullet(i: number, bi: number, text: string) {
    const next = value.slice(); const arr = next[i].bullets.slice(); arr[bi] = { text: BulletSchema.parse(text || "") }; next[i].bullets = arr; onChange(next);
  }
  function addBullet(i: number) { const next = value.slice(); next[i].bullets = [...next[i].bullets, { text: "" }]; onChange(next); }
  function rmBullet(i: number, bi: number) { const next = value.slice(); const arr = next[i].bullets.slice(); arr.splice(bi, 1); next[i].bullets = arr; onChange(next); }

  return (
    <div className="space-y-2">
      <button className="btn" onClick={add}>Add role</button>
      {(value || []).map((e, i) => (
        <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2">
          <div className="grid sm:grid-cols-2 gap-2">
            <input className="input" placeholder="Role" value={e.role} onChange={ev => upd(i, { role: ev.target.value })} />
            <input className="input" placeholder="Company" value={e.company} onChange={ev => upd(i, { company: ev.target.value })} />
          </div>
          <div className="grid sm:grid-cols-3 gap-2">
            <input className="input" placeholder="Start (YYYY-MM)" value={e.start} onChange={ev => upd(i, { start: ev.target.value })} />
            <input className="input" placeholder="End (YYYY-MM or Present)" value={e.end} onChange={ev => upd(i, { end: ev.target.value })} />
            <input className="input" placeholder="Location" value={e.location} onChange={ev => upd(i, { location: ev.target.value })} />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-neutral-400">Bullets</div>
            {(e.bullets || []).map((b, bi) => (
              <div key={bi} className="flex gap-2">
                <input className="input" placeholder="Achievement / impact bullet" value={b.text} onChange={ev => updBullet(i, bi, ev.target.value)} />
                <button className="btn" onClick={() => rmBullet(i, bi)}>Remove</button>
              </div>
            ))}
            <button className="btn" onClick={() => addBullet(i)}>Add bullet</button>
          </div>
          <div className="flex justify-end">
            <button className="btn text-red-300 border-red-700" onClick={() => rm(i)}>Remove role</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EduList({ value, onChange }: { value: CVData["education"]; onChange: (v: CVData["education"]) => void }) {
  function add() { onChange([...(value || []), { school: "", degree: "", start: "2020-09", end: "2024-06", location: "", notes: "" }]); }
  function rm(i: number) { onChange(value.filter((_, idx) => idx !== i)); }
  function upd(i: number, patch: Partial<CVData["education"][number]>) { onChange(value.map((it, idx) => idx === i ? { ...it, ...patch } : it)); }

  return (
    <div className="space-y-2">
      <button className="btn" onClick={add}>Add education</button>
      {(value || []).map((ed, i) => (
        <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2">
          <div className="grid sm:grid-cols-2 gap-2">
            <input className="input" placeholder="Degree" value={ed.degree} onChange={ev => upd(i, { degree: ev.target.value })} />
            <input className="input" placeholder="School" value={ed.school} onChange={ev => upd(i, { school: ev.target.value })} />
          </div>
          <div className="grid sm:grid-cols-3 gap-2">
            <input className="input" placeholder="Start (YYYY-MM)" value={ed.start} onChange={ev => upd(i, { start: ev.target.value })} />
            <input className="input" placeholder="End (YYYY-MM or Present)" value={ed.end} onChange={ev => upd(i, { end: ev.target.value })} />
            <input className="input" placeholder="Location" value={ed.location} onChange={ev => upd(i, { location: ev.target.value })} />
          </div>
          <input className="input" placeholder="Notes (optional)" value={ed.notes || ""} onChange={ev => upd(i, { notes: ev.target.value })} />
          <div className="flex justify-end">
            <button className="btn text-red-300 border-red-700" onClick={() => rm(i)}>Remove education</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjList({ value, onChange }: { value: CVData["projects"]; onChange: (v: CVData["projects"]) => void }) {
  function add() { onChange([...(value || []), { name: "", description: "", link: "", highlights: [] }]); }
  function rm(i: number) { onChange(value.filter((_, idx) => idx !== i)); }
  function upd(i: number, patch: Partial<CVData["projects"][number]>) { onChange(value.map((it, idx) => idx === i ? { ...it, ...patch } : it)); }
  function addHi(i: number) { const next = value.slice(); next[i].highlights = [...(next[i].highlights || []), { text: "" }]; onChange(next); }
  function updHi(i: number, hi: number, text: string) { const next = value.slice(); const arr = next[i].highlights.slice(); arr[hi] = { text }; next[i].highlights = arr; onChange(next); }
  function rmHi(i: number, hi: number) { const next = value.slice(); const arr = next[i].highlights.slice(); arr.splice(hi, 1); next[i].highlights = arr; onChange(next); }

  return (
    <div className="space-y-2">
      <button className="btn" onClick={add}>Add project</button>
      {(value || []).map((p, i) => (
        <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2">
          <div className="grid sm:grid-cols-2 gap-2">
            <input className="input" placeholder="Name" value={p.name} onChange={ev => upd(i, { name: ev.target.value })} />
            <input className="input" placeholder="Link (optional)" value={p.link || ""} onChange={ev => upd(i, { link: ev.target.value })} />
          </div>
          <textarea className="textarea" placeholder="Short description" value={p.description} onChange={ev => upd(i, { description: ev.target.value })} />
          <div className="space-y-2">
            <div className="text-sm text-neutral-400">Highlights</div>
            {(p.highlights || []).map((h, hi) => (
              <div key={hi} className="flex gap-2">
                <input className="input" placeholder="Impact bullet" value={h.text} onChange={ev => updHi(i, hi, ev.target.value)} />
                <button className="btn" onClick={() => rmHi(i, hi)}>Remove</button>
              </div>
            ))}
            <button className="btn" onClick={() => addHi(i)}>Add highlight</button>
          </div>
          <div className="flex justify-end">
            <button className="btn text-red-300 border-red-700" onClick={() => rm(i)}>Remove project</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function sampleCV(): CVData {
  return {
    fullName: "Alex Johnson",
    role: "Frontend Engineer",
    contact: { email: "alex@example.com", phone: "+44 7700 900000", website: "https://alex.dev", location: "London, UK" },
    summary:
      "Frontend engineer with 5+ years building high-impact, accessible interfaces. Comfortable across React/Next.js, design systems, and performance budgets. Known for crisp UX and developer empathy.",
    skills: ["React", "Next.js", "TypeScript", "Tailwind", "Accessibility", "Testing", "Node.js", "REST/GraphQL"],
    experience: [
      {
        company: "Acme Corp",
        role: "Senior Frontend Engineer",
        start: "2023-01",
        end: "Present",
        location: "Remote",
        bullets: [
          { text: "Led migration to Next.js App Router improving TTFB by 32%." },
          { text: "Built component library used across 5 product teams." },
          { text: "Partnered with design to raise a11y scores to AA." },
        ],
      },
    ],
    education: [
      { school: "University of Somewhere", degree: "BSc Computer Science", start: "2016-09", end: "2019-06", location: "UK", notes: "First Class Honours" },
    ],
    projects: [
      { name: "Design Tokens Kit", description: "Open-source tokens + React primitives for rapid UI theming.", link: "https://github.com/you/tokens", highlights: [{ text: "700+ stars; used by 3 startups." }] },
    ],
    certifications: ["AWS Cloud Practitioner"],
    languages: ["English (native)", "French (conversational)"],
    interests: ["Climbing", "Travel", "Coffee"],
    templateId: "modern",
    font: "helvetica",
    theme: { primary: "#6366f1", darkMode: true },
    pdf: { pageSize: "A4", scale: 1 },
    sectionsOrder: ["summary","skills","experience","education","projects","certifications","languages","interests"],
    hiddenSections: [],
  };
}
