"use client";

import { useState, useMemo, useEffect } from "react";
import FieldRenderer from "./FieldRenderer";
import { t as formT } from "@/lib/i18n/form-translations";

function getDefaultValue(field) {
  if (field.defaultValue !== undefined && field.defaultValue !== null) return field.defaultValue;
  switch (field.type) {
    case "checkbox": return false;
    case "multiselect": return [];
    case "rating": return "";
    case "number": return "";
    default: return "";
  }
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
  return shuffled;
}

function validateField(field, value, locale) {
  const v = value;
  if (field.required) {
    if (field.type === "checkbox" && !v) return formT("validation.required", locale);
    if (field.type === "multiselect" && (!Array.isArray(v) || v.length === 0)) return formT("validation.selectAtLeastOne", locale);
    if (field.type === "rating" && (v === "" || v === 0)) return formT("validation.provideRating", locale);
    if (field.type !== "checkbox" && field.type !== "multiselect" && field.type !== "rating") {
      if (v === "" || v === null || v === undefined) return formT("validation.required", locale);
    }
  }
  if (v === "" || v === null || v === undefined) return null;
  switch (field.type) {
    case "email": if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return formT("validation.email", locale); break;
    case "url": try { new URL(v); } catch { return formT("validation.url", locale); } break;
    case "number": { const num = Number(v); if (isNaN(num)) return formT("validation.number", locale); if (field.min !== null && field.min !== undefined && num < field.min) return formT("validation.minValue", locale, { min: field.min }); if (field.max !== null && field.max !== undefined && num > field.max) return formT("validation.maxValue", locale, { max: field.max }); break; }
    case "text": case "textarea":
      if (typeof v === "string") {
        if (field.minLength !== null && field.minLength !== undefined && v.length < field.minLength) return formT("validation.minLength", locale, { min: field.minLength });
        if (field.maxLength !== null && field.maxLength !== undefined && v.length > field.maxLength) return formT("validation.maxLength", locale, { max: field.maxLength });
      } break;
    case "select": case "radio": if (field.options && field.options.length > 0) { const validValues = field.options.map((o) => o.value); if (!validValues.includes(v)) return formT("validation.selectOption", locale); } break;
    case "multiselect":
      if (Array.isArray(v) && field.options && field.options.length > 0) { const validValues = field.options.map((o) => o.value); const invalid = v.filter((item) => !validValues.includes(item)); if (invalid.length > 0) return formT("validation.selectOptions", locale); }
      if (Array.isArray(v) && field.maxSelections && v.length > field.maxSelections) return formT("validation.maxSelections", locale, { count: field.maxSelections }); break;
    case "rating": { const num = Number(v); if (num !== 0 && (isNaN(num) || num < 1)) return formT("validation.validRating", locale); break; }
    default: break;
  }
  return null;
}

function checkFormClosed(settings, submissionCount, locale) {
  if (!settings) return { closed: false, message: "" };
  if (settings.closeFormOnDate && settings.closeFormDate) {
    const closeDate = new Date(settings.closeFormDate);
    if (!isNaN(closeDate.getTime()) && new Date() > closeDate) return { closed: true, message: settings.closedFormMessage || formT("form.closedMessage", locale) };
  }
  if (settings.closeFormOnLimit && settings.responseLimit != null) {
    if (submissionCount >= settings.responseLimit) {
      return { closed: true, message: settings.closedFormMessage || formT("form.closedMessage", locale) };
    }
  }
  return { closed: false, message: "" };
}

