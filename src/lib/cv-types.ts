// theidealprogen/src/lib/cv-types.ts
import { z } from "zod";

export const DateStr = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$|^Present$/);

export const Contact = z.object({
  email: z.string().email().optional().default(""),
  phone: z.string().max(40).optional().default(""),
  website: z.string().url().optional().or(z.literal("")).default(""),
  location: z.string().max(80).optional().default(""),
});

export const Bullet = z.object({
  text: z.string().min(1).max(200),
});

export const Experience = z.object({
  company: z.string().min(1).max(80),
  role: z.string().min(1).max(80),
  start: DateStr,
  end: DateStr,
  location: z.string().max(80).optional().default(""),
  bullets: z.array(Bullet).min(1).max(12),
});

export const Education = z.object({
  school: z.string().min(1).max(100),
  degree: z.string().min(1).max(120),
  start: DateStr,
  end: DateStr,
  location: z.string().max(80).optional().default(""),
  notes: z.string().max(160).optional().default(""),
});

export const Project = z.object({
  name: z.string().min(1).max(80),
  description: z.string().min(1).max(200),
  link: z.string().url().optional().or(z.literal("")).default(""),
  highlights: z.array(Bullet).max(8).default([]),
});

export const Theme = z.object({
  primary: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i).default("#6366f1"),
  darkMode: z.boolean().default(true),
});

// PDF configuration (client-only)
export const PDFSettings = z.object({
  pageSize: z.enum(["A4", "LETTER"]).default("A4"),
  scale: z.number().min(0.9).max(1.2).default(1),
});

export const SectionKey = z.enum([
  "summary",
  "skills",
  "experience",
  "education",
  "projects",
  "certifications",
  "languages",
  "interests",
]);
export type SectionKeyT = z.infer<typeof SectionKey>;

const DEFAULT_ORDER: SectionKeyT[] = [
  "summary",
  "skills",
  "experience",
  "education",
  "projects",
  "certifications",
  "languages",
  "interests",
];

export const CV = z.object({
  fullName: z.string().min(1).max(80),
  role: z.string().min(1).max(80),
  contact: Contact,
  summary: z.string().min(1).max(600),
  skills: z.array(z.string().min(1).max(32)).max(60).default([]),
  experience: z.array(Experience).max(12).default([]),
  education: z.array(Education).max(8).default([]),
  projects: z.array(Project).max(8).default([]),
  certifications: z.array(z.string().min(1).max(120)).max(12).default([]),
  languages: z.array(z.string().min(1).max(40)).max(10).default([]),
  interests: z.array(z.string().min(1).max(40)).max(10).default([]),
  templateId: z.enum(["classic", "modern"]).default("classic"),
  font: z.enum(["helvetica", "times"]).default("helvetica"),
  theme: Theme.default({ primary: "#6366f1", darkMode: true }),

  // NEW: layout controls
  pdf: PDFSettings.default({ pageSize: "A4", scale: 1 }),
  sectionsOrder: z.array(SectionKey).nonempty().default(DEFAULT_ORDER),
  hiddenSections: z.array(SectionKey).default([]),
});

export type CVData = z.infer<typeof CV>;
export type SectionKey = z.infer<typeof SectionKey>;

export const EMPTY_CV: CVData = {
  fullName: "",
  role: "",
  contact: { email: "", phone: "", website: "", location: "" },
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  languages: [],
  interests: [],
  templateId: "classic",
  font: "helvetica",
  theme: { primary: "#6366f1", darkMode: true },
  pdf: { pageSize: "A4", scale: 1 },
  sectionsOrder: DEFAULT_ORDER,
  hiddenSections: [],
};

export function sanitizeCV(input: unknown): CVData {
  const parsed = CV.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error("Invalid CV data:\n" + msg);
  }
  // ensure order contains all keys without duplicates
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
