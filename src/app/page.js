import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-3xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
          Building something amazing
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          Create forms that
          <span className="text-primary"> just work</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Design, build, and share dynamic forms in minutes. No coding required.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/forms/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create a Form
          </Link>
          <Link
            href="/forms"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 016 16.5h10.5A2.25 2.25 0 0118 18.75V21m-15-15h15m0 0h.75c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H6a2.25 2.25 0 00-2.25 2.25" />
            </svg>
            View All Forms
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground/60 pt-8 border-t border-border w-full max-w-md">
          <span>Free to start</span>
          <span className="w-px h-4 bg-border" aria-hidden="true" />
          <span>No credit card required</span>
          <span className="w-px h-4 bg-border" aria-hidden="true" />
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  );
}