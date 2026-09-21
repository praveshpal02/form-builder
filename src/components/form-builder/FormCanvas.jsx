"use client";

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
  onOpenFieldPicker, // (insertIndex?: number) => void
}) {
  return (
    <main
      aria-label="Form Canvas"
      className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-background"
      onClick={() => onSelectField(null)}
    >
      <div
        className="w-full max-w-2xl flex flex-col space-y-8 self-start min-h-[550px] pb-24"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Form Header (Editable Title & Description) */}
        <div className="space-y-3 pt-4">
          <input
            type="text"
            value={title || ""}
            onChange={(e) => onUpdateMeta("title", e.target.value)}
            placeholder="Untitled Form"
            aria-label="Form Title"
            className="w-full text-3xl sm:text-4xl font-bold tracking-tight text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors py-1.5 placeholder:text-muted-foreground/30"
          />
          <textarea
            rows={2}
            value={description || ""}
            onChange={(e) => onUpdateMeta("description", e.target.value)}
            placeholder="Add a description or instructions for respondents..."
            aria-label="Form Description"
            className="w-full text-base text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors py-1 resize-none placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Top Add Field Button (when fields already exist) */}
        {fields.length > 0 && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => onOpenFieldPicker(0)}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/60 hover:bg-card transition-all"
            >
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add Field at Top</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 px-6 text-center bg-card/50 shadow-2xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Start building your form
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Add your first question to begin crafting your form.
            </p>

            <button
              type="button"
              onClick={() => onOpenFieldPicker(0)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover shadow-xs transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add Field</span>
            </button>
          </div>
        ) : (
          /* Fields List */
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <FieldCard
                  field={field}
                  isSelected={field.id === selectedFieldId}
                  onSelect={() => onSelectField(field.id === selectedFieldId ? null : field.id)}
                  onUpdate={onUpdateField}
                  onDelete={() => onDeleteField(field.id)}
                  onDuplicate={() => onDuplicateField(field.id)}
                  onMoveUp={() => onMoveField(field.id, "up")}
                  onMoveDown={() => onMoveField(field.id, "down")}
                  isFirst={index === 0}
                  isLast={index === fields.length - 1}
                />

                {/* Subtle insert button between fields on hover/focus */}
                <div className="group/insert relative py-1 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-transparent group-hover/insert:border-border transition-colors"></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenFieldPicker(index + 1)}
                    className="relative opacity-0 group-hover/insert:opacity-100 focus:opacity-100 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-xs"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Insert field</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Prominent Add Field Button */}
        {fields.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenFieldPicker(fields.length)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/80 hover:border-primary py-4 text-sm font-medium text-muted-foreground hover:text-primary bg-card/30 hover:bg-card transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add Field</span>
            </button>
          </div>
        )}

        {/* Submit Button Preview */}
        {fields.length > 0 && (
          <div className="pt-8 border-t border-border flex items-center justify-between">
            <button
              type="button"
              disabled
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white opacity-90 cursor-not-allowed shadow-xs"
            >
              {settings?.submitButtonText || "Submit"}
            </button>
            <span className="text-xs text-muted-foreground italic">
              Form Preview mode
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
