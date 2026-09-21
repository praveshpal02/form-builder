"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEmptyFormSchema } from "@/lib/form-schema";
import { getFormTemplate, getAllFormTemplates, cloneTemplateSchema } from "@/lib/form-templates";

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
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-foreground border-t-transparent mx-auto mb-3" />
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
                className="group flex flex-col items-start p-5 rounded-lg border border-border hover:border-foreground/20 bg-white hover:bg-muted/20 text-left transition-all hover:shadow-sm">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-muted-foreground mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h2 className="text-[15px] font-medium text-foreground">Blank Form</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">Start from scratch</p>
              </button>
              <button type="button" onClick={() => setStep("templates")}
                className="group flex flex-col items-start p-5 rounded-lg border border-border hover:border-foreground/20 bg-white hover:bg-muted/20 text-left transition-all hover:shadow-sm">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-muted-foreground mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                  </svg>
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
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
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
                    className="shrink-0 rounded-md bg-foreground px-4 py-1.5 text-[13px] font-medium text-white hover:bg-foreground/90 transition-colors">
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
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
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
                  className={`w-full rounded-md border bg-white px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-colors ${formErrors.name ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30"}`} />
                {formErrors.name && <p className="text-[12px] text-destructive mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="form-subject" className="block text-[13px] font-medium text-foreground mb-1">Subject <span className="text-destructive">*</span></label>
                <input id="form-subject" type="text" value={formDetails.subject} onChange={(e) => handleDetailsChange("subject", e.target.value)} placeholder="e.g. New submission received"
                  className={`w-full rounded-md border bg-white px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-colors ${formErrors.subject ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30"}`} />
                {formErrors.subject && <p className="text-[12px] text-destructive mt-1">{formErrors.subject}</p>}
              </div>
              <div>
                <label htmlFor="form-description" className="block text-[13px] font-medium text-foreground mb-1">Description</label>
                <textarea id="form-description" rows={3} value={formDetails.description} onChange={(e) => handleDetailsChange("description", e.target.value)} placeholder="Optional description for respondents"
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none transition-colors" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">Notification Emails</label>
                <p className="text-[12px] text-muted-foreground mb-2">Get notified when someone submits the form</p>
                <div className="space-y-1.5">
                  {formDetails.notificationEmails.map((email, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5">
                      <svg className="h-3.5 w-3.5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <span className="flex-1 text-[13px] text-foreground">{email}</span>
                      <button type="button" onClick={() => handleRemoveEmail(index)} className="p-0.5 text-muted-foreground hover:text-destructive rounded hover:bg-muted transition-colors">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="email" value={emailInput} onChange={(e) => { setEmailInput(e.target.value); setFormErrors((prev) => { const next = { ...prev }; delete next.email; return next; }); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddEmail(); } }} placeholder="admin@example.com"
                    className={`flex-1 rounded-md border bg-white px-3 py-1.5 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-colors ${formErrors.email ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30"}`} />
                  <button type="button" onClick={handleAddEmail} className="shrink-0 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-muted transition-colors">Add</button>
                </div>
                {formErrors.email && <p className="text-[12px] text-destructive mt-1">{formErrors.email}</p>}
              </div>
            </div>
            {formErrors.submit && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">{formErrors.submit}</div>}
            <div className="flex justify-end pt-3 border-t border-border">
              <button type="button" onClick={handleContinueToBuilder} disabled={isCreating}
                className="rounded-md bg-foreground px-5 py-2 text-[13px] font-medium text-white hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isCreating ? "Creating..." : "Continue to Builder"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
