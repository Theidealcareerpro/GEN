// theidealprogen/src/app/portfolio/page.tsx
import PortfolioBuilderPage from "@/components/portfolio/PortfolioBuilderPage";

export const metadata = {
  title: "Portfolio Builder — TheIdealProGen",
};

export default function Page() {
  return (
    <div className="space-y-4" id="main">
      <h1 className="text-2xl font-semibold">Portfolio Builder</h1>
      <PortfolioBuilderPage />
    </div>
  );
}
