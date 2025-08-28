// theidealprogen/src/components/cv/CVWrapper.tsx
"use client";
import * as React from "react";

export default function CVWrapper({
  preview,
  actions,
  footer,
  title = "Preview (A4/Letter)",
}: {
  preview: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-neutral-800 bg-neutral-900/60">
        <Dot c="#ff5f57" /><Dot c="#febc2e" /><Dot c="#28c840" />
        <div className="text-xs text-neutral-400 ml-2">{title}</div>
        <div className="ml-auto">{actions}</div>
      </div>
      <div className="p-4 bg-neutral-950">{preview}</div>
      {footer ? <div className="px-4 py-3 border-t border-neutral-800 bg-neutral-950/60">{footer}</div> : null}
    </section>
  );
}
function Dot({ c }: { c: string }) { return <span style={{ width: 10, height: 10, borderRadius: 999, background: c }} className="inline-block" />; }
