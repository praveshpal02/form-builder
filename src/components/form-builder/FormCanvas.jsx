"use client";

import { useState, useCallback, useRef } from "react";
import FieldCard from "./FieldCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

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
  const draggedFieldIdRef = useRef(null);

  const handleDragStart = useCallback((e, fieldId) => {
    draggedFieldIdRef.current = fieldId;
    setDraggedFieldId(fieldId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", fieldId);
  }, []);

  const handleDragEnd = useCallback(() => {
    draggedFieldIdRef.current = null;
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

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (dragOverTimeoutRef.current) {
        clearTimeout(dragOverTimeoutRef.current);
      }
      dragOverTimeoutRef.current = setTimeout(() => {
        setDragOverIndex(null);
        dragOverTimeoutRef.current = null;
      }, 120);
    }
  }, []);

  const handleDrop = useCallback((e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFieldId = e.dataTransfer.getData("text/plain");
    const sourceId = draggedFieldIdRef.current;

    if (droppedFieldId && sourceId) {
      const sourceIndex = fields.findIndex((f) => f.id === droppedFieldId);
      if (sourceIndex !== -1) {
        const adjustedTarget = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
        onMoveField(droppedFieldId, adjustedTarget);
      }
    }

    draggedFieldIdRef.current = null;
    setDraggedFieldId(null);
    setDragOverIndex(null);
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
      dragOverTimeoutRef.current = null;
    }
  }, [fields, onMoveField]);

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
            className="w-full text-2xl sm:text-3xl font-semibold tracking-tight text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary/30 focus:outline-none transition-colors py-1 placeholder:text-muted-foreground/40"
          />
          <textarea
            rows={2}
            value={description || ""}
            onChange={(e) => onUpdateMeta("description", e.target.value)}
            placeholder="Add a description or instructions for respondents..."
            aria-label="Form Description"
            className="w-full text-sm text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary/30 focus:outline-none transition-colors py-1 resize-none placeholder:text-muted-foreground/40"
          />
        </div>

        {fields.length > 0 && (
          <div className="flex justify-start">
            <Button variant="outline" size="sm" onClick={() => onOpenFieldPicker(0)}>
              <Icon name="plus" size="sm" className="text-primary" aria-hidden="true" />
              <span>Add at top</span>
            </Button>
          </div>
        )}

        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 px-6 text-center bg-white">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground mb-3">
              <Icon name="plus" size="md" className="text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 className="text-base font-medium text-foreground">
              Start building your form
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Add your first question to begin crafting your form.
            </p>

            <Button onClick={() => onOpenFieldPicker(0)} size="md">
              <Icon name="plus" size="sm" strokeWidth={2.5} aria-hidden="true" />
              <span>Add Field</span>
            </Button>
          </div>
        ) : (
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
              </div>
            ))}
          </div>
        )}

        {fields.length > 0 && (
          <div className="pt-1">
            <Button variant="outline" fullWidth onClick={() => onOpenFieldPicker(fields.length)} className="rounded-lg border-dashed py-3.5">
              <Icon name="plus" size="sm" strokeWidth={2} aria-hidden="true" />
              <span>Add Field</span>
            </Button>
          </div>
        )}

        {showSubmitButton && fields.length > 0 && (
          <div className="pt-6 border-t border-border flex items-center justify-between">
            <Button variant="primary" disabled size="md">
              {settings?.submitButtonText || "Submit"}
            </Button>
            <span className="text-xs text-muted-foreground italic">
              Form Preview
            </span>
          </div>
        )}
      </div>
    </main>
  );
}