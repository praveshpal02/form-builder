import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import EditFormClient from "@/components/form-builder/EditFormClient";

export const metadata = {
  title: "Edit Form | FormCraft",
};

export default async function EditFormPage({ params }) {
  const { id } = await params;

  const form = await db.form.findUnique({ where: { id } });

  if (!form) {
    notFound();
  }

  const parsedSchema = JSON.parse(form.schema);

  return (
    <EditFormClient
      formId={form.id}
      formTitle={form.title}
      formDescription={form.description}
      formSchema={parsedSchema}
      formStatus={form.status}
      formSlug={form.slug}
    />
  );
}
