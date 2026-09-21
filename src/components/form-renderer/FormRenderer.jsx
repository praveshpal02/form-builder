"use client";

import { useState, useMemo } from "react";
import FieldRenderer from "./FieldRenderer";
import { t as formT } from "@/lib/i18n/form-translations";

function getDefaultValue(field) {
  if (field.defaultValue !== undefined && field.defaultValue !== null) {
    return field.defaultValue;
  }
  switch (field.type) {
    case "checkbox":
      return false;
    case "multiselect":
      return [];
    case "rating":
      return "";
    case "number":
      return "";
    default:
      return "";
  }
}

function validateField(field, value, locale) {
  const v = value;

  if (field.required) {
    if (field.type === "checkbox" && !v) return formT("validation.required", locale);
    if (field.type === "multiselect" && (!Array.isArray(v) || v.length === 0))
      return formT("validation.selectAtLeastOne", locale);
    if (field.type === "rating" && (v === "" || v === 0))
      return formT("validation.provideRating", locale);
    if (
      field.type !== "checkbox" &&
      field.type !== "multiselect" &&
      field.type !== "rating"
    ) {
      if (v === "" || v === null || v === undefined)
        return formT("validation.required", locale);
    }
  }

  if (v === "" || v === null || v === undefined) return null;

  switch (field.type) {
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        return formT("validation.email", locale);
      break;
    case "url":
      try {
        new URL(v);
      } catch {
        return formT("validation.url", locale);
      }
      break;
    case "number": {
      const num = Number(v);
      if (isNaN(num)) return formT("validation.number", locale);
      if (field.min !== null && field.min !== undefined && num < field.min)
        return formT("validation.minValue", locale, { min: field.min });
      if (field.max !== null && field.max !== undefined && num > field.max)
        return formT("validation.maxValue", locale, { max: field.max });
      break;
    }
    case "text":
    case "textarea":
      if (typeof v === "string") {
        if (
          field.minLength !== null &&
          field.minLength !== undefined &&
          v.length < field.minLength
        )
          return formT("validation.minLength", locale, { min: field.minLength });
        if (
          field.maxLength !== null &&
          field.maxLength !== undefined &&
          v.length > field.maxLength
        )
          return formT("validation.maxLength", locale, { max: field.maxLength });
      }
      break;
    case "select":
    case "radio":
      if (field.options && field.options.length > 0) {
        const validValues = field.options.map((o) => o.value);
        if (!validValues.includes(v)) return formT("validation.selectOption", locale);
      }
      break;
    case "multiselect":
      if (Array.isArray(v) && field.options && field.options.length > 0) {
        const validValues = field.options.map((o) => o.value);
        const invalid = v.filter((item) => !validValues.includes(item));
        if (invalid.length > 0) return formT("validation.selectOptions", locale);
      }
      if (
        Array.isArray(v) &&
        field.maxSelections &&
        v.length > field.maxSelections
      )
        return formT("validation.maxSelections", locale, { count: field.maxSelections });
      break;
    case "rating": {
      const num = Number(v);
      if (num !== 0 && (isNaN(num) || num < 1))
        return formT("validation.validRating", locale);
      break;
    }
    default:
      break;
  }

  return null;
}

export default function FormRenderer({ schema, formId }) {
  const fields = useMemo(() => schema.fields || [], [schema.fields]);
  const settings = useMemo(() => schema.settings || {}, [schema.settings]);
  const locale = settings.locale || "en-IN";

  const initialValues = useMemo(() => {
    const vals = {};
    for (const field of fields) {
      vals[field.id] = getDefaultValue(field);
    }
    return vals;
  }, [fields]);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (fieldId, newValue) => {
    setValues((prev) => ({ ...prev, [fieldId]: newValue }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    for (const field of fields) {
      const error = validateField(field, values[field.id], locale);
      if (error) newErrors[field.id] = error;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/forms/${formId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: values }),
      });

      const data = await res.json();

      if (res.status === 201 && data.success) {
        setSubmitted(true);
        return;
      }

      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        return;
      }

      setSubmitError(
        data.error || formT("form.error", locale)
      );
    } catch {
      setSubmitError(
        formT("form.error", locale)
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-muted/30 px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-4">
              <svg
                className="h-7 w-7 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {settings.successMessage || formT("form.success", locale)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {formT("form.recorded", locale)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-start justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {schema.title || formT("form.untitledForm", locale)}
            </h1>
            {schema.description && (
              <p className="text-muted-foreground mt-1 text-sm">
                {schema.description}
              </p>
            )}
          </div>

          {fields.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm">{formT("form.noFields", locale)}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate lang={locale} className="space-y-6">
              {submitError && (
                <div
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {submitError}
                </div>
              )}

              {fields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  onChange={(v) => handleChange(field.id, v)}
                  error={errors[field.id]}
                  locale={locale}
                />
              ))}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
                >
                  {submitting
                    ? formT("form.submitting", locale)
                    : settings.submitButtonText || formT("form.submit", locale)}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
