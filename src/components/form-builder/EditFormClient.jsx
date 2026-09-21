"use client";

import FormBuilder from "./FormBuilder";

export default function EditFormClient({
  formId,
  formTitle,
  formDescription,
  formSchema,
  formStatus,
  formSlug,
}) {
  return (
    <FormBuilder
      mode="edit"
      formId={formId}
      initialSchema={formSchema}
      savedSchema={formSchema}
      formStatus={formStatus}
      formSlug={formSlug}
      formDetails={{
        name: formTitle,
        description: formDescription,
      }}
    />
  );
}
