"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEmptyFormSchema } from "@/lib/form-schema";
import { getFormTemplate, getAllFormTemplates, cloneTemplateSchema } from "@/lib/form-templates";
import { Icon } from "@/components/ui/Icon";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function NewFormWizard() {
  const router = useRouter();
  const [step, setStep] = useState("method");
  const [creationMethod, setCreationMethod] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [formDetails, setFormDetails] = useState({ name: "", subject: "", description: "", notificationEmails: [] });
  const [emailInput, setEmailInput] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const templates = useMemo(() => getAllFormTemplates(), []);
  const selectedTemplate = selectedTemplateId ? getFormTemplate(selectedTemplateId) : null;

  const handleSelectBlank = () => {
    setCreationMethod("blank");
    setFormDetails({ name: "", subject: "", description: "", notificationEmails: [] });
    setFormErrors({});
    setStep("details");
  };

  const handleSelectTemplate = (templateId) => {
    setCreationMethod("template");
    setSelectedTemplateId(templateId);
    const tpl = getFormTemplate(templateId);
    if (tpl) {
      setFormDetails({ name: tpl.name || "", subject: tpl.schema.subject || "", description: tpl.schema.description || "", notificationEmails: [] });
    }
    setFormErrors({});
    setStep("details");
  };

  const handleAddEmail = () => {
    const value = emailInput.trim();
    if (!value) return;
    const errors = {};
    if (!isValidEmail(value)) errors.email = "Please enter a valid email address";
    if (formDetails.notificationEmails.includes(value)) errors.email = "This email is already added";
    if (errors.email) { setFormErrors((prev) => ({ ...prev, email: errors.email })); return; }
    setFormDetails((prev) => ({ ...prev, notificationEmails: [...prev.notificationEmails, value] }));
    setEmailInput("");
    setFormErrors((prev) => { const next = { ...prev }; delete next.email; return next; });
  };

  const handleRemoveEmail = (index) => {
    setFormDetails((prev) => ({ ...prev, notificationEmails: prev.notificationEmails.filter((_, i) => i !== index) }));
  };

  const handleDetailsChange = (key, value) => {
    setFormDetails((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const validateDetails = () => {
    const errors = {};
    if (!formDetails.name.trim()) errors.name = "Form name is required";
    if (!formDetails.subject.trim()) errors.subject = "Email subject is required";
    for (const email of formDetails.notificationEmails) {
      if (!isValidEmail(email)) { errors.email = `Invalid email: ${email}`; break; }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToBuilder = async () => {
    if (!validateDetails()) return;
    setIsCreating(true);
    setFormErrors({});
    let schema;
    if (creationMethod === "template" && selectedTemplate) { schema = cloneTemplateSchema(selectedTemplate); } else { schema = createEmptyFormSchema(); }
    schema.title = formDetails.name;
    schema.description = formDetails.description || "";
    schema.settings = { ...schema.settings, subject: formDetails.subject, notificationEmails: formDetails.notificationEmails };
    try {
      const res = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: formDetails.name, description: formDetails.description || "", schema, status: "draft" }) });
      const data = await res.json();
      if (!res.ok || !data.success || !data.form?.id) throw new Error(data.error || "Failed to create form");
      router.push(`/forms/${data.form.id}/edit`);
    } catch (err) {
      setFormErrors({ submit: err.message || "Failed to create form." });
      setIsCreating(false);
    }
  };

  if (isCreating) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-[13px] text-muted-foreground">Creating your form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-8">
          <Link href="/forms" className="hover:text-foreground transition-colors">Forms</Link>
          <span>/</span>
          <span className="text-foreground font-medium">New Form</span>
        </div>

        {step === "method" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">How would you like to start?</h1>
              <p className="text-[13px] text-muted-foreground mt-1">Create a form from scratch or use a pre-built template</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={handleSelectBlank}
                className="group flex flex-col items-start p-5 rounded-lg border border-border hover:border-primary/40 bg-white hover:bg-primary-soft/40 text-left transition-all hover:shadow-sm">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary-soft text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon name="plus" size="md" aria-hidden="true" />
                </div>
                <h2 className="text-[15px] font-medium text-foreground">Blank Form</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">Start from scratch</p>
              </button>
              <button type="button" onClick={() => setStep("templates")}
                className="group flex flex-col items-start p-5 rounded-lg border border-border hover:border-primary/40 bg-white hover:bg-primary-soft/40 text-left transition-all hover:shadow-sm">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary-soft text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon name="fileText" size="md" aria-hidden="true" />
                </div>
                <h2 className="text-[15px] font-medium text-foreground">Use a Template</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">Get started quickly with a pre-built form</p>
              </button>
            </div>
          </div>
        )}

        {step === "templates" && (
          <div className="space-y-6">
            <div>
              <button type="button" onClick={() => { setStep("method"); setCreationMethod(null); setSelectedTemplateId(null); }}
                className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
                <Icon name="arrowLeft" size="sm" strokeWidth={2} aria-hidden="true" />
                Back
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Choose a Template</h1>
              <p className="text-[13px] text-muted-foreground mt-1">Select a template to get started</p>
            </div>
            <div className="space-y-2">
              {templates.map((tpl) => (
                <div key={tpl.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-white hover:shadow-sm transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-medium text-foreground">{tpl.name}</h3>
                      <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{tpl.category}</span>
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{tpl.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {tpl.schema.fields.map((field) => (
                        <span key={field.id} className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{field.label}</span>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={() => handleSelectTemplate(tpl.id)}
                    className="shrink-0 rounded-md bg-primary px-4 py-1.5 text-[13px] font-medium text-white hover:bg-primary-hover transition-colors">
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-6">
            <div>
              <button type="button" onClick={creationMethod === "template" ? () => setStep("templates") : () => { setStep("method"); setCreationMethod(null); }}
                className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
                <Icon name="arrowLeft" size="sm" strokeWidth={2} aria-hidden="true" />
                Back
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Form Details</h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                {creationMethod === "template" ? `Customize the "${selectedTemplate?.name || "template"}" template` : "Set up your form name and details"}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="form-name" className="block text-[13px] font-medium text-foreground mb-1">Form Name <span className="text-destructive">*</span></label>
                <input id="form-name" type="text" value={formDetails.name} onChange={(e) => handleDetailsChange("name", e.target.value)} placeholder="e.g. Customer Feedback Survey"
                  className={`w-full rounded-md border bg-white px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors ${formErrors.name ? "border-destructive focus:border-destructive" : "border-border focus:border-primary/40"}`} />
                {formErrors.name && <p className="text-[12px] text-destructive mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="form-subject" className="block text-[13px] font-medium text-foreground mb-1">Subject <span className="text-destructive">*</span></label>
                <input id="form-subject" type="text" value={formDetails.subject} onChange={(e) => handleDetailsChange("subject", e.target.value)} placeholder="e.g. New submission received"
                  className={`w-full rounded-md border bg-white px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors ${formErrors.subject ? "border-destructive focus:border-destructive" : "border-border focus:border-primary/40"}`} />
                {formErrors.subject && <p className="text-[12px] text-destructive mt-1">{formErrors.subject}</p>}
              </div>
              <div>
                <label htmlFor="form-description" className="block text-[13px] font-medium text-foreground mb-1">Description</label>
                <textarea id="form-description" rows={3} value={formDetails.description} onChange={(e) => handleDetailsChange("description", e.target.value)} placeholder="Optional description for respondents"
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none transition-colors" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">Notification Emails</label>
                <p className="text-[12px] text-muted-foreground mb-2">Get notified when someone submits the form</p>
                <div className="space-y-1.5">
                  {formDetails.notificationEmails.map((email, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5">
                      <Icon name="mail" size="sm" className="text-muted-foreground shrink-0" aria-hidden="true" />
                      <span className="flex-1 text-[13px] text-foreground">{email}</span>
                      <button type="button" onClick={() => handleRemoveEmail(index)} className="p-0.5 text-muted-foreground hover:text-destructive rounded hover:bg-muted transition-colors">
                        <Icon name="x" size="sm" strokeWidth={2} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="email" value={emailInput} onChange={(e) => { setEmailInput(e.target.value); setFormErrors((prev) => { const next = { ...prev }; delete next.email; return next; }); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddEmail(); } }} placeholder="admin@example.com"
                    className={`flex-1 rounded-md border bg-white px-3 py-1.5 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors ${formErrors.email ? "border-destructive focus:border-destructive" : "border-border focus:border-primary/40"}`} />
                  <button type="button" onClick={handleAddEmail} className="shrink-0 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-muted transition-colors">Add</button>
                </div>
                {formErrors.email && <p className="text-[12px] text-destructive mt-1">{formErrors.email}</p>}
              </div>
            </div>
            {formErrors.submit && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">{formErrors.submit}</div>}
            <div className="flex justify-end pt-3 border-t border-border">
              <button type="button" onClick={handleContinueToBuilder} disabled={isCreating}
                className="rounded-md bg-primary px-5 py-2 text-[13px] font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isCreating ? "Creating..." : "Continue to Builder"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
