// theidealprogen/src/components/portfolio/PortfolioBuilderPage.tsx
"use client";
import * as React from "react";
import { EMPTY_PORTFOLIO, sanitizePortfolio, type PortfolioData } from "@/lib/portfolio-types";
import ThemePanel from "./ThemePanel";
import ImportExport from "./ImportExport";
import SkillsEditor from "./SkillsEditor";
import TestimonialsEditor from "./TestimonialsEditor";
import PortfolioPreview from "./PortfolioPreview";
import { fingerprint } from "@/lib/fingerprint";

const DEBOUNCE = 150;

export default function PortfolioBuilderPage() {
  const [data, setData] = React.useState<PortfolioData>({ ...EMPTY_PORTFOLIO });
  const [template, setTemplate] = React.useState<PortfolioData["templateId"]>("modern");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successUrl, setSuccessUrl] = React.useState<string | null>(null);
  const urlInput = React.useRef<HTMLInputElement>(null);

  // Debounced persist
  React.useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem("portfolio.draft", JSON.stringify(data));
      } catch {}
    }, DEBOUNCE);
    return () => clearTimeout(id);
  }, [data]);

  // Load draft
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("portfolio.draft");
      if (raw) {
        const parsed = sanitizePortfolio(JSON.parse(raw));
        setData(parsed);
        setTemplate(parsed.templateId);
      }
    } catch {}
  }, []);

  // Ctrl/Cmd+S: export
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        exportJson();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, template]);

  function patch(p: Partial<PortfolioData>) {
    setData((d) => ({ ...d, ...p }));
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ templateId: template, site: data }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    const name = (data.fullName || "portfolio").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.href = URL.createObjectURL(blob);
    a.download = `${name || "portfolio"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function deploy() {
    setSaving(true);
    setError(null);
    setSuccessUrl(null);
    try {
      const fp = await fingerprint();
      const payload = { fingerprint: fp, portfolio: sanitizePortfolio({ ...data, templateId: template }) };
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Deploy failed");
      }
      const j = await res.json();
      setSuccessUrl(j.pagesUrl);
      setTimeout(() => urlInput.current?.select(), 50);
    } catch (e: any) {
      setError(e?.message || "Deploy failed");
    } finally {
      setSaving(false);
    }
  }

  function importFromJSON(incoming: any) {
    try {
      const merged = sanitizePortfolio({ ...data, ...incoming });
      setData(merged);
      if (incoming?.templateId) setTemplate(incoming.templateId);
    } catch {
      alert("Invalid JSON");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
      <aside className="space-y-4">
        <section className="rounded-2xl border border-neutral-800 p-4 space-y-3">
          <div className="font-medium">Identity</div>
          <input
            className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 w-full"
            placeholder="Full name"
            value={data.fullName}
            onChange={(e) => patch({ fullName: e.target.value })}
          />
          <input
            className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 w-full"
            placeholder="Role"
            value={data.role}
            onChange={(e) => patch({ role: e.target.value })}
          />
          <input
            className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 w-full"
            placeholder="Location"
            value={data.location}
            onChange={(e) => patch({ location: e.target.value })}
          />
          <textarea
            className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 w-full min-h-28"
            placeholder="About you"
            value={data.about}
            onChange={(e) => patch({ about: e.target.value })}
          />
        </section>

        <section className="rounded-2xl border border-neutral-800 p-4 space-y-3">
          <div className="font-medium">Template</div>
          <select
            className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 w-full"
            value={template}
            onChange={(e) => setTemplate(e.target.value as any)}
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
          </select>
        </section>

        <ThemePanel value={data.theme} onChange={(v) => patch({ theme: v })} />

        <section className="rounded-2xl border border-neutral-800 p-4 space-y-3">
          <div className="font-medium">Socials</div>
          <UrlList value={data.socials} onChange={(v) => patch({ socials: v })} />
        </section>

        <ImportExport templateId={template} data={data} onImport={importFromJSON} />
      </aside>

      <main className="space-y-4">
        <PortfolioPreview data={{ ...data, templateId: template }} />

        <section className="rounded-2xl border border-neutral-800 p-4 space-y-3">
          <div className="font-medium">Skills</div>
          <SkillsEditor value={data.skills} onChange={(v) => patch({ skills: v })} />
        </section>

        <section className="rounded-2xl border border-neutral-800 p-4 space-y-3">
          <div className="font-medium">Projects</div>
          <ProjectList value={data.projects} onChange={(v) => patch({ projects: v })} />
        </section>

        <section className="rounded-2xl border border-neutral-800 p-4 space-y-3">
          <div className="font-medium">Testimonials</div>
          <TestimonialsEditor value={data.testimonials} onChange={(v) => patch({ testimonials: v })} />
        </section>

        <section className="rounded-2xl border border-neutral-800 p-4">
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-900"
              onClick={exportJson}
              title="Cmd/Ctrl+S"
            >
              Export JSON
            </button>
            <button
              className="px-3 py-2 rounded-xl border border-neutral-700 bg-indigo-600 text-white disabled:opacity-50"
              onClick={deploy}
              disabled={saving}
            >
              {saving ? "Deploying…" : "Deploy to GitHub Pages"}
            </button>
            {error ? <span className="text-red-400 text-sm">{String(error).slice(0, 220)}</span> : null}
          </div>
        </section>
      </main>

      {/* Success Modal */}
      {successUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-3">
            <div className="text-lg font-semibold">Deployed 🎉</div>
            <p className="text-sm text-neutral-400">Your site is live. Copy or open it in a new tab.</p>
            <div className="flex gap-2">
              <input
                ref={urlInput}
                readOnly
                value={successUrl}
                className="flex-1 px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100"
              />
              <button
                className="px-3 py-2 rounded-xl border border-neutral-700"
                onClick={() => {
                  navigator.clipboard?.writeText(successUrl);
                }}
              >
                Copy
              </button>
              <a
                className="px-3 py-2 rounded-xl border border-neutral-700 bg-indigo-600 text-white"
                href={successUrl}
                target="_blank"
                rel="noopener"
              >
                Open
              </a>
            </div>
            <div className="flex justify-end pt-2">
              <button className="px-3 py-2 rounded-xl border border-neutral-700" onClick={() => setSuccessUrl(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function UrlList({
  value,
  onChange,
}: {
  value: Array<{ label: string; url: string }>;
  onChange: (arr: Array<{ label: string; url: string }>) => void;
}) {
  function add() {
    onChange([...(value || []), { label: "", url: "" }]);
  }
  function rm(i: number) {
    const next = value.slice();
    next.splice(i, 1);
    onChange(next);
  }
  function upd(i: number, patch: any) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <button onClick={add} className="px-3 py-2 rounded-xl border border-neutral-700">
        Add link
      </button>
      <ul className="space-y-2">
        {(value || []).map((s, i) => (
          <li key={i} className="rounded-xl border border-neutral-800 p-2 grid sm:grid-cols-[1fr,2fr,auto] gap-2">
            <input
              className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 w-full"
              placeholder="Label"
              value={s.label}
              onChange={(e) => upd(i, { label: e.target.value })}
            />
            <input
              className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 w-full"
              placeholder="https://…"
              value={s.url}
              onChange={(e) => upd(i, { url: e.target.value })}
            />
            <button className="px-3 py-2 rounded-xl border border-neutral-700 text-red-400" onClick={() => rm(i)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectList({
  value,
  onChange,
}: {
  value: Array<{ title: string; description: string; link?: string; tags?: string[] }>;
  onChange: (arr: Array<{ title: string; description: string; link?: string; tags?: string[] }>) => void;
}) {
  function add() {
    onChange([...(value || []), { title: "", description: "", link: "", tags: [] }]);
  }
  function rm(i: number) {
    const next = value.slice();
    next.splice(i, 1);
    onChange(next);
  }
  function upd(i: number, patch: any) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <button onClick={add} className="px-3 py-2 rounded-xl border border-neutral-700">
        Add project
      </button>
      <ul className="space-y-2">
        {(value || []).map((p, i) => (
          <li key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2">
            <div className="grid sm:grid-cols-2 gap-2">
              <input
                className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 w-full"
                placeholder="Title"
                value={p.title}
                onChange={(e) => upd(i, { title: e.target.value })}
              />
              <input
                className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 w-full"
                placeholder="Link (optional)"
                value={p.link || ""}
                onChange={(e) => upd(i, { link: e.target.value })}
              />
            </div>
            <textarea
              className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 w-full min-h-24"
              placeholder="Short description"
              value={p.description}
              onChange={(e) => upd(i, { description: e.target.value })}
            />
            <TagRow value={p.tags || []} onChange={(tags) => upd(i, { tags })} />
            <button className="px-3 py-2 rounded-xl border border-neutral-700 text-red-400" onClick={() => rm(i)}>
              Remove project
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TagRow({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = React.useState("");
  function add() {
    const t = input.trim();
    if (!t) return;
    onChange([...(value || []), t]);
    setInput("");
  }
  function rm(i: number) {
    const next = value.slice();
    next.splice(i, 1);
    onChange(next);
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 w-full"
          placeholder="Add a tag and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? add() : undefined)}
        />
        <button className="px-3 py-2 rounded-xl border border-neutral-700" onClick={add}>
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(value || []).map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-2 py-1 rounded-full border border-neutral-700 text-sm">
            {t}
            <button className="px-1 text-neutral-400 hover:text-red-400" onClick={() => rm(i)} aria-label={`Remove ${t}`}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
