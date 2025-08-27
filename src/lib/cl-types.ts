// theidealprogen/src/lib/cl-types.ts
import { z } from "zod";

export const DateStr = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$|^Present$/);

export const Contact = z.object({
  email: z.string().email().optional().default(""),
  phone: z.string().max(40).optional().default(""),
  website: z.string().url().optional().or(z.literal("")).default(""),
  location: z.string().max(80).optional().default(""),
});

export const PDFSettings = z.object({
  pageSize: z.enum(["A4", "LETTER"]).default("A4"),
  scale: z.number().min(0.9).max(1.2).default(1),
});

export const Theme = z.object({
  primary: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i).default("#6366f1"),
  darkMode: z.boolean().default(true),
});

export const SectionKey = z.enum([
  "header",      // your name/contact
  "dateLine",    // today's date
  "recipient",   // recipient name, title, company, address
  "greeting",    // Dear Hiring Manager,
  "opener",      // short intro tying to role/company
  "body",        // 1–3 paragraphs
  "highlights",  // optional bullets
  "closing",     // close paragraph
  "signature",   // sign-off + name
]);
export type SectionKeyT = z.infer<typeof SectionKey>;

const DEFAULT_ORDER: SectionKeyT[] = [
  "header","dateLine","recipient","greeting","opener","body","highlights","closing","signature",
];

export const CL = z.object({
  // identity / meta
  fullName: z.string().min(1).max(80),
  role: z.string().min(1).max(80).optional().default(""),
  contact: Contact,

  // target/company details
  company: z.string().max(120).optional().default(""),
  jobTitle: z.string().max(120).optional().default(""),
  jobRef: z.string().max(140).optional().default(""),

  // content
  greeting: z.string().max(80).optional().default("Dear Hiring Manager,"),
  opener: z.string().max(600).optional().default(""),
  paragraphs: z.array(z.string().min(1).max(900)).max(5).default([]),
  highlights: z.array(z.string().min(1).max(200)).max(6).default([]),
  closing: z.string().max(400).optional().default(""),
  signoff: z.string().max(80).optional().default("Sincerely,"),
  signatureName: z.string().max(80).optional().default(""),

  // rendering
  templateId: z.enum(["classic", "modern"]).default("classic"),
  font: z.enum(["helvetica", "times"]).default("helvetica"),
  theme: Theme.default({ primary: "#6366f1", darkMode: true }),
  pdf: PDFSettings.default({ pageSize: "A4", scale: 1 }),

  // layout controls
  sectionsOrder: z.array(SectionKey).nonempty().default(DEFAULT_ORDER),
  hiddenSections: z.array(SectionKey).default([]),
});

export type CLData = z.infer<typeof CL>;

export const EMPTY_CL: CLData = {
  fullName: "",
  role: "",
  contact: { email: "", phone: "", website: "", location: "" },
  company: "",
  jobTitle: "",
  jobRef: "",
  greeting: "Dear Hiring Manager,",
  opener: "",
  paragraphs: [],
  highlights: [],
  closing: "",
  signoff: "Sincerely,",
  signatureName: "",
  templateId: "classic",
  font: "helvetica",
  theme: { primary: "#6366f1", darkMode: true },
  pdf: { pageSize: "A4", scale: 1 },
  sectionsOrder: DEFAULT_ORDER,
  hiddenSections: [],
};

export function sanitizeCL(input: unknown): CLData {
  const parsed = CL.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error("Invalid Cover Letter data:\n" + msg);
  }
  // canonicalize order (no dupes, respect hidden)
  const seen = new Set<string>();
  const full = DEFAULT_ORDER.filter(k => !parsed.data.hiddenSections.includes(k as SectionKeyT));
  const order = parsed.data.sectionsOrder.filter(k => !parsed.data.hiddenSections.includes(k));
  const merged = [...order, ...full.filter(k => !order.includes(k as any))].filter(k => (seen.has(k) ? false : (seen.add(k), true)));
  parsed.data.sectionsOrder = merged as SectionKeyT[];
  return parsed.data;
}

export function wordCount(s: string) {
  return (s || "").trim().split(/\s+/).filter(Boolean).length;
}
