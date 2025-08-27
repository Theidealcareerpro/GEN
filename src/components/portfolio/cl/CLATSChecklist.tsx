// theidealprogen/src/components/cl/CLATSChecklist.tsx
"use client";
import * as React from "react";
import type { CLData } from "@/lib/cl-types";

export default function CLATSChecklist({ data }: { data: CLData }) {
  const issues: string[] = [];
  const warns: string[] = [];

  // Contact
  if (!data.contact.email && !data.contact.phone) issues.push("Add at least one contact method (email or phone).");

  // Greeting
  if (!data.greeting || !data.greeting.trim()) issues.push("Add a greeting (e.g., Dear Hiring Manager,).");

  // Length guidance (200–450 words typically ideal for CLs)
  const totalText = [
    data.opener,
    ...(data.paragraphs || []),
    ...(data.highlights || []),
    data.closing
  ].join(" ");
  const wc = (totalText || "").trim().split(/\s+/).filter(Boolean).length;
  if (wc < 150) warns.push("Letter is quite short; consider adding more substance (aim 200–450 words).");
  if (wc > 600) warns.push("Letter is long; tighten to keep attention (aim 200–450 words).");

  // Highlights sanity
  for (const h of data.highlights || []) {
    if ((h || "").length > 200) warns.push("Some highlights exceed 200 characters.");
  }

  return (
    <div className="card p-4 space-y-2">
      <div className="font-medium">ATS / Readability Checks</div>
      {issues.length === 0 && warns.length === 0 ? (
        <div className="text-sm text-emerald-300">All good! 👍</div>
      ) : (
        <ul className="list-disc ml-5 space-y-1 text-sm">
          {issues.map((t, i) => <li key={`i-${i}`} className="text-red-300">{t}</li>)}
          {warns.map((t, i) => <li key={`w-${i}`} className="text-amber-300">{t}</li>)}
        </ul>
      )}
      <p className="text-xs text-neutral-500">Heuristics only — tailor to the role and company.</p>
    </div>
  );
}
