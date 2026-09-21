"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  createEmptyFormSchema,
} from "@/lib/form-schema";
import {
  getFormTemplate,
  getAllFormTemplates,
  cloneTemplateSchema,
} from "@/lib/form-templates";
import FormBuilder from "./FormBuilder";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function NewFormWizard() {
  const [step, setStep] = useState("method");
  const [creationMethod, setCreationMethod] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [formDetails, setFormDetails] = useState({
    name: "",
    subject: "",
    description: "",
    notificationEmails: [],
  });
  const [emailInput, setEmailInput] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [initialSchema, setInitialSchema] = useState(null);

  const templates = useMemo(() => getAllFormTemplates(), []);
  const selectedTemplate = selectedTemplateId
    ? getFormTemplate(selectedTemplateId)
    : null;

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
      setFormDetails({
        name: tpl.name || "",
        subject: tpl.schema.subject || "",
        description: tpl.schema.description || "",
        notificationEmails: [],
      });
    }
    setFormErrors({});
    setStep("details");
  };

  const handleAddEmail = () => {
    const value = emailInput.trim();
    if (!value) return;

    const errors = {};
    if (!isValidEmail(value)) {
      errors.email = "Please enter a valid email address";
    }
    if (formDetails.notificationEmails.includes(value)) {
      errors.email = "This email is already added";
    }

    if (errors.email) {
      setFormErrors((prev) => ({ ...prev, email: errors.email }));
      return;
    }

    setFormDetails((prev) => ({
      ...prev,
      notificationEmails: [...prev.notificationEmails, value],
    }));
    setEmailInput("");
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.email;
      return next;
    });
  };

  const handleRemoveEmail = (index) => {
    setFormDetails((prev) => ({
      ...prev,
      notificationEmails: prev.notificationEmails.filter((_, i) => i !== index),
    }));
  };

  const handleDetailsChange = (key, value) => {
    setFormDetails((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateDetails = () => {
    const errors = {};

    if (!formDetails.name.trim()) {
      errors.name = "Form name is required";
    }
    if (!formDetails.subject.trim()) {
      errors.subject = "Email subject is required";
    }

    for (const email of formDetails.notificationEmails) {
      if (!isValidEmail(email)) {
        errors.email = `Invalid email: ${email}`;
        break;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToBuilder = () => {
    if (!validateDetails()) return;

    let schema;
    if (creationMethod === "template" && selectedTemplate) {
      schema = cloneTemplateSchema(selectedTemplate);
    } else {
      schema = createEmptyFormSchema();
    }

    setInitialSchema(schema);
    setStep("builder");
  };

  const handleBackToMethod = () => {
    setStep("method");
    setCreationMethod(null);
    setSelectedTemplateId(null);
    setInitialSchema(null);
  };

  if (step === "builder" && initialSchema) {
    return (
      <FormBuilder
        initialSchema={initialSchema}
        formDetails={formDetails}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/forms" className="hover:text-foreground transition-colors">
            Forms
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">New Form</span>
        </div>

        {/* Step: Method Selection */}
        {step === "method" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                How would you like to start?
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Create a form from scratch or use a pre-built template
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleSelectBlank}
                className="group flex flex-col items-start p-6 rounded-2xl border-2 border-border hover:border-primary/60 bg-card hover:bg-muted/30 text-left transition-all hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Blank Form
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Start from scratch with a clean slate
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStep("templates")}
                className="group flex flex-col items-start p-6 rounded-2xl border-2 border-border hover:border-primary/60 bg-card hover:bg-muted/30 text-left transition-all hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Use a Template
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Get started quickly with a pre-built form template
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step: Template Selection */}
        {step === "templates" && (
          <div className="space-y-8">
            <div>
              <button
                type="button"
                onClick={handleBackToMethod}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Choose a Template
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Select a template to get started, or go back to create a blank form
              </p>
            </div>

            <div className="space-y-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {tpl.name}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tpl.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tpl.schema.fields.map((field) => (
                        <span
                          key={field.id}
                          className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                        >
                          {field.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className="shrink-0 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors shadow-xs"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Form Details */}
        {step === "details" && (
          <div className="space-y-8">
            <div>
              <button
                type="button"
                onClick={
                  creationMethod === "template"
                    ? () => setStep("templates")
                    : handleBackToMethod
                }
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Form Details
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {creationMethod === "template"
                  ? `Customize the "${selectedTemplate?.name || "template"}" template`
                  : "Set up your form name and details"}
              </p>
            </div>

            <div className="space-y-6">
              {/* Form Name */}
              <div>
                <label
                  htmlFor="form-name"
                  className="block text-sm font-semibold text-foreground mb-1.5"
                >
                  Form Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-name"
                  type="text"
                  value={formDetails.name}
                  onChange={(e) => handleDetailsChange("name", e.target.value)}
                  placeholder="e.g. Customer Feedback Survey"
                  className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                    formErrors.name
                      ? "border-red-400 focus:border-red-400"
                      : "border-border focus:border-primary"
                  }`}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="form-subject"
                  className="block text-sm font-semibold text-foreground mb-1.5"
                >
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-subject"
                  type="text"
                  value={formDetails.subject}
                  onChange={(e) => handleDetailsChange("subject", e.target.value)}
                  placeholder="e.g. New submission received"
                  className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                    formErrors.subject
                      ? "border-red-400 focus:border-red-400"
                      : "border-border focus:border-primary"
                  }`}
                />
                {formErrors.subject && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.subject}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="form-description"
                  className="block text-sm font-semibold text-foreground mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="form-description"
                  rows={3}
                  value={formDetails.description}
                  onChange={(e) => handleDetailsChange("description", e.target.value)}
                  placeholder="Optional description for respondents"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-colors"
                />
              </div>

              {/* Notification Emails */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Notification Emails
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Get notified when someone submits the form
                </p>

                <div className="space-y-2">
                  {formDetails.notificationEmails.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2"
                    >
                      <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <span className="flex-1 text-sm text-foreground">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(index)}
                        className="p-1 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.email;
                        return next;
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEmail();
                      }
                    }}
                    placeholder="admin@example.com"
                    className={`flex-1 rounded-xl border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                      formErrors.email
                        ? "border-red-400 focus:border-red-400"
                        : "border-border focus:border-primary"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddEmail}
                    className="shrink-0 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleContinueToBuilder}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors shadow-xs"
              >
                Continue to Builder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
