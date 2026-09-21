import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/session";
import EditFormClient from "@/components/form-builder/EditFormClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Form | FormCraft",
};

export default async function EditFormPage({ params }) {
  const { id } = await params;
  const user = await getUserFromRequest();

  if (!user) {
    notFound();
  }

  const db = getDb();
  const form = await db.form.findUnique({ where: { id } });

  if (!form || form.userId !== user.id) {
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
    />
  );
}