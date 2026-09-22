"use client";

import { useState } from "react";
import { createOption } from "@/lib/form-schema";
import { Icon } from "@/components/ui/Icon";
import { FileFieldInput } from "@/components/form-renderer/FieldRenderer";

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
  formId = null,
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);

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
              <Icon name="chevronDown" size="sm" className="text-muted-foreground" aria-hidden="true" />
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
                  <input type="radio" name={`preview_${field.id}`} disabled checked={field.defaultValue === opt.value} readOnly className="h-3.5 w-3.5 border-border text-primary focus:ring-primary/30" />
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
            <input type="checkbox" disabled checked={Boolean(field.defaultValue)} readOnly className="h-3.5 w-3.5 mt-0.5 rounded border-border text-primary focus:ring-primary/30" />
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
          <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
            <FileFieldInput
              field={field}
              value={previewFiles}
              onChange={setPreviewFiles}
              locale="en-IN"
              formId={formId}
            />
          </div>
        );
      case "rating":
        const maxStars = field.maxRating || 5;
        return (
          <div className="flex items-center gap-1 pt-0.5">
            {Array.from({ length: maxStars }).map((_, i) => (
              <Icon key={i} name="star" size="lg" className="text-muted-foreground/30 hover:text-warning cursor-pointer transition-colors" fill="currentColor" aria-hidden="true" />
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
          ? "border-primary/40 ring-1 ring-primary/20 shadow-sm"
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
                onPointerDown={(e) => e.stopPropagation()}
                draggable={true}
                onDragStart={(e) => onDragStart?.(e)}
                onDragEnd={onDragEnd}
                style={{ touchAction: "none" }}
                className="flex items-center justify-center w-6 h-6 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-ring"
                title="Drag to reorder"
                aria-label="Drag to reorder field"
              >
                <Icon name="gripVertical" size="sm" className="text-muted-foreground" aria-hidden="true" />
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
              className={`p-1 rounded text-[11px] transition-colors ${isSettingsOpen ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-primary hover:bg-muted"}`}
            >
              <Icon name="settings" size="sm" aria-hidden="true" />
            </button>
            <button type="button" onClick={onMoveUp} disabled={isFirst} aria-label="Move up" title="Move up"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors">
              <Icon name="chevronUp" size="sm" aria-hidden="true" />
            </button>
            <button type="button" onClick={onMoveDown} disabled={isLast} aria-label="Move down" title="Move down"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors">
              <Icon name="chevronDown" size="sm" aria-hidden="true" />
            </button>
            <button type="button" onClick={onDuplicate} aria-label="Duplicate" title="Duplicate"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Icon name="copyPlus" size="sm" aria-hidden="true" />
            </button>
            <button type="button" onClick={onDelete} aria-label="Delete" title="Delete"
              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors">
              <Icon name="trash" size="sm" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className={`mt-2 ${field.type === "file" ? "" : "pointer-events-none"}`}>
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
              <Icon name="chevronRight" size="sm" className={`${effectiveSettingsOpen ? "rotate-90 text-foreground" : ""}`} aria-hidden="true" />
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
                  className="rounded bg-primary-soft hover:bg-primary-border text-primary px-2 py-1 text-[11px] font-medium transition-colors flex items-center gap-1">
                  <Icon name="chevronUp" size="xs" aria-hidden="true" />
                  <span>Done</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Question Label</label>
                  <input type="text" value={field.label || ""} onChange={(e) => handleTextChange("label", e.target.value)} placeholder="Question label..."
                    className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Help Text</label>
                  <input type="text" value={field.description || ""} onChange={(e) => handleTextChange("description", e.target.value)} placeholder="Optional instructions..."
                    className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30" />
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
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                )}
                <div className="flex items-center justify-between rounded-md border border-border p-2.5 bg-white">
                  <div>
                    <span className="text-[13px] font-medium text-foreground block">Required</span>
                    <span className="text-[11px] text-muted-foreground block">Mandatory before submission</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={Boolean(field.required)} onChange={(e) => handleTextChange("required", e.target.checked)} className="sr-only peer" />
                    <div className="w-8 h-[18px] bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-[14px] after:w-[14px] after:transition-all peer-checked:bg-primary border border-border" />
                  </label>
                </div>
              </div>

              {(field.type === "text" || field.type === "textarea") && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Min Length</label>
                    <input type="number" min="0" value={field.minLength ?? ""} onChange={(e) => handleNumberChange("minLength", e.target.value)} placeholder="None"
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Length</label>
                    <input type="number" min="0" value={field.maxLength ?? ""} onChange={(e) => handleNumberChange("maxLength", e.target.value)} placeholder="None"
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                  </div>
                </div>
              )}

              {field.type === "textarea" && (
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Rows (Height)</label>
                  <input type="number" min="2" max="20" value={field.rows ?? 4} onChange={(e) => handleNumberChange("rows", e.target.value)}
                    className="w-full sm:w-36 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                </div>
              )}

              {field.type === "number" && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Min</label>
                    <input type="number" value={field.min ?? ""} onChange={(e) => handleNumberChange("min", e.target.value)} placeholder="None"
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max</label>
                    <input type="number" value={field.max ?? ""} onChange={(e) => handleNumberChange("max", e.target.value)} placeholder="None"
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Step</label>
                    <input type="number" value={field.step ?? 1} onChange={(e) => handleNumberChange("step", e.target.value)} placeholder="1"
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                  </div>
                </div>
              )}

              {field.type === "date" && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Min Date</label>
                    <input type="date" value={field.minDate ?? ""} onChange={(e) => handleTextChange("minDate", e.target.value || null)}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Date</label>
                    <input type="date" value={field.maxDate ?? ""} onChange={(e) => handleTextChange("maxDate", e.target.value || null)}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                  </div>
                </div>
              )}

              {field.type === "datetime" && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Min Date & Time</label>
                    <input type="datetime-local" value={field.minDateTime ?? ""} onChange={(e) => handleTextChange("minDateTime", e.target.value || null)}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Date & Time</label>
                    <input type="datetime-local" value={field.maxDateTime ?? ""} onChange={(e) => handleTextChange("maxDateTime", e.target.value || null)}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                  </div>
                </div>
              )}

              {field.type === "file" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/40">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Accepted Types</label>
                    <input type="text" value={field.accept || ""} onChange={(e) => handleTextChange("accept", e.target.value)} placeholder=".pdf, .png"
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Size (MB)</label>
                    <input type="number" min="1" max="100" value={field.maxSizeMB ?? 10} onChange={(e) => handleNumberChange("maxSizeMB", e.target.value)}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Files</label>
                    <input type="number" min="1" max="10" value={field.maxFiles ?? 1} onChange={(e) => handleNumberChange("maxFiles", e.target.value)}
                      className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
                  </div>
                </div>
              )}

              {field.type === "rating" && (
                <div className="pt-2 border-t border-border/40">
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Max Stars</label>
                  <select value={field.maxRating || 5} onChange={(e) => handleNumberChange("maxRating", e.target.value)}
                    className="w-32 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none">
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
                    className="w-full sm:w-40 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none" />
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
                              className="w-full rounded border border-border/60 px-2 py-1 text-[12px] text-foreground focus:border-primary/40 focus:outline-none" />
                            <input type="text" value={option.value} onChange={(e) => handleOptionChange(idx, "value", e.target.value)} placeholder="Value"
                              className="w-full rounded border border-border/60 bg-muted/30 px-2 py-1 text-[10px] font-mono text-muted-foreground focus:border-primary/40 focus:outline-none" />
                          </div>
                          <button type="button" onClick={() => handleRemoveOption(idx)} aria-label={`Remove option ${idx + 1}`}
                            className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-muted transition-colors">
                            <Icon name="x" size="sm" strokeWidth={2} aria-hidden="true" />
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
                      className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/30" />
                    <span className="text-[12px]">Checked by default</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-border/40">
                <button type="button" onClick={() => setIsSettingsOpen(false)}
                  className="rounded bg-primary-soft hover:bg-primary-border text-primary px-3 py-1.5 text-[11px] font-medium transition-colors flex items-center gap-1">
                  <Icon name="chevronUp" size="xs" aria-hidden="true" />
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
