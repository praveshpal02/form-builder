"use client";

import { t as formT } from "@/lib/i18n/form-translations";

export default function FieldRenderer({ field, value, onChange, error, locale = "en-IN" }) {
  const fieldId = field.id;
  const labelId = `${fieldId}-label`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;
  const describedBy = [field.description ? descId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  const baseInputClasses = "w-full rounded-md border bg-white px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-colors";
  const inputClasses = error ? `${baseInputClasses} border-destructive focus:border-destructive` : `${baseInputClasses} border-border focus:border-foreground/30`;

  function renderField() {
    switch (field.type) {
      case "text":
        return <input id={fieldId} type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ""} required={field.required} minLength={field.minLength ?? undefined} maxLength={field.maxLength ?? undefined} className={inputClasses} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "email":
        return <input id={fieldId} type="email" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || "name@example.com"} required={field.required} className={inputClasses} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "number":
        return <input id={fieldId} type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || "0"} required={field.required} min={field.min ?? undefined} max={field.max ?? undefined} step={field.step ?? undefined} className={inputClasses} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "textarea":
        return <textarea id={fieldId} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ""} required={field.required} rows={field.rows || 4} minLength={field.minLength ?? undefined} maxLength={field.maxLength ?? undefined} className={`${inputClasses} resize-none`} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "select":
        return (
          <div className="relative">
            <select id={fieldId} value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} className={`${inputClasses} appearance-none pr-10`} aria-describedby={describedBy} aria-invalid={!!error}>
              <option value="">{field.placeholder || formT("field.selectOption", locale)}</option>
              {(field.options || []).map((opt, i) => (<option key={i} value={opt.value}>{opt.label || opt.value}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </div>
          </div>
        );
      case "multiselect": {
        const selected = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1.5 rounded-md border border-border bg-white p-2.5 min-h-[38px]">
              {selected.length > 0 ? selected.map((v) => {
                const opt = (field.options || []).find((o) => o.value === v);
                return (
                  <span key={v} className="inline-flex items-center gap-1 rounded bg-foreground/5 px-2 py-0.5 text-[12px] font-medium text-foreground">
                    {opt?.label || v}
                    <button type="button" onClick={() => onChange(selected.filter((s) => s !== v))} className="ml-0.5 rounded hover:bg-foreground/10 p-0.5" aria-label={`Remove ${opt?.label || v}`}>
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                );
              }) : <span className="text-[12px] text-muted-foreground/60 py-0.5">{field.placeholder || formT("field.chooseOptions", locale)}</span>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(field.options || []).map((opt, i) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <label key={i} className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] font-medium cursor-pointer transition-colors ${isSelected ? "border-foreground bg-foreground/5 text-foreground" : "border-border bg-white text-foreground hover:bg-muted"}`}>
                    <input type="checkbox" checked={isSelected} onChange={() => { if (isSelected) { onChange(selected.filter((s) => s !== opt.value)); } else { onChange([...selected, opt.value]); } }} className="sr-only" />
                    {opt.label || opt.value}
                  </label>
                );
              })}
            </div>
            {field.maxSelections && <p className="text-[11px] text-muted-foreground">{formT("field.maxSelections", locale, { count: field.maxSelections })}</p>}
          </div>
        );
      }
      case "radio":
        return (
          <div className="space-y-1.5" role="radiogroup" aria-labelledby={labelId}>
            {(field.options || []).map((opt, i) => (
              <label key={i} className="flex items-center gap-2.5 rounded-md border border-border bg-white px-3 py-2 text-[13px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-foreground/30 has-[:checked]:bg-foreground/[0.02]">
                <input type="radio" name={fieldId} value={opt.value} checked={value === opt.value} onChange={(e) => onChange(e.target.value)} required={field.required} className="h-3.5 w-3.5 border-border text-foreground focus:ring-foreground/20" />
                <span>{opt.label || opt.value}</span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <label className="flex items-start gap-2.5 rounded-md border border-border bg-white px-3 py-2.5 text-[13px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-foreground/30 has-[:checked]:bg-foreground/[0.02]">
            <input id={fieldId} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5 mt-0.5 rounded border-border text-foreground focus:ring-foreground/20" aria-describedby={describedBy} />
            <span className="text-muted-foreground">{field.placeholder || field.label}</span>
          </label>
        );
      case "date":
        return <input id={fieldId} type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} min={field.minDate || undefined} max={field.maxDate || undefined} className={inputClasses} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "time":
        return <input id={fieldId} type="time" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} className={inputClasses} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "datetime":
        return <input id={fieldId} type="datetime-local" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} min={field.minDateTime || undefined} max={field.maxDateTime || undefined} className={inputClasses} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "phone":
        return <input id={fieldId} type="tel" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || "+1 (555) 000-0000"} required={field.required} className={inputClasses} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "url":
        return <input id={fieldId} type="url" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || "https://"} required={field.required} className={inputClasses} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "rating": {
        const maxStars = field.maxRating || 5;
        const numericValue = typeof value === "number" ? value : 0;
        return (
          <div className="flex items-center gap-0.5" role="group" aria-labelledby={labelId}>
            {Array.from({ length: maxStars }).map((_, i) => (
              <button key={i} type="button" onClick={() => onChange(i + 1)} className="p-0.5 transition-colors" aria-label={`Rate ${i + 1} of ${maxStars}`}>
                <svg className={`h-6 w-6 transition-colors ${i < numericValue ? "text-warning" : "text-muted-foreground/30 hover:text-warning/50"}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
            ))}
            <input type="hidden" value={numericValue} required={field.required} />
          </div>
        );
      }
      case "file":
        return (
          <div>
            <input id={fieldId} type="file" accept={field.accept || undefined} onChange={(e) => onChange(e.target.files)} className="hidden" aria-describedby={describedBy} />
            <label htmlFor={fieldId} className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 p-6 text-center cursor-pointer hover:bg-muted/40 transition-colors">
              <svg className="h-7 w-7 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-[13px] font-medium text-foreground">{formT("field.clickToBrowse", locale)}</span>
              <span className="text-[12px] text-muted-foreground mt-0.5">
                {field.accept ? `Accepted: ${field.accept}` : formT("field.anyFileType", locale)}{field.maxSizeMB ? ` \u00b7 Max ${field.maxSizeMB}MB` : ""}
              </span>
            </label>
          </div>
        );
      default:
        return <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-700">{formT("field.unsupported", locale, { type: field.type })}</div>;
    }
  }

  return (
    <div className="space-y-1">
      {field.type !== "checkbox" && (
        <label htmlFor={fieldId} id={labelId} className="block text-[13px] font-medium text-foreground">
          {field.label}{field.required && <span className="text-destructive ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      {field.type === "checkbox" && field.label && (
        <span id={labelId} className="block text-[13px] font-medium text-foreground">
          {field.label}{field.required && <span className="text-destructive ml-0.5" aria-hidden="true">*</span>}
        </span>
      )}
      {field.description && <p id={descId} className="text-[12px] text-muted-foreground">{field.description}</p>}
      {renderField()}
      {error && <p id={errorId} className="text-[12px] text-destructive" role="alert">{error}</p>}
    </div>
  );
}
