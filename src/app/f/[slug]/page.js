import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { validateFormSchema } from "@/lib/form-schema";
import FormRenderer from "@/components/form-renderer/FormRenderer";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const form = await db.form.findUnique({
    where: { slug },
    select: { title: true },
  });

  if (!form || form.status !== "published") {
    return { title: "Form Not Found | FormCraft" };
  }

  return { title: `${form.title} | FormCraft` };
}

export default async function PublicFormPage({ params }) {
  const { slug } = await params;

  const form = await db.form.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      description: true,
      schema: true,
      status: true,
    },
  });

  if (!form) {
    notFound();
  }

  if (form.status !== "published") {
    notFound();
  }

  let parsedSchema;
  try {
    parsedSchema = JSON.parse(form.schema);
  } catch {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-muted/30 px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Form Error
            </h2>
            <p className="text-sm text-muted-foreground">
              This form has an invalid configuration. Please contact the form
              owner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const validation = validateFormSchema(parsedSchema);
  if (!validation.valid) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-muted/30 px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Form Error
            </h2>
            <p className="text-sm text-muted-foreground">
              This form has an invalid configuration. Please contact the form
              owner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const rendererSchema = {
    ...parsedSchema,
    title: form.title,
    description: form.description,
  };

  return <FormRenderer schema={rendererSchema} formId={form.id} />;
}
