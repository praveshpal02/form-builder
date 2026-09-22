import FormBuilder from "./FormBuilder";

export default function EditFormClient({
  formId,
  formTitle,
  formDescription,
  formSchema,
  formStatus,
}) {
  return (
    <FormBuilder
      formId={formId}
      initialSchema={formSchema}
      savedSchema={formSchema}
      formStatus={formStatus}
      formDetails={{
        name: formTitle,
        description: formDescription,
      }}
    />
  );
}
