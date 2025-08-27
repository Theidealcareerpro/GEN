// theidealprogen/src/app/cv/page.tsx
import CVBuilderPage from "@/components/cv/CVBuilderPage";

export const metadata = {
  title: "CV Builder — TheIdealProGen",
};

export default function Page() {
  return (
    <div className="space-y-4" id="main">
      <h1 className="text-2xl font-semibold">CV Builder</h1>
      <p className="text-sm text-neutral-400">
        Build a polished CV in your browser. Export <strong>PDF only</strong> — nothing is stored on our servers.
      </p>
      <CVBuilderPage />
    </div>
  );
}
