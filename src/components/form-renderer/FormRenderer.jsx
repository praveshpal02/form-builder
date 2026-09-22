"use client";

import { useState, useMemo, useEffect } from "react";
import FieldRenderer from "./FieldRenderer";
import FormThemeProvider from "./FormThemeProvider";
import { t as formT } from "@/lib/i18n/form-translations";
import { Icon } from "@/components/ui/Icon";

function getDefaultValue(field) {
  if (field.defaultValue !== undefined && field.defaultValue !== null) return field.defaultValue;
  switch (field.type) {
    case "checkbox": return false;
    case "multiselect": return [];
    case "file": return [];
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
    if (field.type === "file" && (!Array.isArray(v) || v.length === 0)) return formT("validation.required", locale);
    if (field.type === "rating" && (v === "" || v === 0)) return formT("validation.provideRating", locale);
    if (field.type !== "checkbox" && field.type !== "multiselect" && field.type !== "rating" && field.type !== "file") {
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
  const theme = settings.theme;
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
      <FormThemeProvider theme={theme}>
        <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-10" style={{ backgroundColor: "var(--form-page-bg)" }}>
          <div className="w-full max-w-lg">
            <div className="rounded-lg p-8 shadow-sm text-center" style={{ backgroundColor: "var(--form-card-bg)", color: "var(--form-text)", border: "1px solid var(--form-input-border)" }}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4" style={{ backgroundColor: "color-mix(in srgb, #16a34a 10%, transparent)" }}>
                <Icon name="checkCircle" size="lg" style={{ color: "#16a34a" }} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold mb-1.5">{settings.successMessage || formT("form.success", locale)}</h2>
              <p className="text-[13px]" style={{ color: "var(--form-muted-text)" }}>{formT("form.recorded", locale)}</p>
              {preview && (
                <button type="button" onClick={() => { setSubmitted(false); setValues(initialValues); setErrors({}); if (onPreviewReset) onPreviewReset(); }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-medium transition-colors" style={{ border: "1px solid var(--form-input-border)", color: "var(--form-text)" }}>
                  <Icon name="rotateCcw" size="sm" strokeWidth={2} aria-hidden="true" />
                  Submit another response
                </button>
              )}
            </div>
          </div>
        </div>
      </FormThemeProvider>
    );
  }

  if (formClosed.closed) {
    return (
      <FormThemeProvider theme={theme}>
        <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-10" style={{ backgroundColor: "var(--form-page-bg)" }}>
          <div className="w-full max-w-lg">
            <div className="rounded-lg p-8 shadow-sm text-center" style={{ backgroundColor: "var(--form-card-bg)", color: "var(--form-text)", border: "1px solid var(--form-input-border)" }}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4" style={{ backgroundColor: "color-mix(in srgb, #f59e0b 10%, transparent)" }}>
                <Icon name="alertTriangle" size="lg" style={{ color: "#f59e0b" }} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold mb-1.5">{formT("form.closedTitle", locale)}</h2>
              <p className="text-[13px]" style={{ color: "var(--form-muted-text)" }}>{formClosed.message}</p>
            </div>
          </div>
        </div>
      </FormThemeProvider>
    );
  }

  return (
    <FormThemeProvider theme={theme}>
      <div className="flex min-h-[calc(100vh-56px)] items-start justify-center px-4 py-10" style={{ backgroundColor: "var(--form-page-bg)" }}>
        <div className="w-full max-w-lg rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: "var(--form-card-bg)", color: "var(--form-text)", border: "1px solid var(--form-input-border)" }}>
          {schema.banner && (
            <img src={schema.banner} alt="Form banner" className="w-full h-40 sm:h-52 object-cover" loading="lazy" />
          )}
          <div className="p-6 sm:p-8">
            <div className="mb-5">
              <h1 className="text-xl font-semibold tracking-tight">{schema.title || formT("form.untitledForm", locale)}</h1>
              {schema.description && <p className="mt-1 text-[13px]" style={{ color: "var(--form-muted-text)" }}>{schema.description}</p>}
            </div>

            {settings.showProgressBar && displayFields.length > 0 && (
              <div className="mb-5" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Form completion progress">
                <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: "var(--form-muted-text)" }}>
                  <span>Progress</span><span>{progress}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "color-mix(in srgb, var(--form-text) 8%, transparent)" }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: "var(--form-accent)" }} />
                </div>
              </div>
            )}

            {displayFields.length === 0 ? (
              <div className="py-10 text-center" style={{ color: "var(--form-muted-text)" }}><p className="text-[13px]">{formT("form.noFields", locale)}</p></div>
            ) : (
              <form onSubmit={handleSubmit} noValidate lang={locale} className="space-y-5">
                {submitError && <div className="rounded-md px-3 py-2.5 text-[13px]" style={{ border: "1px solid color-mix(in srgb, var(--form-accent) 30%, transparent)", backgroundColor: "color-mix(in srgb, var(--form-accent) 5%, transparent)", color: "var(--form-accent)" }} role="alert">{submitError}</div>}
                {displayFields.map((field) => (
                  <FieldRenderer key={field.id} field={field} value={values[field.id]} onChange={(v) => handleChange(field.id, v)} error={errors[field.id]} locale={locale} formId={formId} disabled={submitting} />
                ))}
                <div className="pt-1">
                  <button type="submit" disabled={submitting} className="w-full rounded-md px-6 py-2.5 text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors" style={{ backgroundColor: "var(--form-btn-bg)", color: "var(--form-btn-text)" }}>
                    {submitting ? formT("form.submitting", locale) : settings.submitButtonText || formT("form.submit", locale)}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </FormThemeProvider>
  );
}