export default function FormRenderer({ schema, formId, submissionCount = 0, preview = false, onPreviewReset }) {
  const rawFields = useMemo(() => schema.fields || [], [schema.fields]);
  const settings = useMemo(() => schema.settings || {}, [schema.settings]);
  const locale = settings.locale || "en-IN";
  const displayFields = useMemo(() => settings.shuffleFields ? shuffleArray(rawFields) : rawFields, [rawFields, settings.shuffleFields]);
  const formClosed = useMemo(() => checkFormClosed(settings, submissionCount, locale), [settings, submissionCount, locale]);
  const initialValues = useMemo(() => { const vals = {}; for (const field of displayFields) { vals[field.id] = getDefaultValue(field); } return vals; }, [displayFields]);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const progress = useMemo(() => {
    if (!settings.showProgressBar || displayFields.length === 0) return 0;
    const answered = displayFields.filter((field) => {
      const val = values[field.id];
      if (field.type === "checkbox") return val === true;
      if (field.type === "multiselect") return Array.isArray(val) && val.length > 0;
      if (field.type === "rating") return val !== "" && val !== 0;
      return val !== "" && val !== null && val !== undefined;
    }).length;
    return Math.round((answered / displayFields.length) * 100);
  }, [values, displayFields, settings.showProgressBar]);

  const handleChange = (fieldId, newValue) => {
    setValues((prev) => ({ ...prev, [fieldId]: newValue }));
    if (errors[fieldId]) setErrors((prev) => { const next = { ...prev }; delete next[fieldId]; return next; });
  };

  const validate = () => {
    const newErrors = {};
    for (const field of displayFields) { const error = validateField(field, values[field.id], locale); if (error) newErrors[field.id] = error; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    if (preview) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true); setSubmitError(null);
    try {
      const res = await fetch(`/api/forms/${formId}/submissions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ response: values }) });
      const data = await res.json();
      if (res.status === 201 && data.success) {
        if (settings.redirectOnSubmit && settings.redirectUrl) {
          window.location.href = settings.redirectUrl;
          return;
        }
        setSubmitted(true);
        return;
      }
      if (res.status === 400 && data.errors) { setErrors(data.errors); return; }
      setSubmitError(data.error || formT("form.error", locale));
    } catch { setSubmitError(formT("form.error", locale)); } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-muted/30 px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-lg border border-border bg-white p-8 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-bg mx-auto mb-4">
              <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1.5">{settings.successMessage || formT("form.success", locale)}</h2>
            <p className="text-[13px] text-muted-foreground">{formT("form.recorded", locale)}</p>
            {preview && (
              <button type="button" onClick={() => { setSubmitted(false); setValues(initialValues); setErrors({}); if (onPreviewReset) onPreviewReset(); }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2 text-[13px] font-medium text-foreground hover:bg-muted transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Submit another response
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (formClosed.closed) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-muted/30 px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-lg border border-border bg-white p-8 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-warning-bg mx-auto mb-4">
              <svg className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1.5">{formT("form.closedTitle", locale)}</h2>
            <p className="text-[13px] text-muted-foreground">{formClosed.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-start justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="rounded-lg border border-border bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{schema.title || formT("form.untitledForm", locale)}</h1>
            {schema.description && <p className="text-muted-foreground mt-1 text-[13px]">{schema.description}</p>}
          </div>

          {settings.showProgressBar && displayFields.length > 0 && (
            <div className="mb-5" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Form completion progress">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span>Progress</span><span>{progress}%</span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-foreground transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {displayFields.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground"><p className="text-[13px]">{formT("form.noFields", locale)}</p></div>
          ) : (
            <form onSubmit={handleSubmit} noValidate lang={locale} className="space-y-5">
              {submitError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700" role="alert">{submitError}</div>}
              {displayFields.map((field) => (
                <FieldRenderer key={field.id} field={field} value={values[field.id]} onChange={(v) => handleChange(field.id, v)} error={errors[field.id]} locale={locale} />
              ))}
              <div className="pt-1">
                <button type="submit" disabled={submitting} className="w-full rounded-md bg-foreground px-6 py-2.5 text-[13px] font-medium text-white hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {submitting ? formT("form.submitting", locale) : settings.submitButtonText || formT("form.submit", locale)}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
