"use client";

function getOptionLabel(field, value) {
  if (!field.options) return value;
  const opt = field.options.find((o) => o.value === value);
  return opt ? opt.label || value : value;
}

function formatFieldValue(field, value) {
  if (value === null || value === undefined) return "—";

  switch (field.type) {
    case "checkbox":
      return value ? "Yes" : "No";
    case "select":
    case "radio":
      return getOptionLabel(field, value);
    case "multiselect":
      if (Array.isArray(value)) {
        if (value.length === 0) return "—";
        return value.map((v) => getOptionLabel(field, v)).join(", ");
      }
      return String(value);
    case "rating": {
      const max = field.maxRating || 5;
      return `${value} / ${max}`;
    }
    case "file":
      return "File not stored";
    case "number":
      return String(value);
    case "url":
      return String(value);
    case "phone":
      return String(value);
    case "email":
      return String(value);
    case "date":
      return String(value);
    case "time":
      return String(value);
    case "datetime":
      return String(value);
    case "text":
    case "textarea":
    default:
      return String(value);
  }
}

export default function SubmissionDetail({ submission, fields, onBack, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to responses
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
          Delete
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 pb-4 border-b border-border">
          <p className="text-xs text-muted-foreground">
            Submitted {new Date(submission.createdAt).toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1 font-mono">
            ID: {submission.id}
          </p>
        </div>

        <div className="space-y-5">
          {submission.response === null ? (
            <p className="text-sm text-muted-foreground italic">
              Unable to read this response.
            </p>
          ) : (
            fields.map((field) => {
              const value = submission.response[field.id];
              return (
                <div key={field.id}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    {field.label || field.id}
                  </dt>
                  <dd className="text-sm text-foreground whitespace-pre-wrap break-words">
                    {formatFieldValue(field, value)}
                  </dd>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
