import { notFound } from "next/navigation";
import PublicFormClient from "@/components/PublicFormClient";

async function getFormById(id) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/forms/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.success ? data.form : null;
  } catch (error) {
    console.error("Error fetching form:", error);
    return null;
  }
}

export default async function PublicFormPage({ params }) {
  const { id } = await params;
  const form = await getFormById(id);

  if (!form) {
    notFound();
  }

  return <PublicFormClient form={form} submissionCount={form.submissionCount || 0} />;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const form = await getFormById(id);

  if (!form) {
    return {
      title: "Form Not Found",
    };
  }

  return {
    title: form.schema?.title || form.title || "Form",
    description: form.schema?.description || form.description || "Fill out this form",
  };
}