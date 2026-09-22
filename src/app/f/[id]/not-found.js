import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mb-4">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Form Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          The form you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Link
          href="/forms"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors shadow-xs"
        >
          Go to Forms
        </Link>
      </div>
    </div>
  );
}