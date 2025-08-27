// theidealprogen/src/lib/filename.ts
export function safeFileName(s: string) {
  return (s || "").trim().replace(/[\s/\\?%*:|"<>]+/g, " ").replace(/\s+/g, " ").trim();
}

export function cvFileName(fullName: string) {
  const base = safeFileName(fullName || "CV");
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${base} - CV - ${y}-${m}.pdf`;
}

export function clFileName(fullName: string, company?: string) {
  const who = safeFileName(fullName || "Cover Letter");
  const org = company ? ` - ${safeFileName(company)}` : "";
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${who}${org} - Cover Letter - ${y}-${m}.pdf`;
}
