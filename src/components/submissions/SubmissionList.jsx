"use client";

import { useState } from "react";
import SubmissionDetail from "./SubmissionDetail";

function getFieldLabel(field) { return field.label || field.id; }
function getOptionLabel(field, value) { if (!field.options) return value; const opt = field.options.find((o) => o.value === value); return opt ? opt.label || value : value; }

function formatValue(field, value) {
  if (value === null || value === undefined) return "";
  switch (field.type) {
    case "checkbox": return value ? "Yes" : "No";
    case "select": case "radio": return getOptionLabel(field, value);
    case "multiselect": return Array.isArray(value) ? value.map((v) => getOptionLabel(field, v)).join(", ") : String(value);
    case "rating": return `${value} / ${field.maxRating || 5}`;
    case "file": return "File not stored";
    default: return String(value);
  }
}

function getSummary(fields, response) {
  if (!response) return "No data";
  for (const field of fields) { if (field.type === "email" && response[field.id]) return String(response[field.id]); }
  for (const field of fields) {
    const val = response[field.id];
    if (val !== null && val !== undefined && val !== "" && val !== false) {
      if (Array.isArray(val) && val.length === 0) continue;
      const str = formatValue(field, val);
      if (str) return str.length > 80 ? str.slice(0, 77) + "..." : str;
    }
  }
  return "No data";
}

export default function SubmissionList({ formId, submissions: initialSubmissions, fields, formTitle, formStatus }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [selectedId, setSelectedId] = useState(null);

  const handleDelete = async (submissionId) => {
    if (!window.confirm("Are you sure you want to delete this response?")) return;
    try {
      const res = await fetch(`/api/forms/${formId}/submissions/${submissionId}`, { method: "DELETE" });
      if (res.ok) { setSubmissions((prev) => prev.filter((s) => s.id !== submissionId)); if (selectedId === submissionId) setSelectedId(null); }
    } catch {}
  };

  const selectedSubmission = submissions.find((s) => s.id === selectedId);

  return (
    <div className="space-y-5">
      {selectedSubmission ? (
        <SubmissionDetail submission={selectedSubmission} fields={fields} onBack={() => setSelectedId(null)} onDelete={() => handleDelete(selectedSubmission.id)} />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{formTitle}</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground mr-2">{formStatus}</span>
                {submissions.length} {submissions.length === 1 ? "response" : "responses"}
              </p>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground mb-3">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51" />
                </svg>
              </div>
              <h3 className="text-[15px] font-medium text-foreground">No responses yet</h3>
              <p className="text-[13px] text-muted-foreground mt-1 text-center max-w-sm">Responses will appear here once people start submitting your form.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {submissions.map((sub) => (
                <div key={sub.id} className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3 hover:border-border/80 hover:shadow-sm transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{getSummary(fields, sub.response)}</p>
                    <p className="text-[12px] text-muted-foreground mt-0">{new Date(sub.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => setSelectedId(sub.id)} className="rounded-md border border-border bg-white px-2.5 py-1 text-[12px] font-medium text-foreground hover:bg-muted transition-colors">View</button>
                    <button type="button" onClick={() => handleDelete(sub.id)} className="rounded-md border border-border bg-white px-2.5 py-1 text-[12px] font-medium text-destructive hover:bg-red-50 hover:border-red-200 transition-colors">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
