"use client";

import { useState } from "react";

export default function FormPreview({ title, description, fields, settings }) {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId, checked) => {
    setFormData((prev) => ({ ...prev, [fieldId]: checked }));
  };

  const handleMultiSelectToggle = (fieldId, optionValue, currentValues = []) => {
    const exists = currentValues.includes(optionValue);
    const next = exists
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue];
    setFormData((prev) => ({ ...prev, [fieldId]: next }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-background">
        <div className="w-full max-w-2xl flex flex-col items-center justify-center min-h-[550px]">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {settings?.successMessage || "Thanks for completing this form!"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Made with FormCraft, the simplest way to create forms for free.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setFormData({});
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Submit another response
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderField = (field) => {
    const value = formData[field.id] ?? field.defaultValue ?? "";

    switch (field.type) {
      case "text":
      case "phone":
      case "url":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder || (field.type === "url" ? "https://example.com" : field.type === "phone" ? "+1 (555) 000-0000" : "Your answer")}
            required={field.required}
            minLength={field.minLength || undefined}
            maxLength={field.maxLength || undefined}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder || "name@example.com"}
            required={field.required}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder || "0"}
            min={field.min ?? undefined}
            max={field.max ?? undefined}
            step={field.step ?? 1}
            required={field.required}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        );

      case "textarea":
        return (
          <textarea
            rows={field.rows || 4}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder || "Type your response here..."}
            required={field.required}
            minLength={field.minLength || undefined}
            maxLength={field.maxLength || undefined}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none"
          />
        );

      case "select":
        return (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary pr-10 transition-colors"
            >
              <option value="">
                {field.placeholder || "Select an option..."}
              </option>
              {Array.isArray(field.options) &&
                field.options.map((opt, idx) => (
                  <option key={idx} value={opt.value}>
                    {opt.label || opt.value || `Option ${idx + 1}`}
                  </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        );

      case "multiselect": {
        const selected = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border bg-background min-h-[48px]">
              {Array.isArray(field.options) && field.options.length > 0 ? (
                field.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleMultiSelectToggle(field.id, opt.value, selected)}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected.includes(opt.value)
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {opt.label || opt.value || `Option ${idx + 1}`}
                  </button>
                ))
              ) : (
                <span className="text-xs text-muted-foreground/60">
                  {field.placeholder || "No options available"}
                </span>
              )}
            </div>
            {field.maxSelections && (
              <p className="text-[11px] text-muted-foreground">
                Max {field.maxSelections} selection(s)
              </p>
            )}
          </div>
        );
      }

      case "radio":
        return (
          <div className="space-y-2">
            {Array.isArray(field.options) && field.options.length > 0 ? (
              field.options.map((opt, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 text-sm text-foreground cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="radio"
                    name={`preview_${field.id}`}
                    checked={value === opt.value}
                    onChange={() => handleChange(field.id, opt.value)}
                    required={field.required}
                    className="h-4 w-4 border-border text-primary focus:ring-primary"
                  />
                  <span>{opt.label || opt.value || `Option ${idx + 1}`}</span>
                </label>
              ))
            ) : (
              <div className="text-xs text-muted-foreground italic">
                No options configured
              </div>
            )}
          </div>
        );

      case "checkbox":
        return (
          <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleCheckboxChange(field.id, e.target.checked)}
              required={field.required}
              className="h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">
              {field.placeholder || "Confirm or agree to proceed"}
            </span>
          </label>
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            min={field.minDate || undefined}
            max={field.maxDate || undefined}
            required={field.required}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        );

      case "time":
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            required={field.required}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        );

      case "datetime":
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            min={field.minDateTime || undefined}
            max={field.maxDateTime || undefined}
            required={field.required}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        );

      case "file":
        return (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <svg
              className="h-10 w-10 text-muted-foreground mb-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-sm font-medium text-foreground">
              Click to browse or drag and drop files
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              {field.accept ? `Accepted: ${field.accept}` : "Any file type allowed"}
              {field.maxSizeMB ? ` • Max ${field.maxSizeMB}MB` : ""}
              {field.maxFiles ? ` • Up to ${field.maxFiles} file(s)` : ""}
            </span>
          </div>
        );

      case "rating": {
        const maxStars = field.maxRating || 5;
        const ratingValue = typeof value === "number" ? value : 0;
        return (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxStars }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleChange(field.id, i + 1)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <svg
                  className={`h-7 w-7 transition-colors ${
                    i < ratingValue
                      ? "text-amber-400"
                      : "text-muted-foreground/30 hover:text-amber-200"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
            ))}
          </div>
        );
      }

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder || "Your answer"}
            required={field.required}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-background">
      <div className="w-full max-w-2xl flex flex-col space-y-8 self-start min-h-[550px] pb-24">
        {/* Form Header */}
        <div className="space-y-3 pt-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {title || "Untitled Form"}
          </h1>
          {description && (
            <p className="text-base text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {field.label || field.id}
                {field.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
              {renderField(field)}
            </div>
          ))}

          {/* Submit Button */}
          {fields.length > 0 && (
            <div className="pt-4">
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover shadow-xs transition-colors"
              >
                {settings?.submitButtonText || "Submit"}
              </button>
            </div>
          )}
        </form>

        {fields.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 px-6 text-center bg-card/50">
            <p className="text-sm text-muted-foreground">
              No fields to preview. Add some fields in the Customize tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
