import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Building something amazing
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Create forms that
          <span className="text-primary"> just work</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Design, build, and share dynamic forms in minutes. No coding required.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/forms/new"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Create a Form
          </Link>
          <Link
            href="/forms"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            View All Forms
          </Link>
        </div>
      </div>
    </div>
  );
}
