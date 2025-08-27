// theidealprogen/src/app/cover-letter/page.tsx
import CLBuilderPage from "@/components/cl/CLBuilderPage";

export const metadata = {
  title: "Cover Letter Builder — TheIdealProGen",
};

export default function Page() {
  return (
    <div className="space-y-4" id="main">
      <h1 className="text-2xl font-semibold">Cover Letter Builder</h1>
      <p className="text-sm text-neutral-400">
        Write a polished cover letter entirely in your browser. Export <strong>PDF only</strong> — nothing is stored on our servers.
      </p>
      <CLBuilderPage />
    </div>
  );
}
