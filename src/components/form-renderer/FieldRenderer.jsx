"use client";

import { useRef, useState } from "react";
import { t as formT } from "@/lib/i18n/form-translations";
import { Icon } from "@/components/ui/Icon";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

function isAcceptFile(file, accept) {
  if (!accept) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const acceptList = accept.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (acceptList.length === 0) return true;
  return acceptList.some((a) => {
    if (a.startsWith(".")) return `.${ext}` === a;
    if (a.endsWith("/*")) {
      const prefix = a.slice(0, -1);
      return file.type.toLowerCase().startsWith(prefix);
    }
    return file.type.toLowerCase() === a;
  });
}

export function FileFieldInput({ field, value, onChange, locale, formId, disabled }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const files = Array.isArray(value) ? value : [];
  const maxFiles = field.maxFiles || 1;
  const maxSizeMB = field.maxSizeMB || 10;
  const atCapacity = files.length >= maxFiles;

  const handleFiles = async (list) => {
    if (!list || list.length === 0 || uploading) return;
    const incoming = Array.from(list);
    const remaining = Math.max(0, maxFiles - files.length);
    const toUpload = incoming.slice(0, remaining);

    if (toUpload.length === 0) {
      setUploadError(formT("field.maxFilesReached", locale, { count: maxFiles }));
      return;
    }

    for (const file of toUpload) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setUploadError(formT("field.tooLarge", locale, { name: file.name, max: maxSizeMB }));
        return;
      }
      if (!isAcceptFile(file, field.accept)) {
        setUploadError(formT("field.typeNotAllowed", locale, { name: file.name }));
        return;
      }
    }

    setUploadError(null);
    setUploading(true);
    const uploaded = [];
    try {
      for (const file of toUpload) {
        if (!formId) {
          uploaded.push({ name: file.name, size: file.size, type: file.type, url: null, key: null });
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        fd.append("maxSizeMB", String(maxSizeMB));
        fd.append("accept", field.accept || "");
        const res = await fetch(`/api/forms/${formId}/upload`, { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          setUploadError(data.error || formT("field.uploadFailed", locale, { name: file.name }));
          break;
        }
        uploaded.push(data.file);
      }
    } catch {
      setUploadError(formT("field.uploadFailed", locale, { name: toUpload[0]?.name || "" }));
    } finally {
      setUploading(false);
    }

    if (uploaded.length > 0) onChange([...files, ...uploaded]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = async (file, index) => {
    const next = files.filter((_, i) => i !== index);
    onChange(next);
    if (file.key && formId) {
      fetch(`/api/forms/${formId}/upload`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: file.key }),
      }).catch(() => {});
    }
  };

  return (
    <div>
      <input ref={inputRef} id={field.id} type="file" accept={field.accept || undefined} multiple={maxFiles > 1} disabled={disabled || atCapacity || uploading} onChange={(e) => handleFiles(e.target.files)} className="hidden" aria-label={field.label} />
      <label
        htmlFor={field.id}
        onDragOver={(e) => { e.preventDefault(); if (!disabled && !atCapacity) setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); if (!disabled && !atCapacity) handleFiles(e.dataTransfer.files); }}
        className={`flex flex-col items-center justify-center rounded-md border border-dashed p-6 text-center cursor-pointer transition-all ${dragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-muted/20"} ${disabled || atCapacity ? "cursor-not-allowed opacity-60" : "hover:bg-muted/40 hover:border-primary/40"}`}
      >
        {uploading ? (
          <Icon name="loader" size="2xl" className="text-primary animate-spin" aria-hidden="true" />
        ) : (
          <Icon name="upload" size="2xl" className="text-muted-foreground" aria-hidden="true" />
        )}
        <span className="text-[13px] font-medium text-foreground mt-2">
          {formT("field.dragAndDrop", locale)}
        </span>
        <span className="text-[12px] text-muted-foreground mt-0.5">{formT("field.or", locale)}</span>
        <span className="text-[12px] text-primary font-medium">{formT("field.clickToBrowse", locale)}</span>
        <span className="text-[12px] text-muted-foreground mt-1.5">
          {field.accept ? `Accepted: ${field.accept}` : formT("field.anyFileType", locale)}
          {` \u00b7 Max ${maxSizeMB}MB`}
          {maxFiles > 1 ? ` \u00b7 Up to ${maxFiles}` : ""}
        </span>
      </label>

      {uploadError && !uploading && (
        <p className="mt-1.5 text-[12px] text-destructive" role="alert">{uploadError}</p>
      )}

      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((file, index) => (
            <li key={file.key || `${file.name}-${index}`} className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2">
              <Icon name="fileText" size="sm" className="shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-foreground">{file.name}</p>
                <p className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              {file.url ? (
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 rounded border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors" aria-label={formT("field.viewFile", locale, { name: file.name })}>
                  <Icon name="externalLink" size="xs" aria-hidden="true" />
                  {formT("field.view", locale)}
                </a>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  <Icon name="checkCircle" size="xs" aria-hidden="true" />
                  {formT("field.queued", locale)}
                </span>
              )}
              {!disabled && (
                <button type="button" onClick={() => removeFile(file, index)} className="shrink-0 rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-destructive transition-colors" aria-label={formT("field.removeFile", locale, { name: file.name })}>
                  <Icon name="x" size="sm" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function FieldRenderer({ field, value, onChange, error, locale = "en-IN", formId = null, disabled = false }) {
  const fieldId = field.id;
  const labelId = `${fieldId}-label`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;
  const describedBy = [field.description ? descId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  const baseInputClasses = "w-full rounded-md border px-3 py-2 text-[13px] focus:outline-none focus:ring-1 transition-colors";
  const inputClasses = error
    ? `${baseInputClasses} focus:border-destructive`
    : `${baseInputClasses} focus:border-accent`;

  const themeInputStyle = {
    backgroundColor: "var(--form-input-bg, #ffffff)",
    color: "var(--form-text, #171717)",
    borderColor: error ? "var(--form-accent, #dc2626)" : "var(--form-input-border, #E5E7EB)",
  };

  const themeFocusRing = { "--tw-ring-color": "color-mix(in srgb, var(--form-accent, #7957FF) 20%, transparent)" };

  function renderField() {
    switch (field.type) {
      case "text":
        return <input id={fieldId} type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ""} required={field.required} minLength={field.minLength ?? undefined} maxLength={field.maxLength ?? undefined} className={inputClasses} style={{ ...themeInputStyle, ...themeFocusRing }} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "email":
        return <input id={fieldId} type="email" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || "name@example.com"} required={field.required} className={inputClasses} style={{ ...themeInputStyle, ...themeFocusRing }} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "number":
        return <input id={fieldId} type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || "0"} required={field.required} min={field.min ?? undefined} max={field.max ?? undefined} step={field.step ?? undefined} className={inputClasses} style={{ ...themeInputStyle, ...themeFocusRing }} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "textarea":
        return <textarea id={fieldId} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ""} required={field.required} rows={field.rows || 4} minLength={field.minLength ?? undefined} maxLength={field.maxLength ?? undefined} className={`${inputClasses} resize-none`} style={{ ...themeInputStyle, ...themeFocusRing }} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "select":
        return (
          <div className="relative">
            <select id={fieldId} value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} className={`${inputClasses} appearance-none pr-10`} style={{ ...themeInputStyle, ...themeFocusRing }} aria-describedby={describedBy} aria-invalid={!!error}>
              <option value="">{field.placeholder || formT("field.selectOption", locale)}</option>
              {(field.options || []).map((opt, i) => (<option key={i} value={opt.value}>{opt.label || opt.value}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground">
              <Icon name="chevronDown" size="sm" className="text-muted-foreground" aria-hidden="true" />
            </div>
          </div>
        );
      case "multiselect": {
        const selected = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1.5 rounded-md p-2.5 min-h-[38px]" style={{ border: "1px solid var(--form-input-border, #E5E7EB)", backgroundColor: "var(--form-input-bg, #ffffff)" }}>
              {selected.length > 0 ? selected.map((v) => {
                const opt = (field.options || []).find((o) => o.value === v);
                return (
                  <span key={v} className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[12px] font-medium" style={{ backgroundColor: "color-mix(in srgb, var(--form-accent, #7957FF) 12%, transparent)", color: "var(--form-accent, #7957FF)" }}>
                    {opt?.label || v}
                    <button type="button" onClick={() => onChange(selected.filter((s) => s !== v))} className="ml-0.5 rounded p-0.5" style={{ color: "var(--form-accent, #7957FF)" }} aria-label={`Remove ${opt?.label || v}`}>
                      <Icon name="x" size="xs" strokeWidth={2} aria-hidden="true" />
                    </button>
                  </span>
                );
              }) : <span className="text-[12px] py-0.5" style={{ color: "var(--form-muted-text, #6B7280)", opacity: 0.6 }}>{field.placeholder || formT("field.chooseOptions", locale)}</span>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(field.options || []).map((opt, i) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <label key={i} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium cursor-pointer transition-colors ${isSelected ? "" : "hover:opacity-80"}`} style={isSelected ? { border: "1px solid var(--form-accent, #7957FF)", backgroundColor: "color-mix(in srgb, var(--form-accent, #7957FF) 12%, transparent)", color: "var(--form-accent, #7957FF)" } : { border: "1px solid var(--form-input-border, #E5E7EB)", backgroundColor: "var(--form-input-bg, #ffffff)", color: "var(--form-text, #171717)" }}>
                    <input type="checkbox" checked={isSelected} onChange={() => { if (isSelected) { onChange(selected.filter((s) => s !== opt.value)); } else { onChange([...selected, opt.value]); } }} className="sr-only" />
                    {opt.label || opt.value}
                  </label>
                );
              })}
            </div>
            {field.maxSelections && <p className="text-[11px]" style={{ color: "var(--form-muted-text, #6B7280)" }}>{formT("field.maxSelections", locale, { count: field.maxSelections })}</p>}
          </div>
        );
      }
      case "radio":
        return (
          <div className="space-y-1.5" role="radiogroup" aria-labelledby={labelId}>
            {(field.options || []).map((opt, i) => (
              <label key={i} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] cursor-pointer transition-colors hover:opacity-80" style={{ border: "1px solid var(--form-input-border, #E5E7EB)", backgroundColor: "var(--form-input-bg, #ffffff)", color: "var(--form-text, #171717)" }}>
                <input type="radio" name={fieldId} value={opt.value} checked={value === opt.value} onChange={(e) => onChange(e.target.value)} required={field.required} className="h-3.5 w-3.5" style={{ accentColor: "var(--form-accent, #7957FF)" }} />
                <span>{opt.label || opt.value}</span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <label className="flex items-start gap-2.5 rounded-md px-3 py-2.5 text-[13px] cursor-pointer transition-colors hover:opacity-80" style={{ border: "1px solid var(--form-input-border, #E5E7EB)", backgroundColor: "var(--form-input-bg, #ffffff)", color: "var(--form-text, #171717)" }}>
            <input id={fieldId} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5 mt-0.5 rounded" style={{ accentColor: "var(--form-accent, #7957FF)" }} aria-describedby={describedBy} />
            <span style={{ color: "var(--form-muted-text, #6B7280)" }}>{field.placeholder || field.label}</span>
          </label>
        );
      case "date":
        return <input id={fieldId} type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} min={field.minDate || undefined} max={field.maxDate || undefined} className={inputClasses} style={{ ...themeInputStyle, ...themeFocusRing }} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "time":
        return <input id={fieldId} type="time" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} className={inputClasses} style={{ ...themeInputStyle, ...themeFocusRing }} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "datetime":
        return <input id={fieldId} type="datetime-local" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} min={field.minDateTime || undefined} max={field.maxDateTime || undefined} className={inputClasses} style={{ ...themeInputStyle, ...themeFocusRing }} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "phone":
        return <input id={fieldId} type="tel" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || "+1 (555) 000-0000"} required={field.required} className={inputClasses} style={{ ...themeInputStyle, ...themeFocusRing }} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "url":
        return <input id={fieldId} type="url" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || "https://"} required={field.required} className={inputClasses} style={{ ...themeInputStyle, ...themeFocusRing }} aria-describedby={describedBy} aria-invalid={!!error} />;
      case "rating": {
        const maxStars = field.maxRating || 5;
        const numericValue = typeof value === "number" ? value : 0;
        return (
          <div className="flex items-center gap-0.5" role="group" aria-labelledby={labelId}>
            {Array.from({ length: maxStars }).map((_, i) => (
              <button key={i} type="button" onClick={() => onChange(i + 1)} className="p-0.5 transition-colors" aria-label={`Rate ${i + 1} of ${maxStars}`}>
                <Icon key={i} name="star" size="lg" className={`${i < numericValue ? "text-warning" : "text-muted-foreground/30 hover:text-warning/50"} transition-colors`} fill="currentColor" aria-hidden="true" />
              </button>
            ))}
            <input type="hidden" value={numericValue} required={field.required} />
          </div>
        );
      }
      case "file":
        return (
          <FileFieldInput
            field={field}
            value={value}
            onChange={onChange}
            locale={locale}
            formId={formId}
            disabled={disabled}
          />
        );
      default:
        return <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-700">{formT("field.unsupported", locale, { type: field.type })}</div>;
    }
  }

  return (
    <div className="space-y-1">
      {field.type !== "checkbox" && (
        <label htmlFor={fieldId} id={labelId} className="block text-[13px] font-medium" style={{ color: "var(--form-text, #171717)" }}>
          {field.label}{field.required && <span className="ml-0.5" style={{ color: "var(--form-accent, #dc2626)" }} aria-hidden="true">*</span>}
        </label>
      )}
      {field.type === "checkbox" && field.label && (
        <span id={labelId} className="block text-[13px] font-medium" style={{ color: "var(--form-text, #171717)" }}>
          {field.label}{field.required && <span className="ml-0.5" style={{ color: "var(--form-accent, #dc2626)" }} aria-hidden="true">*</span>}
        </span>
      )}
      {field.description && <p id={descId} className="text-[12px]" style={{ color: "var(--form-muted-text, #6B7280)" }}>{field.description}</p>}
      {renderField()}
      {error && <p id={errorId} className="text-[12px]" style={{ color: "var(--form-accent, #dc2626)" }} role="alert">{error}</p>}
    </div>
  );
}
