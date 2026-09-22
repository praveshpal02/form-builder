"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Input";
import { FORM_THEME_FONTS, DEFAULT_FORM_THEME } from "@/lib/form-schema";

function ColorField({ id, label, value, defaultValue, onChange }) {
  const resolved = value || defaultValue;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={resolved}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 rounded border border-border cursor-pointer shrink-0"
        />
        <input
          type="text"
          value={resolved}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 font-mono"
        />
      </div>
    </div>
  );
}

export default function ThemeDrawer({ isOpen, onClose, theme, onUpdateTheme }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const t = theme || DEFAULT_FORM_THEME;

  const update = (key, value) => {
    onUpdateTheme({ ...DEFAULT_FORM_THEME, ...t, [key]: value });
  };

  return (
    <div
      className={`fixed top-[3.5rem] right-0 z-40 h-[calc(100vh-3.5rem)] w-full sm:w-80 bg-white border-l border-border shadow-lg flex flex-col transition-transform duration-300 ease-in-out overflow-hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="palette" size="sm" className="text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">Customize Theme</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Icon name="x" size="md" aria-hidden="true" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5">
        <div>
          <label htmlFor="td-font" className="block text-xs font-medium text-muted-foreground mb-1">Font</label>
          <Select
            id="td-font"
            value={t.font}
            onChange={(e) => update("font", e.target.value)}
            options={FORM_THEME_FONTS}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Colors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ColorField id="td-page-bg" label="Page Background" value={t.pageBackground} defaultValue={DEFAULT_FORM_THEME.pageBackground} onChange={(v) => update("pageBackground", v)} />
            <ColorField id="td-card-bg" label="Card Background" value={t.cardBackground} defaultValue={DEFAULT_FORM_THEME.cardBackground} onChange={(v) => update("cardBackground", v)} />
            <ColorField id="td-text" label="Text" value={t.text} defaultValue={DEFAULT_FORM_THEME.text} onChange={(v) => update("text", v)} />
            <ColorField id="td-muted-text" label="Muted Text" value={t.mutedText} defaultValue={DEFAULT_FORM_THEME.mutedText} onChange={(v) => update("mutedText", v)} />
            <ColorField id="td-input-bg" label="Input Background" value={t.inputBackground} defaultValue={DEFAULT_FORM_THEME.inputBackground} onChange={(v) => update("inputBackground", v)} />
            <ColorField id="td-input-border" label="Input Border" value={t.inputBorder} defaultValue={DEFAULT_FORM_THEME.inputBorder} onChange={(v) => update("inputBorder", v)} />
            <ColorField id="td-btn-bg" label="Button Background" value={t.buttonBackground} defaultValue={DEFAULT_FORM_THEME.buttonBackground} onChange={(v) => update("buttonBackground", v)} />
            <ColorField id="td-btn-text" label="Button Text" value={t.buttonText} defaultValue={DEFAULT_FORM_THEME.buttonText} onChange={(v) => update("buttonText", v)} />
            <ColorField id="td-accent" label="Accent" value={t.accent} defaultValue={DEFAULT_FORM_THEME.accent} onChange={(v) => update("accent", v)} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onUpdateTheme({ ...DEFAULT_FORM_THEME })}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset to default theme
        </button>
      </div>

      <div className="shrink-0 flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/20">
        <button type="button" onClick={onClose} className="rounded-md bg-primary hover:bg-primary-hover px-4 py-1.5 text-sm font-medium text-white transition-colors">
          Done
        </button>
      </div>
    </div>
  );
}
