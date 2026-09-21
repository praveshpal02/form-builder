import Link from "next/link";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/session";
import FormsListClient from "@/components/FormsListClient";

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
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Sign in to view your forms</h1>
          <p className="text-sm text-muted-foreground mt-1.5">You need to be signed in to access this page.</p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-foreground/90"
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Forms</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and organize all your forms.
          </p>
        </div>
        <Link
          href="/forms/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-foreground/90"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Form
        </Link>
      </div>

      {serialized.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground mb-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h3 className="text-[15px] font-medium">No forms yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first form to get started.
          </p>
          <Link
            href="/forms/new"
            className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-foreground/90"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Form
          </Link>
        </div>
      ) : (
        <FormsListClient forms={serialized} />
      )}
    </div>
  );
}
