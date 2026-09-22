"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Icon } from "@/components/ui/Icon";

const FIELD_CATEGORIES = [
  {
    category: "Basic",
    items: [
      { type: "text", label: "Short Text", description: "Single-line text input", iconName: "type" },
      { type: "textarea", label: "Long Text", description: "Multi-line text area", iconName: "alignLeft" },
      { type: "email", label: "Email", description: "Email address input", iconName: "mail" },
      { type: "phone", label: "Phone", description: "Phone number input", iconName: "phone" },
      { type: "number", label: "Number", description: "Numeric input", iconName: "hash" },
    ],
  },
  {
    category: "Choice",
    items: [
      { type: "select", label: "Dropdown", description: "Single selection from dropdown", iconName: "chevronDown" },
      { type: "multiselect", label: "Multi Select", description: "Select multiple options", iconName: "list" },
      { type: "radio", label: "Radio", description: "Single selection from options", iconName: "radio" },
      { type: "checkbox", label: "Checkbox", description: "True/false toggle", iconName: "checkbox" },
    ],
  },
  {
    category: "Date & Time",
    items: [
      { type: "date", label: "Date", description: "Date picker", iconName: "calendar" },
      { type: "time", label: "Time", description: "Time picker", iconName: "clock" },
      { type: "datetime", label: "Date & Time", description: "Date and time picker", iconName: "calendar" },
    ],
  },
  {
    category: "File & Media",
    items: [
      { type: "file", label: "File Upload", description: "Upload a file", iconName: "upload" },
    ],
  },
  {
    category: "Advanced",
    items: [
      { type: "url", label: "URL", description: "Website URL input", iconName: "link" },
      { type: "rating", label: "Rating", description: "Star rating scale", iconName: "star" },
    ],
  },
  {
    category: "Content",
    items: [
      { type: "banner", label: "Banner Image", description: "Upload a banner image", iconName: "image" },
    ],
  },
];

export default function FieldTypeModal({ isOpen, onClose, onSelectType }) {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return FIELD_CATEGORIES;
    return FIELD_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md max-h-[80vh] bg-white rounded-lg border border-border shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">Add Field</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">Select a field type to add</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Icon name="x" size="md" aria-hidden="true" />
            </button>
          </div>
          <div className="relative">
            <Icon name="search" size="sm" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <input ref={inputRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search fields..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-[13px] text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {filteredCategories.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <p className="text-[13px] font-medium">No matching fields</p>
              <p className="text-[12px] mt-0.5">Try a different search term</p>
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">{cat.category}</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {cat.items.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => { onSelectType(item.type); onClose(); }}
                      className="group flex items-center gap-2.5 p-2.5 rounded-md border border-border/60 bg-white hover:bg-primary-soft/40 hover:border-primary/30 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary-soft text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon name={item.iconName} size="md" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-medium text-foreground group-hover:text-foreground transition-colors">{item.label}</div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
