"use client";

import { useState, useCallback, useRef } from "react";
import FieldCard from "./FieldCard";

export default function FormCanvas({
  title,
  description,
  fields,
  settings,
  selectedFieldId,
  onSelectField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onMoveField,
  onUpdateMeta,
  onOpenFieldPicker,
  showSubmitButton = true,
}) {
  const [draggedFieldId, setDraggedFieldId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragOverTimeoutRef = useRef(null);

  const handleDragStart = useCallback((e, fieldId) => {
    setDraggedFieldId(fieldId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", fieldId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedFieldId(null);
    setDragOverIndex(null);
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
      dragOverTimeoutRef.current = null;
    }
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  }, [dragOverIndex]);

  const handleDragLeave = useCallback((e, index) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      dragOverTimeoutRef.current = setTimeout(() => {
        setDragOverIndex(null);
      }, 100);
    }
  }, []);

  const handleDrop = useCallback((e, targetIndex) => {
    e.preventDefault();
    const droppedFieldId = e.dataTransfer.getData("text/plain");
    if (droppedFieldId && droppedFieldId !== draggedFieldId) {
      onMoveField(droppedFieldId, targetIndex);
    }
    setDraggedFieldId(null);
    setDragOverIndex(null);
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
      dragOverTimeoutRef.current = null;
    }
  }, [draggedFieldId, onMoveField]);

  return (
    <main
      aria-label="Form Canvas"
      className="flex-1 overflow-y-auto p-5 sm:p-8 flex justify-center bg-background"
      onClick={() => onSelectField(null)}
    >
      <div
        className="w-full max-w-2xl flex flex-col space-y-6 self-start min-h-[500px] pb-24"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2 pt-2">
          <input
            type="text"
            value={title || ""}
            onChange={(e) => onUpdateMeta("title", e.target.value)}
            placeholder="Untitled Form"
            aria-label="Form Title"
            className="w-full text-2xl sm:text-3xl font-semibold tracking-tight text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-foreground/20 focus:outline-none transition-colors py-1 placeholder:text-muted-foreground/40"
          />
          <textarea
            rows={2}
            value={description || ""}
            onChange={(e) => onUpdateMeta("description", e.target.value)}
            placeholder="Add a description or instructions for respondents..."
            aria-label="Form Description"
            className="w-full text-sm text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-foreground/20 focus:outline-none transition-colors py-1 resize-none placeholder:text-muted-foreground/40"
          />
        </div>

        {fields.length > 0 && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => onOpenFieldPicker(0)}
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-white transition-all"
            >
              <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add at top</span>
            </button>
          </div>
        )}

        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 px-6 text-center bg-white">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground mb-3">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="text-[15px] font-medium text-foreground">
              Start building your form
            </h3>
            <p className="text-[13px] text-muted-foreground mt-1 max-w-sm">
              Add your first question to begin crafting your form.
            </p>

            <button
              type="button"
              onClick={() => onOpenFieldPicker(0)}
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-white hover:bg-foreground/90 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add Field</span>
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2" onDragOver={(e) => handleDragOver(e, 0)} onDrop={(e) => handleDrop(e, 0)}>
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-1.5">
                  <FieldCard
                    field={field}
                    isSelected={field.id === selectedFieldId}
                    isDragging={draggedFieldId === field.id}
                    onSelect={() => onSelectField(field.id === selectedFieldId ? null : field.id)}
                    onUpdate={onUpdateField}
                    onDelete={() => onDeleteField(field.id)}
                    onDuplicate={() => onDuplicateField(field.id)}
                    onMoveUp={() => onMoveField(field.id, "up")}
                    onMoveDown={() => onMoveField(field.id, "down")}
                    isFirst={index === 0}
                    isLast={index === fields.length - 1}
                    onDragStart={(e) => handleDragStart(e, field.id)}
                    onDragEnd={handleDragEnd}
                  />

                  <div
                    className={`group/insert relative py-2 flex items-center justify-center ${dragOverIndex === index + 1 ? "bg-primary/5 border-t-2 border-primary" : ""}`}
                    onDragOver={(e) => handleDragOver(e, index + 1)}
                    onDragLeave={(e) => handleDragLeave(e, index + 1)}
                    onDrop={(e) => handleDrop(e, index + 1)}
                  >
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-transparent group-hover/insert:border-border transition-colors" />
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenFieldPicker(index + 1)}
                      className="relative opacity-0 group-hover/insert:opacity-100 focus:opacity-100 inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
                    >
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span>Insert</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`group/insert relative py-2 flex items-center justify-center ${dragOverIndex === fields.length ? "bg-primary/5 border-t-2 border-primary" : ""}`}
              onDragOver={(e) => handleDragOver(e, fields.length)}
              onDragLeave={(e) => handleDragLeave(e, fields.length)}
              onDrop={(e) => handleDrop(e, fields.length)}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-transparent group-hover/insert:border-border transition-colors" />
              </div>
              <button
                type="button"
                onClick={() => onOpenFieldPicker(fields.length)}
                className="relative opacity-0 group-hover/insert:opacity-100 focus:opacity-100 inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
              >
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Insert at end</span>
              </button>
            </div>
          </>
        )}

        {fields.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onOpenFieldPicker(fields.length)}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border hover:border-foreground/30 py-3.5 text-[13px] font-medium text-muted-foreground hover:text-foreground bg-white/50 hover:bg-white transition-all"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add Field</span>
            </button>
          </div>
        )}

        {showSubmitButton && fields.length > 0 && (
          <div className="pt-6 border-t border-border flex items-center justify-between">
            <button
              type="button"
              disabled
              className="rounded-md bg-foreground px-5 py-2 text-[13px] font-medium text-white opacity-90 cursor-not-allowed"
            >
              {settings?.submitButtonText || "Submit"}
            </button>
            <span className="text-[11px] text-muted-foreground italic">
              Form Preview
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
