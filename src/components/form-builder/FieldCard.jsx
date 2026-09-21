"use client";

import { useState } from "react";
import { createOption } from "@/lib/form-schema";

export default function FieldCard({
  field,
  isSelected,
  isDragging = false,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onDragStart,
  onDragEnd,
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const effectiveSettingsOpen = isSelected && isSettingsOpen;

  const handleTextChange = (key, value) => {
    onUpdate(field.id, { [key]: value });
  };

  const handleNumberChange = (key, value) => {
    const parsed = value === "" ? null : Number(value);
    onUpdate(field.id, { [key]: isNaN(parsed) ? null : parsed });
  };

  const handleOptionChange = (index, key, value) => {
    const currentOptions = Array.isArray(field.options) ? [...field.options] : [];
    const updated = { ...currentOptions[index], [key]: value };
    if (key === "label" && (!currentOptions[index].value || currentOptions[index].value === currentOptions[index].label)) {
      updated.value = value.toLowerCase().replace(/\s+/g, "_");
    }
    currentOptions[index] = updated;
    onUpdate(field.id, { options: currentOptions });
  };

  const handleAddOption = () => {
    const currentOptions = Array.isArray(field.options) ? [...field.options] : [];
    const nextNum = currentOptions.length + 1;
    const newOpt = createOption(`option_${nextNum}`, `Option ${nextNum}`);
    onUpdate(field.id, { options: [...currentOptions, newOpt] });
  };

  const handleRemoveOption = (index) => {
    const currentOptions = Array.isArray(field.options) ? [...field.options] : [];
    currentOptions.splice(index, 1);
    onUpdate(field.id, { options: currentOptions });
  };

  const hasPlaceholder = [
    "text", "email", "number", "textarea", "checkbox", "select", "multiselect", "phone", "url",
  ].includes(field.type);

  const renderInputPreview = () => {
    switch (field.type) {
      case "text":
      case "phone":
      case "url":
        return (
          <input
            type="text"
            disabled
            placeholder={field.placeholder || (field.type === "url" ? "https://example.com" : field.type === "phone" ? "+1 (555) 000-0000" : "Your answer")}
            value={field.defaultValue || ""}
            readOnly
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/50 cursor-pointer focus:outline-none"
          />
        );
      case "email":
        return (
          <input type="email" disabled placeholder={field.placeholder || "name@example.com"} value={field.defaultValue || ""} readOnly
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/50 cursor-pointer focus:outline-none" />
        );
      case "number":
        return (
          <input type="number" disabled placeholder={field.placeholder || "0"} min={field.min ?? undefined} max={field.max ?? undefined} step={field.step ?? 1} value={field.defaultValue || ""} readOnly
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/50 cursor-pointer focus:outline-none" />
        );
      case "textarea":
        return (
          <textarea disabled rows={field.rows || 4} placeholder={field.placeholder || "Type your response here..."} value={field.defaultValue || ""} readOnly
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/50 cursor-pointer resize-none focus:outline-none" />
        );
      case "select":
        return (
          <div className="relative">
            <select disabled readOnly value={field.defaultValue || ""} className="w-full appearance-none rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground cursor-pointer focus:outline-none pr-8">
              <option value="">{field.placeholder || "Select an option..."}</option>
              {Array.isArray(field.options) && field.options.map((opt, idx) => (
                <option key={idx} value={opt.value}>{opt.label || opt.value || `Option ${idx + 1}`}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        );
      case "multiselect":
        return (
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-border bg-background min-h-[36px] items-center">
              {Array.isArray(field.options) && field.options.length > 0 ? (
                field.options.slice(0, 3).map((opt, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] text-foreground font-medium">
                    {opt.label || opt.value || `Option ${idx + 1}`}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-muted-foreground/60">{field.placeholder || "Choose options..."}</span>
              )}
              {Array.isArray(field.options) && field.options.length > 3 && (
                <span className="text-[11px] text-muted-foreground">+{field.options.length - 3} more</span>
              )}
            </div>
            {field.maxSelections && (
              <p className="text-[11px] text-muted-foreground">Max {field.maxSelections} selection(s)</p>
            )}
          </div>
        );
      case "radio":
        return (
          <div className="space-y-1.5 pt-0.5">
            {Array.isArray(field.options) && field.options.length > 0 ? (
              field.options.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
                  <input type="radio" name={`preview_${field.id}`} disabled checked={field.defaultValue === opt.value} readOnly className="h-3.5 w-3.5 border-border text-primary focus:ring-primary" />
                  <span>{opt.label || opt.value || `Option ${idx + 1}`}</span>
                </label>
              ))
            ) : (
              <div className="text-[11px] text-muted-foreground italic">No options configured yet.</div>
            )}
          </div>
        );
      case "checkbox":
        return (
          <label className="flex items-start gap-2 text-[13px] text-foreground cursor-pointer pt-0.5">
            <input type="checkbox" disabled checked={Boolean(field.defaultValue)} readOnly className="h-3.5 w-3.5 mt-0.5 rounded border-border text-primary focus:ring-primary" />
            <span className="text-muted-foreground">{field.placeholder || "Confirm or agree to proceed"}</span>
          </label>
        );
      case "date":
        return (
          <input type="date" disabled value={field.defaultValue || ""} min={field.minDate || undefined} max={field.maxDate || undefined} readOnly
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground cursor-pointer focus:outline-none" />
        );
      case "time":
        return (
          <input type="time" disabled value={field.defaultValue || ""} readOnly
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground cursor-pointer focus:outline-none" />
        );
      case "datetime":
        return (
          <input type="datetime-local" disabled value={field.defaultValue || ""} min={field.minDateTime || undefined} max={field.maxDateTime || undefined} readOnly
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground cursor-pointer focus:outline-none" />
        );
      case "file":
        return (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 p-5 text-center">
            <svg className="h-7 w-7 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-[12px] font-medium text-foreground">Click to browse or drag and drop</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              {field.accept ? `Accepted: ${field.accept}` : "Any file type"}
              {field.maxSizeMB ? ` \u00b7 Max ${field.maxSizeMB}MB` : ""}
              {field.maxFiles ? ` \u00b7 Up to ${field.maxFiles}` : ""}
            </span>
          </div>
        );
      case "rating":
        const maxStars = field.maxRating || 5;
        return (
          <div className="flex items-center gap-1 pt-0.5">
            {Array.from({ length: maxStars }).map((_, i) => (
              <svg key={i} className="h-5 w-5 text-muted-foreground/30 hover:text-warning cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
            <span className="text-[11px] text-muted-foreground ml-1">(1 to {maxStars})</span>
          </div>
        );
      default:
        return (
          <input type="text" disabled readOnly placeholder="Field input" className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground cursor-pointer" />
        );
    }
  };

  return (
    <div
      className={`group rounded-lg border transition-all duration-150 bg-white overflow-hidden ${
        isSelected
          ? "border-foreground/20 ring-1 ring-foreground/10 shadow-sm"
          : "border-border hover:border-border/80 hover:shadow-xs"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
        className={`p-4 cursor-pointer text-left focus:outline-none ${isDragging ? "opacity-50 bg-muted/30" : ""}`}
        style={isDragging ? { opacity: 0.5 } : undefined}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                draggable={true}
                onDragStart={(e) => onDragStart?.(e)}
                onDragEnd={onDragEnd}
                style={{ touchAction: "none" }}
                className="flex items-center justify-center w-6 h-6 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-ring"
                title="Drag to reorder"
                aria-label="Drag to reorder field"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5H19.5M4.5 15.75H19.5M4.5 5.25H19.5" />
                </svg>
              </button>
              <span className="font-medium text-[13px] text-foreground">
                {field.label || <span className="text-muted-foreground italic">Untitled question</span>}
              </span>
              {field.required && (
                <span className="text-destructive text-[13px]" title="Required">*</span>
              )}
              <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {field.type}
              </span>
            </div>
            {field.description && (
              <p className="text-[12px] text-muted-foreground mt-1 whitespace-pre-line">{field.description}</p>
            )}
          </div>

          <div
            className="flex items-center gap-0.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                if (!isSelected) { onSelect(); setIsSettingsOpen(true); } else { setIsSettingsOpen(!isSettingsOpen); }
              }}
              title={isSettingsOpen ? "Collapse" : "Settings"}
              className={`p-1 rounded text-[11px] transition-colors ${isSettingsOpen ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            </button>
            <button type="button" onClick={onMoveUp} disabled={isFirst} aria-label="Move up" title="Move up"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            </button>
            <button type="button" onClick={onMoveDown} disabled={isLast} aria-label="Move down" title="Move down"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <button type="button" onClick={onDuplicate} aria-label="Duplicate" title="Duplicate"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </button>
            <button type="button" onClick={onDelete} aria-label="Delete" title="Delete"
              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-2 pointer-events-none">
          {renderInputPreview()}
        </div>
      </div>

      {isSelected && (
        <div className="border-t border-border/60 bg-muted/20">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(!effectiveSettingsOpen); }}
            className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-expanded={effectiveSettingsOpen}
          >
            <div className="flex items-center gap-1.5">
              <svg className={`h-3.5 w-3.5 transition-transform duration-150 ${effectiveSettingsOpen ? "rotate-90 text-foreground" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="font-medium uppercase tracking-wider text-foreground">
                Configure {field.type} Field
              </span>
            </div>
            <span className="text-muted-foreground normal-case tracking-normal font-normal">
              {effectiveSettingsOpen ? "Collapse" : "Expand"}
            </span>
          </button>

          {effectiveSettingsOpen && (
            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border/40 animate-in fade-in slide-in-from-top-1 duration-150" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Field Configuration</span>
                <button type="button" onClick={() => setIsSettingsOpen(false)}
                  className="rounded bg-foreground/5 hover:bg-foreground/10 text-foreground px-2 py-1 text-[11px] font-medium transition-colors flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <span>Done</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Question Label</label>
                  <input type="text" value={field.label || ""} onChange={(e) => handleTextChange("label", e.target.value)} placeholder="Question label..."
                    className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Help Text</label>
                  <input type="text" value={field.description || ""} onChange={(e) => handleTextChange("description", e.target.value)} placeholder="Optional instructions..."
                    className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {hasPlaceholder && (
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      {field.type === "checkbox" ? "Checkbox Label" : "Placeholder"}
                    </label>
                    <input type="text" value={field.placeholder || ""} onChange={(e) => handleTextChange("placeholder", e.target.value)}
                      placeholder={field.type === "checkbox" ? "I agree to terms" : "Hint text..."}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20" />
                  </div>
                )}
                <div className="flex items-center justify-between rounded-md border border-border p-2.5 bg-white">
                  <div>
                    <span className="text-[13px] font-medium text-foreground block">Required</span>
                    <span className="text-[11px] text-muted-foreground block">Mandatory before submission</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={Boolean(field.required)} onChange={(e) => handleTextChange("required", e.target.checked)} className="sr-only peer" />
                    <div className="w-8 h-[18px] bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[14px] after:w-[14px] after:transition-all peer-checked:bg-foreground border border-border" />
                  </label>
                </div>
              </div>

              {(field.type === "text" || field.type === "textarea") && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Min Length</label>
                    <input type="number" min="0" value={field.minLength ?? ""} onChange={(e) => handleNumberChange("minLength", e.target.value)} placeholder="None"
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Length</label>
                    <input type="number" min="0" value={field.maxLength ?? ""} onChange={(e) => handleNumberChange("maxLength", e.target.value)} placeholder="None"
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                  </div>
                </div>
              )}

              {field.type === "textarea" && (
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Rows (Height)</label>
                  <input type="number" min="2" max="20" value={field.rows ?? 4} onChange={(e) => handleNumberChange("rows", e.target.value)}
                    className="w-full sm:w-36 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                </div>
              )}

              {field.type === "number" && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Min</label>
                    <input type="number" value={field.min ?? ""} onChange={(e) => handleNumberChange("min", e.target.value)} placeholder="None"
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max</label>
                    <input type="number" value={field.max ?? ""} onChange={(e) => handleNumberChange("max", e.target.value)} placeholder="None"
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Step</label>
                    <input type="number" value={field.step ?? 1} onChange={(e) => handleNumberChange("step", e.target.value)} placeholder="1"
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                  </div>
                </div>
              )}

              {field.type === "date" && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Min Date</label>
                    <input type="date" value={field.minDate ?? ""} onChange={(e) => handleTextChange("minDate", e.target.value || null)}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Date</label>
                    <input type="date" value={field.maxDate ?? ""} onChange={(e) => handleTextChange("maxDate", e.target.value || null)}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                  </div>
                </div>
              )}

              {field.type === "datetime" && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Min Date & Time</label>
                    <input type="datetime-local" value={field.minDateTime ?? ""} onChange={(e) => handleTextChange("minDateTime", e.target.value || null)}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Date & Time</label>
                    <input type="datetime-local" value={field.maxDateTime ?? ""} onChange={(e) => handleTextChange("maxDateTime", e.target.value || null)}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                  </div>
                </div>
              )}

              {field.type === "file" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/40">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Accepted Types</label>
                    <input type="text" value={field.accept || ""} onChange={(e) => handleTextChange("accept", e.target.value)} placeholder=".pdf, .png"
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Size (MB)</label>
                    <input type="number" min="1" max="100" value={field.maxSizeMB ?? 10} onChange={(e) => handleNumberChange("maxSizeMB", e.target.value)}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Files</label>
                    <input type="number" min="1" max="10" value={field.maxFiles ?? 1} onChange={(e) => handleNumberChange("maxFiles", e.target.value)}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                  </div>
                </div>
              )}

              {field.type === "rating" && (
                <div className="pt-2 border-t border-border/40">
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Stars</label>
                  <select value={field.maxRating || 5} onChange={(e) => handleNumberChange("maxRating", e.target.value)}
                    className="w-32 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none">
                    <option value={3}>3 Stars</option>
                    <option value={5}>5 Stars</option>
                    <option value={7}>7 Stars</option>
                    <option value={10}>10 Stars</option>
                  </select>
                </div>
              )}

              {field.type === "multiselect" && (
                <div className="pt-2 border-t border-border/40">
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Selections</label>
                  <input type="number" min="1" value={field.maxSelections ?? ""} onChange={(e) => handleNumberChange("maxSelections", e.target.value)} placeholder="No limit"
                    className="w-full sm:w-40 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none" />
                </div>
              )}

              {(field.type === "select" || field.type === "radio" || field.type === "multiselect") && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-muted-foreground">Choices / Options</label>
                    <button type="button" onClick={handleAddOption} className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5">
                      + Add Option
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {Array.isArray(field.options) && field.options.length > 0 ? (
                      field.options.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-md border border-border bg-white">
                          <div className="flex-1 space-y-1">
                            <input type="text" value={option.label} onChange={(e) => handleOptionChange(idx, "label", e.target.value)} placeholder={`Option ${idx + 1}`}
                              className="w-full rounded border border-border/60 px-2 py-1 text-[12px] text-foreground focus:border-foreground/30 focus:outline-none" />
                            <input type="text" value={option.value} onChange={(e) => handleOptionChange(idx, "value", e.target.value)} placeholder="Value"
                              className="w-full rounded border border-border/60 bg-muted/30 px-2 py-1 text-[10px] font-mono text-muted-foreground focus:border-foreground/30 focus:outline-none" />
                          </div>
                          <button type="button" onClick={() => handleRemoveOption(idx)} aria-label={`Remove option ${idx + 1}`}
                            className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-muted transition-colors">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-2.5 text-center border border-dashed border-border rounded-md text-[12px] text-muted-foreground bg-background">
                        No options yet. Click &quot;+ Add Option&quot; above.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {field.type === "checkbox" && (
                <div className="pt-2 border-t border-border/40">
                  <label className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
                    <input type="checkbox" checked={Boolean(field.defaultValue)} onChange={(e) => handleTextChange("defaultValue", e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary" />
                    <span className="text-[12px]">Checked by default</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-border/40">
                <button type="button" onClick={() => setIsSettingsOpen(false)}
                  className="rounded bg-foreground/5 hover:bg-foreground/10 text-foreground px-3 py-1.5 text-[11px] font-medium transition-colors flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <span>Collapse</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
