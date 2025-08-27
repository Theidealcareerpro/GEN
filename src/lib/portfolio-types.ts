// theidealprogen/src/lib/portfolio-types.ts
import { z } from "zod";

export const SocialLink = z.object({
  label: z.string().min(1).max(32),
  url: z.string().url().max(2048),
});

export const SkillBadge = z.object({
  label: z.string().min(1).max(32),
});

export const Project = z.object({
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(240),
  link: z.string().url().max(2048).optional().or(z.literal("")),
  tags: z.array(z.string().min(1).max(24)).default([]),
});

export const Testimonial = z.object({
  name: z.string().min(1).max(80),
  role: z.string().max(80).optional().default(""),
  quote: z.string().min(1).max(280),
});

export const Theme = z.object({
  primary: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i).default("#6366f1"),
  darkMode: z.boolean().default(true),
});

export const Portfolio = z.object({
  fullName: z.string().min(1).max(80),
  role: z.string().min(1).max(80),
  location: z.string().max(120).optional().default(""),
  about: z.string().min(1).max(600),
  skills: z.array(SkillBadge).default([]),
  projects: z.array(Project).default([]),
  testimonials: z.array(Testimonial).default([]),
  socials: z.array(SocialLink).default([]),
  theme: Theme.default({ primary: "#6366f1", darkMode: true }),
  font: z.enum(["inter", "lora", "roboto"]).default("inter"),
  templateId: z.enum(["modern", "classic", "minimal"]).default("modern"),
  photoDataUrl: z.string().startsWith("data:image/").max(1_000_000).optional(),
  cvUrl: z.string().url().max(2048).optional(),
  cvFileDataUrl: z.string().startsWith("data:application/pdf").max(3_000_000).optional(),
  cvFileName: z.string().max(120).optional(),
});

export type PortfolioData = z.infer<typeof Portfolio>;
export type ProjectData = z.infer<typeof Project>;

export const EMPTY_PORTFOLIO: PortfolioData = {
  fullName: "",
  role: "",
  location: "",
  about: "",
  skills: [],
  projects: [],
  testimonials: [],
  socials: [],
  theme: { primary: "#6366f1", darkMode: true },
  font: "inter",
  templateId: "modern",
};

export function sanitizePortfolio(input: unknown): PortfolioData {
  const parsed = Portfolio.safeParse(input);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error("Invalid portfolio data:\n" + errors.join("\n"));
  }
  return parsed.data;
}
