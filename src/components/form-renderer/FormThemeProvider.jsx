"use client";

import { useMemo } from "react";
import { DEFAULT_FORM_THEME } from "@/lib/form-schema";

export default function FormThemeProvider({ theme, children }) {
  const resolved = useMemo(() => ({
    font: theme?.font || DEFAULT_FORM_THEME.font,
    background: theme?.background || DEFAULT_FORM_THEME.background,
    text: theme?.text || DEFAULT_FORM_THEME.text,
    buttonBackground: theme?.buttonBackground || DEFAULT_FORM_THEME.buttonBackground,
    buttonText: theme?.buttonText || DEFAULT_FORM_THEME.buttonText,
    accent: theme?.accent || DEFAULT_FORM_THEME.accent,
  }), [theme]);

  const style = useMemo(() => ({
    "--form-font": resolved.font,
    "--form-bg": resolved.background,
    "--form-text": resolved.text,
    "--form-btn-bg": resolved.buttonBackground,
    "--form-btn-text": resolved.buttonText,
    "--form-accent": resolved.accent,
    fontFamily: `var(--form-font), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    backgroundColor: "var(--form-bg)",
    color: "var(--form-text)",
  }), [resolved]);

  return (
    <div style={style} data-form-theme="true">
      {children}
    </div>
  );
}
