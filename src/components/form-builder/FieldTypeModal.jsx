"use client";

import { useState, useEffect, useMemo, useRef } from "react";

const FIELD_CATEGORIES = [
  {
    category: "Basic",
    items: [
      { type: "text", label: "Short Text", description: "Single-line text input", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg> },
      { type: "textarea", label: "Long Text", description: "Multi-line text area", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h10.5" /></svg> },
      { type: "email", label: "Email", description: "Email address input", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> },
      { type: "phone", label: "Phone", description: "Phone number input", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg> },
      { type: "number", label: "Number", description: "Numeric input", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h13.5m-13.5 7.5h13.5m-10.5-12l-3 16.5m10.5-16.5l-3 16.5" /></svg> },
    ],
  },
  {
    category: "Choice",
    items: [
      { type: "select", label: "Dropdown", description: "Single selection from dropdown", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /></svg> },
      { type: "multiselect", label: "Multi Select", description: "Select multiple options", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5H6A2.25 2.25 0 003.75 6.75v10.5A2.25 2.25 0 006 19.5h12z" /></svg> },
      { type: "radio", label: "Radio", description: "Single selection from options", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg> },
      { type: "checkbox", label: "Checkbox", description: "True/false toggle", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    ],
  },
  {
    category: "Date & Time",
    items: [
      { type: "date", label: "Date", description: "Date picker", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg> },
      { type: "time", label: "Time", description: "Time picker", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
      { type: "datetime", label: "Date & Time", description: "Date and time picker", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0zM6.75 3v2.25M17.25 3v2.25" /></svg> },
    ],
  },
  {
    category: "File & Media",
    items: [
      { type: "file", label: "File Upload", description: "Upload a file", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg> },
    ],
  },
  {
    category: "Advanced",
    items: [
      { type: "url", label: "URL", description: "Website URL input", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg> },
      { type: "rating", label: "Rating", description: "Star rating scale", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> },
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
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input ref={inputRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search fields..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20" />
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
                      className="group flex items-center gap-2.5 p-2.5 rounded-md border border-border/60 bg-white hover:bg-muted/40 hover:border-foreground/20 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</div>
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
