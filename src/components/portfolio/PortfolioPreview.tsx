"use client";

import * as React from "react";

/* ------------------------------------------------------------------
   Types
-------------------------------------------------------------------*/
export type SocialLink = { label: string; url: string };
export type Project = {
  title: string;
  description: string;
  link?: string;
  image?: string; // https or data: URI
  tags?: string[];
};
export type Testimonial = { quote: string; author: string; role?: string };
export type PortfolioData = {
  name: string;
  role?: string;
  summary?: string;
  avatarUrl?: string; // https or data: URI
  location?: string;
  email?: string;
  socials?: SocialLink[];
  projects?: Project[];
  skills?: string[]; // rendered as badges
  testimonials?: Testimonial[];
};

export type PreviewTheme = {
  primary?: string; // hex color
  dark?: boolean;
  accentBg?: string; // optional surface color
  radius?: number; // px corner radius
};

export type PortfolioTemplate = "modern" | "classic";

/* ------------------------------------------------------------------
   Component
-------------------------------------------------------------------*/
export default function PortfolioPreview({
  data,
  template = "modern",
  initialTheme,
}: {
  data: PortfolioData;
  template?: PortfolioTemplate;
  initialTheme?: PreviewTheme;
}) {
  const [device, setDevice] = React.useState<"desktop" | "mobile">("desktop");
  const [zoom, setZoom] = React.useState<number>(1); // 0.75 / 1
  const [dark, setDark] = React.useState<boolean>(initialTheme?.dark ?? false);
  const [primary, setPrimary] = React.useState<string>(initialTheme?.primary ?? "#6366F1"); // indigo-500
  const [radius, setRadius] = React.useState<number>(initialTheme?.radius ?? 14);

  const html = React.useMemo(
    () => buildHtml({ data, template, theme: { primary, dark, radius } }),
    [data, template, primary, dark, radius]
  );

  function openInNewTab() {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(html);
      toast("HTML copied");
    } catch {
      toast("Copy failed");
    }
  }

  function downloadHtml() {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = safeFileName(`${data.name || "portfolio"}.html`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 mb-3 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm text-neutral-400 mr-2">Preview</div>

          <div role="group" aria-label="Device" className="flex rounded-xl border border-neutral-800 overflow-hidden">
            <button
              className={tw(
                "px-3 py-1.5 text-sm",
                device === "desktop" ? "bg-neutral-800 text-white" : "text-neutral-300"
              )}
              onClick={() => setDevice("desktop")}
            >
              Desktop
            </button>
            <button
              className={tw(
                "px-3 py-1.5 text-sm",
                device === "mobile" ? "bg-neutral-800 text-white" : "text-neutral-300"
              )}
              onClick={() => setDevice("mobile")}
            >
              Mobile
            </button>
          </div>

          <div role="group" aria-label="Zoom" className="flex rounded-xl border border-neutral-800 overflow-hidden">
            <button
              className={tw("px-3 py-1.5 text-sm", zoom === 0.75 ? "bg-neutral-800 text-white" : "text-neutral-300")}
              onClick={() => setZoom(0.75)}
            >
              75%
            </button>
            <button
              className={tw("px-3 py-1.5 text-sm", zoom === 1 ? "bg-neutral-800 text-white" : "text-neutral-300")}
              onClick={() => setZoom(1)}
            >
              100%
            </button>
          </div>

          <div className="h-6 w-px bg-neutral-800 mx-1" />

          {/* Theme controls */}
          <label className="flex items-center gap-2 text-sm text-neutral-300 px-2 py-1.5 rounded-xl border border-neutral-800">
            <span>Primary</span>
            <input
              type="color"
              className="h-6 w-8 rounded border-0 bg-transparent"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              aria-label="Primary color"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-neutral-300 px-2 py-1.5 rounded-xl border border-neutral-800">
            <span>Radius</span>
            <input
              type="range"
              min={6}
              max={24}
              step={1}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              aria-label="Corner radius"
            />
          </label>

          <button
            className="px-3 py-1.5 text-sm rounded-xl border border-neutral-800 text-neutral-300"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? "Light mode" : "Dark mode"}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button className="btn" onClick={copyHtml}>Copy HTML</button>
            <button className="btn" onClick={downloadHtml}>Download</button>
            <button className="btn btn-primary" onClick={openInNewTab}>Open</button>
          </div>
        </div>
      </div>

      {/* Frame */}
      <div className={tw("mx-auto", device === "mobile" ? "max-w-[420px]" : "max-w-[1160px]")}>
        <MacFrame title={data?.name || "Portfolio Preview"}>
          <div
            className="w-full overflow-hidden rounded-b-[18px] bg-black"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          >
            <iframe
              title="Portfolio live preview"
              sandbox="allow-popups allow-top-navigation-by-user-activation"
              referrerPolicy="no-referrer"
              className="w-full h-[800px] border-0"
              srcDoc={html}
            />
          </div>
        </MacFrame>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Mac-style frame
-------------------------------------------------------------------*/
function MacFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border border-neutral-800 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-2 px-3 h-10 bg-neutral-900/80 border-b border-neutral-800">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/90" />
          <span className="h-3 w-3 rounded-full bg-amber-500/90" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/90" />
        </div>
        <div className="mx-auto text-xs text-neutral-400 truncate">{title}</div>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------
   HTML generator (self-contained, no external assets)
-------------------------------------------------------------------*/
function buildHtml({
  data,
  template,
  theme,
}: {
  data: PortfolioData;
  template: PortfolioTemplate;
  theme: { primary?: string; dark?: boolean; radius?: number };
}) {
  const d = fillDefaults(data);
  const primary = theme.primary || "#6366F1";
  const dark = !!theme.dark;
  const radius = clamp(theme.radius ?? 14, 6, 24);

  // Minimal reset + template CSS (scoped)
  const css = `
:root{
  --primary:${primary};
  --radius:${radius}px;
  --bg:${dark ? "#0b0b0e" : "#ffffff"};
  --muted:${dark ? "#0f1115" : "#f5f6f8"};
  --text:${dark ? "#e7e7ea" : "#0f1115"};
  --subtle:${dark ? "#9aa1ad" : "#5b6472"};
  --card:${dark ? "#0e1014" : "#ffffff"};
  --border:${dark ? "#1b1f2a" : "#e5e7eb"};
  --badge:${dark ? "#10131a" : "#eef2ff"};
  --shadow: ${dark ? "0 12px 40px rgba(0,0,0,.5)" : "0 10px 30px rgba(24,24,28,.08)"};
}
*{box-sizing:border-box}
html,body{padding:0;margin:0;background:var(--bg);color:var(--text);font:14px/1.6 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial}
a{color:var(--primary);text-decoration:none}
img{max-width:100%;display:block}
.container{max-width:980px;margin:0 auto;padding:28px}
.card{background:var(--card);border:1px solid var(--border);border-radius:calc(var(--radius) + 2px);box-shadow:var(--shadow)}
.badge{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;border:1px solid var(--border);background:var(--badge);font-size:12px;color:var(--subtle);margin:4px 6px 0 0}
.hstack{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.vstack{display:flex;flex-direction:column;gap:12px}
.section{margin:28px 0}
.hr{height:1px;background:var(--border);margin:18px 0;border:0}
.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--muted);color:var(--text)}
.btn:hover{filter:brightness(${dark ? 1.2 : 0.98})}
.grid{display:grid;gap:16px}
.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}
@media (max-width: 700px){ .grid-2{grid-template-columns:1fr} }
.header{display:flex;gap:24px;align-items:center}
.header .avatar{width:84px;height:84px;border-radius:18px;border:1px solid var(--border);overflow:hidden}
.hero h1{font-size:26px;margin:0 0 8px}
.hero .role{color:var(--subtle)}
.project{padding:16px;border-radius:12px;border:1px solid var(--border);background:var(--muted)}
.project .title{font-weight:600}
.project .tags{margin-top:8px}
.footer{padding:18px;text-align:center;color:var(--subtle);font-size:12px}
`;

  const head = `
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(d.name)} — ${escapeHtml(d.role || "Portfolio")}</title>
<meta name="description" content="${escapeHtml(d.summary || `${d.name}'s portfolio`)}"/>
<style>${css}</style>
`;

  const socials =
    d.socials?.length
      ? `<div class="hstack">${d.socials
          .map((s) => `<a class="btn" href="${escapeAttr(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`)
          .join("")}</div>`
      : "";

  const skills =
    d.skills?.length
      ? `<div class="section"><h3>Skills</h3><div class="hstack">${d.skills
          .map((t) => `<span class="badge">${escapeHtml(t)}</span>`)
          .join("")}</div></div>`
      : "";

  const testimonials =
    d.testimonials?.length
      ? `<div class="section"><h3>Testimonials</h3><div class="grid grid-2">
        ${d.testimonials
          .map(
            (t) => `
          <div class="card" style="padding:16px;">
            <div style="color:var(--subtle);">“${escapeHtml(t.quote)}”</div>
            <div style="margin-top:10px;font-weight:600">${escapeHtml(t.author)}</div>
            ${t.role ? `<div style="color:var(--subtle);font-size:12px">${escapeHtml(t.role)}</div>` : ""}
          </div>`
          )
          .join("")}
      </div></div>`
      : "";

  const projects =
    d.projects?.length
      ? `<div class="section"><h3>Projects</h3><div class="grid grid-2">
      ${d.projects
        .map((p) => {
          const img = p.image ? `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.title)}" style="border-radius:10px;border:1px solid var(--border)"/>` : "";
          const link = p.link
            ? `<a class="btn" href="${escapeAttr(p.link)}" target="_blank" rel="noopener">View</a>`
            : "";
          const tags =
            p.tags?.length ? `<div class="tags">${p.tags.map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join("")}</div>` : "";
          return `<article class="project">
            <div class="vstack">
              ${img}
              <div class="title">${escapeHtml(p.title)}</div>
              <div style="color:var(--subtle)">${escapeHtml(p.description)}</div>
              <div class="hstack">${tags}${link}</div>
            </div>
          </article>`;
        })
        .join("")}
    </div></div>`
      : "";

  const contact =
    d.email || d.location
      ? `<div class="section"><h3>Contact</h3>
        <div class="vstack">
          ${d.email ? `<a class="btn" href="mailto:${escapeAttr(d.email)}">${escapeHtml(d.email)}</a>` : ""}
          ${d.location ? `<div class="badge">${escapeHtml(d.location)}</div>` : ""}
        </div>
      </div>`
      : "";

  // Header (template variants can diverge; keeping modern + subtle classic tweaks)
  const header = `
<header class="header">
  ${d.avatarUrl ? `<div class="avatar"><img src="${escapeAttr(d.avatarUrl)}" alt="${escapeAttr(d.name)}"/></div>` : ""}
  <div class="hero">
    <h1>${escapeHtml(d.name)}</h1>
    ${d.role ? `<div class="role">${escapeHtml(d.role)}</div>` : ""}
    ${d.summary ? `<p style="margin:10px 0 0;color:var(--subtle)">${escapeHtml(d.summary)}</p>` : ""}
    <div style="margin-top:12px">${socials}</div>
  </div>
</header>`;

  const body = `
<div class="container">
  ${header}
  <div class="hr"></div>
  ${skills}
  ${projects}
  ${testimonials}
  ${contact}
</div>
<footer class="footer">
  Built with <span style="color:var(--primary);font-weight:600">GEN</span>.
</footer>`;

  return `<!DOCTYPE html><html lang="en" ${dark ? 'data-theme="dark"' : ""}><head>${head}</head><body>${body}</body></html>`;
}

/* ------------------------------------------------------------------
   Helpers
-------------------------------------------------------------------*/
function safeFileName(s: string) {
  return s.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function escapeAttr(s: string) {
  return escapeHtml(s).replaceAll("'", "&#39;");
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function tw(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
function toast(msg: string) {
  // Minimal inline toast; replace with your app's Toast later if desired
  try {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText =
      "position:fixed;left:50%;top:14px;transform:translateX(-50%);background:#111827;color:#e5e7eb;border:1px solid #374151;padding:8px 12px;border-radius:10px;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,.35);font:13px ui-sans-serif,system-ui";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  } catch {}
}

/** Ensure required arrays exist; prevents template gaps */
function fillDefaults(d: PortfolioData): Required<PortfolioData> {
  return {
    name: d.name || "Your Name",
    role: d.role || "Your Role",
    summary:
      d.summary ||
      "Short summary about you, your craft, and the value you bring. Keep it crisp and human.",
    avatarUrl:
      d.avatarUrl ||
      "data:image/svg+xml;utf8," +
        encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>
            <rect width='100%' height='100%' rx='18' fill='#111827'/>
            <circle cx='70' cy='56' r='24' fill='#1f2937'/>
            <rect x='25' y='92' width='90' height='26' rx='13' fill='#1f2937'/>
          </svg>`
        ),
    location: d.location || "",
    email: d.email || "",
    socials: d.socials || [],
    projects:
      d.projects && d.projects.length
        ? d.projects
        : [
            {
              title: "Signature Project",
              description:
                "A concise explanation of the problem, your approach, and the outcome. Add a link if public.",
              link: "#",
              tags: ["TypeScript", "Next.js"],
            },
            {
              title: "Another Highlight",
              description:
                "Focus on impact and clarity. What changed because of your work?",
              link: "#",
              tags: ["UI/UX", "Accessibility"],
            },
          ],
    skills: d.skills && d.skills.length ? d.skills : ["React", "Next.js", "Tailwind", "TypeScript"],
    testimonials:
      d.testimonials && d.testimonials.length
        ? d.testimonials
        : [
            {
              quote: "They deliver quality with speed and kindness.",
              author: "Happy Client",
              role: "Founder, Acme",
            },
          ],
  };
}
