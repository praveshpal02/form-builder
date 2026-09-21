"use client";

import FormRenderer from "@/components/form-renderer/FormRenderer";

export default function PublicFormClient({ form }) {
  return (
    <div className="min-h-screen bg-background">
      <FormRenderer schema={form.schema} formId={form.id} />
    </div>
  );
}
