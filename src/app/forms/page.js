import Link from "next/link";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/session";
import FormsListClient from "@/components/FormsListClient";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Forms | FormCraft",
};

export default async function FormsPage() {
  const user = await getUserFromRequest();
  
  if (!user) {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-16">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-4">
            <Icon name="fileText" size="lg" className="text-muted-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Sign in to view your forms</h1>
          <p className="text-sm text-muted-foreground mt-1.5">You need to be signed in to access this page.</p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const db = getDb();
  const forms = await db.form.findMany({
    where: { userId: user.id },
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
    <div className="mx-auto max-w-[1200px] px-5 py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">My Forms</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and organize all your forms.
          </p>
        </div>
        <Link
          href="/forms/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary-hover shrink-0"
        >
          <Icon name="plus" size="sm" aria-hidden="true" />
          New Form
        </Link>
      </div>

      {serialized.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground mb-3">
            <Icon name="plus" size="md" className="text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="text-[15px] font-medium">No forms yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first form to get started.
          </p>
          <Link
            href="/forms/new"
            className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary-hover"
          >
            <Icon name="plus" size="sm" aria-hidden="true" />
            Create Form
          </Link>
        </div>
      ) : (
        <FormsListClient forms={serialized} />
      )}
    </div>
  );
}
