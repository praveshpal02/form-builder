import FormRenderer from "@/components/form-renderer/FormRenderer";

export default function PublicFormClient({ form, submissionCount = 0 }) {
  return (
    <div className="min-h-screen bg-background">
      <FormRenderer schema={form.schema} formId={form.id} submissionCount={submissionCount} />
    </div>
  );
}
