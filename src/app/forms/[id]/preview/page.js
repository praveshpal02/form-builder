import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/session";
import FormPreview from "@/components/form-builder/FormPreview";

export const metadata = {
  title: "Preview Form | FormCraft",
};

export default async function PreviewFormPage({ params }) {
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

  const schema = JSON.parse(form.schema);

  return <FormPreview title={schema.title} description={schema.description} banner={schema.banner} fields={schema.fields || []} settings={schema.settings || {}} />;
}