"use client";

import { Icon } from "@/components/ui/Icon";

function getOptionLabel(field, value) { if (!field.options) return value; const opt = field.options.find((o) => o.value === value); return opt ? opt.label || value : value; }

function formatFieldValue(field, value) {
  if (value === null || value === undefined) return "\u2014";
  switch (field.type) {
    case "checkbox": return value ? "Yes" : "No";
    case "select": case "radio": return getOptionLabel(field, value);
    case "multiselect": return Array.isArray(value) ? (value.length === 0 ? "\u2014" : value.map((v) => getOptionLabel(field, v)).join(", ")) : String(value);
    case "rating": return `${value} / ${field.maxRating || 5}`;
    case "file":
      if (!Array.isArray(value) || value.length === 0) return "\u2014";
      return (
        <span className="flex flex-col gap-1">
          {value.map((file, i) => (
            <a key={file.key || i} href={file.url || "#"} target="_blank" rel="noopener noreferrer" onClick={!file.url ? (e) => e.preventDefault() : undefined} className="inline-flex items-center gap-1.5 rounded border border-border bg-muted/40 px-2 py-1 text-[12px] font-medium text-foreground hover:bg-muted transition-colors w-fit">
              <Icon name="fileText" size="xs" className="text-muted-foreground" aria-hidden="true" />
              <span className="max-w-[200px] truncate">{file.name || "file"}</span>
              <span className="text-muted-foreground/60 font-normal">({file.size ? `${(file.size / 1024).toFixed(1)}KB` : ""})</span>
            </a>
          ))}
        </span>
      );
    default: return String(value);
  }
}

export default function SubmissionDetail({ submission, fields, onBack, onDelete }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="arrowLeft" size="sm" strokeWidth={2} aria-hidden="true" />
          Back to responses
        </button>
        <button type="button" onClick={onDelete} className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] font-medium text-destructive hover:bg-red-50 hover:border-red-200 transition-colors">
          <Icon name="trash" size="xs" aria-hidden="true" />
          Delete
        </button>
      </div>

      <div className="rounded-lg border border-border bg-white p-5">
        <div className="mb-4 pb-3 border-b border-border">
          <p className="text-[12px] text-muted-foreground">{new Date(submission.createdAt).toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-mono">ID: {submission.id}</p>
        </div>
        <div className="space-y-4">
          {submission.response === null ? (
            <p className="text-[13px] text-muted-foreground italic">Unable to read this response.</p>
          ) : (
            fields.map((field) => {
              const value = submission.response[field.id];
              return (
                <div key={field.id}>
                  <dt className="text-[11px] font-medium text-muted-foreground mb-0.5">{field.label || field.id}</dt>
                  <dd className="text-[13px] text-foreground whitespace-pre-wrap break-words">{formatFieldValue(field, value)}</dd>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
