// theidealprogen/src/lib/portfolio-build.ts
import type { PortfolioData } from "./portfolio-types";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!));
}

function cssForTheme(theme: PortfolioData["theme"], font: PortfolioData["font"]) {
  return `
:root {
  --bg: ${theme.darkMode ? "#0b0b0c" : "#ffffff"};
  --fg: ${theme.darkMode ? "#eaeaea" : "#0b0b0c"};
  --muted: ${theme.darkMode ? "#9ca3af" : "#4b5563"};
  --card: ${theme.darkMode ? "#0f0f11" : "#f8fafc"};
  --border: ${theme.darkMode ? "#232323" : "#e5e7eb"};
  --primary: ${theme.primary};
  --radius: 14px;
  --shadow: 0 6px 24px rgba(0,0,0,.18);
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  --fs-1: 12px; --fs-2: 14px; --fs-3: 16px; --fs-4: 20px; --fs-5: 24px; --fs-6: 28px;
}
* { box-sizing: border-box }
body {
  margin:0; background:var(--bg); color:var(--fg);
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
  font-family: ${font === "inter" ? "Inter, ui-sans-serif, system-ui" : font === "lora" ? "Lora, ui-serif, Georgia" : "Roboto, ui-sans-serif, system-ui"};
}
.container { max-width: 980px; margin: 0 auto; padding: var(--space-6) var(--space-4); }
.card { background: var(--card); border:1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); }
.row { display:grid; gap: var(--space-4); }
.btn {
  display:inline-flex; align-items:center; gap:8px;
  padding:10px 14px; border:1px solid var(--border); border-radius: 12px; text-decoration:none;
  color:var(--fg); background: transparent;
}
.btn-primary { background: var(--primary); color: white; border-color: var(--primary); }
.badge { display:inline-flex; align-items:center; padding:6px 10px; border-radius: 999px; border:1px solid var(--border); font-size: var(--fs-2); }
.skill-grid { display:flex; gap:8px; flex-wrap:wrap; }
.proj-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-4); }
.small { color:var(--muted); font-size: var(--fs-2); }
.header { display:flex; align-items:flex-start; gap: var(--space-5); }
.avatar { width: 88px; height:88px; border-radius: 999px; object-fit: cover; border:2px solid var(--border) }
h1 { font-size: var(--fs-6); margin: 0; } h2 { font-size: var(--fs-5); margin: 0 0 var(--space-2) 0; }
a.link { color: var(--primary); text-decoration: underline; text-underline-offset: 2px; }
.section { padding: var(--space-5); }
hr.sep { border:none; border-top:1px solid var(--border); margin: var(--space-6) 0; }
footer { margin-top: var(--space-10); color: var(--muted); font-size: var(--fs-2); }
`.trim();
}

export function buildStaticFiles(site: PortfolioData): Record<string, string> {
  const css = cssForTheme(site.theme, site.font);
  const socials =
    site.socials?.map((s) => `<a class="link" href="${escapeHtml(s.url)}" rel="noopener">${escapeHtml(s.label)}</a>`).join(" · ") || "";
  const skills = site.skills?.map((s) => `<span class="badge">${escapeHtml(s.label)}</span>`).join("") || "";
  const projects =
    site.projects
      ?.map(
        (p) => `
    <article class="card section">
      <div style="font-weight:600">${escapeHtml(p.title)}</div>
      <div class="small" style="margin:6px 0 10px 0">${escapeHtml(p.description)}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
        ${p.tags?.map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join("")}
      </div>
      ${p.link ? `<a class="btn btn-primary" href="${escapeHtml(p.link)}" rel="noopener">Visit</a>` : ""}
    </article>`
      )
      .join("") || "";

  const testimonials =
    site.testimonials
      ?.map(
        (t) => `
    <blockquote class="card section">
      <div style="font-style:italic">“${escapeHtml(t.quote)}”</div>
      <div class="small" style="margin-top:8px">— ${escapeHtml(t.name)}${t.role ? `, ${escapeHtml(t.role)}` : ""}</div>
    </blockquote>`
      )
      .join("") || "";

  const avatar = site.photoDataUrl ? `<img class="avatar" alt="${escapeHtml(site.fullName)}" src="${site.photoDataUrl}" />` : "";

  const index = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(site.fullName)} — ${escapeHtml(site.role)}</title>
<meta name="description" content="${escapeHtml(site.about.slice(0, 150))}" />
<style>${css}</style>
</head>
<body>
  <div class="container">
    <header class="card section">
      <div class="header">
        ${avatar}
        <div>
          <h1>${escapeHtml(site.fullName)}</h1>
          <div class="small">${escapeHtml(site.role)}${site.location ? ` · ${escapeHtml(site.location)}` : ""}</div>
          <div style="margin-top:10px">${socials}</div>
        </div>
      </div>
      ${site.cvUrl ? `<div style="margin-top:12px"><a class="btn" href="${escapeHtml(site.cvUrl)}" rel="noopener">View CV (PDF)</a></div>` : ""}
    </header>

    <main class="row" style="margin-top: var(--space-6)">
      <section class="card section">
        <h2>About</h2>
        <p style="margin-top:8px; line-height:1.6">${escapeHtml(site.about)}</p>
      </section>

      ${site.skills?.length ? `<section class="card section"><h2>Skills</h2><div class="skill-grid" style="margin-top:10px">${skills}</div></section>` : ""}

      ${site.projects?.length ? `<section class="card section"><h2>Projects</h2><div class="proj-grid" style="margin-top:10px">${projects}</div></section>` : ""}

      ${site.testimonials?.length ? `<section class="card section"><h2>Testimonials</h2><div style="display:grid;gap:12px;margin-top:10px">${testimonials}</div></section>` : ""}

    </main>

    <footer>Powered by GitHub Pages · Built with TheIdealProGen</footer>
  </div>
</body>
</html>
  `.trim();

  return {
    "index.html": index,
    "styles.css": "/* template overrides (tokens live inline) */\n",
    ".nojekyll": "",
  };
}
