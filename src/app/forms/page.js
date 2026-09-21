import Link from "next/link";
import { db } from "@/lib/db";
import FormsListClient from "@/components/FormsListClient";

export const metadata = {
  title: "My Forms | FormCraft",
};

export default async function FormsPage() {
  const forms = await db.form.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = forms.map((f) => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Forms</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize all your forms in one place.
          </p>
        </div>
        <Link
          href="/forms/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Create Form
        </Link>
      </div>

      {serialized.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium">No forms yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Get started by creating your first form.
          </p>
          <Link
            href="/forms/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Create Your First Form
          </Link>
        </div>
      ) : (
        <FormsListClient forms={serialized} />
      )}
    </div>
  );
}
