import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import SubmissionList from "@/components/submissions/SubmissionList";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const form = await db.form.findUnique({
    where: { id },
    select: { title: true },
  });

  if (!form) {
    return { title: "Form Not Found | FormCraft" };
  }

  return { title: `Responses — ${form.title} | FormCraft` };
}

export default async function ResponsesPage({ params }) {
  const { id } = await params;

  const form = await db.form.findUnique({ where: { id } });

  if (!form) {
    notFound();
  }

  let schema;
  try {
    schema = JSON.parse(form.schema);
  } catch {
    schema = { fields: [] };
  }

  const fields = schema.fields || [];

  const submissions = await db.formSubmission.findMany({
    where: { formId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      response: true,
    },
  });

  const parsed = submissions.map((s) => {
    let response;
    try {
      response = JSON.parse(s.response);
    } catch {
      response = null;
    }
    return {
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      response,
    };
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/forms" className="hover:text-foreground transition-colors">
          Forms
        </Link>
        <span>/</span>
        <Link
          href={`/forms/${id}/edit`}
          className="hover:text-foreground transition-colors"
        >
          {form.title}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Responses</span>
      </div>

      <SubmissionList
        formId={id}
        submissions={parsed}
        fields={fields}
        formTitle={form.title}
        formStatus={form.status}
      />
    </div>
  );
}
