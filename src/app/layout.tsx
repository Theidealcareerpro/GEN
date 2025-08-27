import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "TheIdealProGen",
    template: "%s — TheIdealProGen",
  },
  description:
    "Build polished portfolios, CVs, and cover letters. Free by default, deploy to GitHub Pages, and upgrade when you need more.",
  applicationName: "TheIdealProGen",
  authors: [{ name: "TheIdealProGen" }],
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  other: {
    "referrer-policy": "strict-origin-when-cross-origin",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-indigo-600/40">
        {/* Skip to content for a11y */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-neutral-900 focus:text-neutral-50 focus:outline-none"
        >
          Skip to content
        </a>

        {/* Site Header */}
        <header className="border-b border-neutral-900/80 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold">
                TG
              </span>
              <span className="font-semibold tracking-tight">TheIdealProGen</span>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-3">
              <Link className="navlink" href="/portfolio">
                Portfolio
              </Link>
              <Link className="navlink" href="/cv">
                Cv
              </Link>
              <Link className="navlink" href="/cover-letter">
                Cover Letter
              </Link>
              <Link className="navlink" href="/deployments">
                My Deployments
              </Link>
              <Link className="navlink" href="/supporter/redeem">
                Supporter&nbsp;Redeem
              </Link>
              {/* Soft-launch: keep “Upgrade” visible but it can route to a simple info or paywall page later */}
              <Link className="btn btn-ghost hidden sm:inline-flex" href="/deployments">
                Upgrade
              </Link>
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6" id="main">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-8 border-t border-neutral-900/80">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 text-xs text-neutral-400 flex flex-wrap items-center justify-between gap-3">
            <p>
              © {new Date().getFullYear()} TheIdealProGen • Built for professionals. Deploy on GitHub Pages.
            </p>
            <p className="space-x-3">
              <a className="text-neutral-400 hover:text-neutral-200 underline underline-offset-2" href="/deployments">
                Changelog / What’s New
              </a>
              <span>•</span>
              <a className="text-neutral-400 hover:text-neutral-200 underline underline-offset-2" href="/supporter/redeem">
                Support us
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
