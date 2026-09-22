import { DEFAULT_FORM_THEME } from "@/lib/form-schema";

function resolveTheme(theme) {
  const t = theme || {};
  const d = DEFAULT_FORM_THEME;

  const cardBg = t.cardBackground || t.background || d.cardBackground;
  const pageBg = t.pageBackground || d.pageBackground;

  return {
    font: t.font || d.font,
    pageBackground: pageBg,
    cardBackground: cardBg,
    text: t.text || d.text,
    mutedText: t.mutedText || d.mutedText,
    inputBackground: t.inputBackground || d.inputBackground,
    inputBorder: t.inputBorder || d.inputBorder,
    buttonBackground: t.buttonBackground || d.buttonBackground,
    buttonText: t.buttonText || d.buttonText,
    accent: t.accent || d.accent,
  };
}

export default function FormThemeProvider({ theme, children }) {
  const resolved = resolveTheme(theme);

  const style = {
    "--form-font": resolved.font,
    "--form-page-bg": resolved.pageBackground,
    "--form-card-bg": resolved.cardBackground,
    "--form-text": resolved.text,
    "--form-muted-text": resolved.mutedText,
    "--form-input-bg": resolved.inputBackground,
    "--form-input-border": resolved.inputBorder,
    "--form-btn-bg": resolved.buttonBackground,
    "--form-btn-text": resolved.buttonText,
    "--form-accent": resolved.accent,
    fontFamily: `var(--form-font), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    backgroundColor: "var(--form-page-bg)",
    color: "var(--form-text)",
    minHeight: "100%",
  };

  return (
    <div style={style} data-form-theme="true">
      {children}
    </div>
  );
}
