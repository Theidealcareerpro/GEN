// theidealprogen/src/components/cv/CVATSChecklist.tsx
"use client";

import * as React from "react";
import type { CVData } from "@/lib/cv-types";

export default function CVATSChecklist({ data }: { data: CVData }) {
  const issues: string[] = [];
  const warns: string[] = [];

  // Contact
  if (!data.contact.email && !data.contact.phone) issues.push("Add at least one contact method (email or phone).");
  if (data.contact.website && !/^https?:\/\//i.test(data.contact.website)) warns.push("Website should include http(s)://");

  // Summary
  const wc = (data.summary || "").trim().split(/\s+/).filter(Boolean).length;
  if (wc < 40) warns.push("Summary is quite short; aim for 3–4 sentences.");
  if (wc > 160) warns.push("Summary is long; tighten for 1-page CVs.");

  // Bullets
  for (const e of data.experience || []) {
    for (const b of e.bullets || []) {
      if ((b.text || "").length > 200) warns.push("Some experience bullets exceed 200 characters.");
    }
  }

  // Dates sanity (simple check)
  for (const e of data.experience || []) {
    if (e.start !== "Present" && e.end !== "Present") {
      if (e.start > e.end) warns.push(`Role "${e.role}" has start after end.`);
    }
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
      <p className="text-xs text-neutral-500">Heuristics only — always tailor to the role.</p>
    </div>
  );
}
