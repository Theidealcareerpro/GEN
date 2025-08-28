"use client";

import * as React from "react";
import { z } from "zod";
import { cvFileName } from "@/lib/filename";
import type { CVData } from "@/lib/cv-types";

type ImportMode = "replace" | "merge";

export default function CVImportExport({
  data,
  onImport,
  className,
  defaultMode = "replace",
  maxSizeBytes = 1_000_000, // 1 MB safety cap
}: {
  data: CVData;
  onImport: (next: CVData) => void;
  className?: string;
  defaultMode?: ImportMode;
  maxSizeBytes?: number;
}) {
  const [mode, setMode] = React.useState<ImportMode>(defaultMode);
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function onChooseFile() {
    inputRef.current?.click();
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast("CV JSON copied");
    } catch {
      toast("Copy failed");
    }
  }

  function onDownload() {
    const name = safeFileName((cvFileName?.(data) as string) || guessCVFileName(data) || "cv");
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = ""; // reset so same file can be picked again
    if (!f) return;
    if (f.size > maxSizeBytes) {
      toast(`File too large (> ${(maxSizeBytes / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }
    try {
      setBusy(true);
      const text = await f.text();
      const raw = JSON.parse(text);

      // Lenient validation: must be an object.
      const parsed = z.object({}).passthrough().parse(raw) as CVData;

      const next =
        mode === "replace" ? (parsed as CVData) : (deepMerge(data, parsed) as CVData);

      onImport(next);
      toast(mode === "replace" ? "CV imported (replaced)" : "CV imported (merged)");
    } catch (err: any) {
      console.error("CV import error:", err);
      toast("Import failed (invalid JSON)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={["flex flex-wrap items-center gap-2", className].filter(Boolean).join(" ")}>
      <div className="flex items-center gap-2 rounded-xl border border-neutral-800 px-2 py-1.5">
        <span className="text-sm text-neutral-400">Import mode</span>
        <select
          className="bg-transparent text-sm outline-none"
          value={mode}
          onChange={(e) => setMode(e.target.value as ImportMode)}
          aria-label="Import mode"
        >
          <option value="replace">Replace</option>
          <option value="merge">Merge</option>
        </select>
      </div>

      <button
        type="button"
        className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100"
        onClick={onChooseFile}
        disabled={busy}
      >
        Import JSON
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFileChange}
      />

      <button
        type="button"
        className="px-3 py-2 rounded-xl border border-neutral-700"
        onClick={onCopy}
        disabled={busy}
      >
        Copy JSON
      </button>

      <button
        type="button"
        className="px-3 py-2 rounded-xl border border-neutral-700 bg-indigo-600 text-white"
        onClick={onDownload}
        disabled={busy}
      >
        Download JSON
      </button>

      <span className="text-xs text-neutral-500 ml-1">
        Max import {Math.round(maxSizeBytes / 1024)} KB. JSON only.
      </span>
    </div>
  );
}

/* ----------------------- helpers ----------------------- */

function deepMerge<T>(base: any, patch: any): T {
  if (Array.isArray(base) && Array.isArray(patch)) {
    // prefer imported ordering/content
    return patch as T;
  }
  if (isObj(base) && isObj(patch)) {
    const out: Record<string, any> = { ...base };
    for (const k of Object.keys(patch)) {
      const bv = (base as any)[k];
      const pv = (patch as any)[k];
      out[k] = isObj(bv) && isObj(pv) ? deepMerge(bv, pv) : pv;
    }
    return out as T;
  }
  return (patch as unknown) as T;
}
function isObj(v: any): v is Record<string, any> {
  return v && typeof v === "object" && !Array.isArray(v);
}
function guessCVFileName(data: Partial<CVData>) {
  const name = (data as any)?.basics?.name || (data as any)?.name;
  return name ? String(name).trim() : undefined;
}
function safeFileName(s: string) {
  return s.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function toast(msg: string) {
  try {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText =
      "position:fixed;left:50%;top:14px;transform:translateX(-50%);background:#111827;color:#e5e7eb;border:1px solid #374151;padding:8px 12px;border-radius:10px;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,.35);font:13px ui-sans-serif,system-ui";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  } catch {}
}
