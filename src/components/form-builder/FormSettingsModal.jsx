"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { Toggle } from "@/components/ui/Toggle";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Input";
import { FORM_THEME_FONTS, DEFAULT_FORM_THEME } from "@/lib/form-schema";

function Section({ title, description, children }) {
  return (
    <div className="space-y-2.5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-0">{description}</p>}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children, htmlFor }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground cursor-pointer">{label}</label>
        {description && <p className="text-sm text-muted-foreground mt-0">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function FormSettingsModal({
  isOpen, onClose, title, description, fields, settings, onUpdateMeta, onUpdateSettings,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const s = settings || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-white rounded-lg border border-border shadow-xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "90vh" }}>
        <div className="flex items-start justify-between p-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">Form Settings</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Configure form behavior and notifications</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Icon name="x" size="md" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5 divide-y divide-border">
          <Section title="General" description="Basic form information">
            <div className="space-y-2.5 pt-0.5">
              <div>
                <label htmlFor="fs-title" className="block text-xs font-medium text-muted-foreground mb-1">Form Title</label>
                <input id="fs-title" type="text" value={title || ""} onChange={(e) => onUpdateMeta("title", e.target.value)} placeholder="e.g. Customer Survey"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
              <div>
                <label htmlFor="fs-desc" className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea id="fs-desc" rows={3} value={description || ""} onChange={(e) => onUpdateMeta("description", e.target.value)} placeholder="Brief description for respondents..."
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" />
              </div>
              <div>
                <label htmlFor="fs-locale" className="block text-xs font-medium text-muted-foreground mb-1">Language</label>
                <Select id="fs-locale" value={s.locale || "en-IN"} onChange={(e) => onUpdateSettings("locale", e.target.value)} options={[{ value: "en-IN", label: "English" }, { value: "hi-IN", label: "Hindi" }]}>
                </Select>
                <p className="text-xs text-muted-foreground mt-0.5">Language for system-generated text on the public form.</p>
              </div>
            </div>
          </Section>

          <Section title="Theme" description="Customize form appearance">
            <div className="space-y-3 pt-0.5">
              <div>
                <label htmlFor="fs-theme-font" className="block text-xs font-medium text-muted-foreground mb-1">Font</label>
                <Select
                  id="fs-theme-font"
                  value={s.theme?.font || DEFAULT_FORM_THEME.font}
                  onChange={(e) => onUpdateSettings("theme", { ...DEFAULT_FORM_THEME, ...s.theme, font: e.target.value })}
                  options={FORM_THEME_FONTS}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fs-theme-bg" className="block text-xs font-medium text-muted-foreground mb-1">Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="fs-theme-bg"
                      type="color"
                      value={s.theme?.background || DEFAULT_FORM_THEME.background}
                      onChange={(e) => onUpdateSettings("theme", { ...DEFAULT_FORM_THEME, ...s.theme, background: e.target.value })}
                      className="h-8 w-8 rounded border border-border cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={s.theme?.background || DEFAULT_FORM_THEME.background}
                      onChange={(e) => onUpdateSettings("theme", { ...DEFAULT_FORM_THEME, ...s.theme, background: e.target.value })}
                      className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="fs-theme-text" className="block text-xs font-medium text-muted-foreground mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="fs-theme-text"
                      type="color"
                      value={s.theme?.text || DEFAULT_FORM_THEME.text}
                      onChange={(e) => onUpdateSettings("theme", { ...DEFAULT_FORM_THEME, ...s.theme, text: e.target.value })}
                      className="h-8 w-8 rounded border border-border cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={s.theme?.text || DEFAULT_FORM_THEME.text}
                      onChange={(e) => onUpdateSettings("theme", { ...DEFAULT_FORM_THEME, ...s.theme, text: e.target.value })}
                      className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="fs-theme-btn-bg" className="block text-xs font-medium text-muted-foreground mb-1">Button Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="fs-theme-btn-bg"
                      type="color"
                      value={s.theme?.buttonBackground || DEFAULT_FORM_THEME.buttonBackground}
                      onChange={(e) => onUpdateSettings("theme", { ...DEFAULT_FORM_THEME, ...s.theme, buttonBackground: e.target.value })}
                      className="h-8 w-8 rounded border border-border cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={s.theme?.buttonBackground || DEFAULT_FORM_THEME.buttonBackground}
                      onChange={(e) => onUpdateSettings("theme", { ...DEFAULT_FORM_THEME, ...s.theme, buttonBackground: e.target.value })}
                      className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="fs-theme-btn-text" className="block text-xs font-medium text-muted-foreground mb-1">Button Text</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="fs-theme-btn-text"
                      type="color"
                      value={s.theme?.buttonText || DEFAULT_FORM_THEME.buttonText}
                      onChange={(e) => onUpdateSettings("theme", { ...DEFAULT_FORM_THEME, ...s.theme, buttonText: e.target.value })}
                      className="h-8 w-8 rounded border border-border cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={s.theme?.buttonText || DEFAULT_FORM_THEME.buttonText}
                      onChange={(e) => onUpdateSettings("theme", { ...DEFAULT_FORM_THEME, ...s.theme, buttonText: e.target.value })}
                      className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="fs-theme-accent" className="block text-xs font-medium text-muted-foreground mb-1">Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="fs-theme-accent"
                      type="color"
                      value={s.theme?.accent || DEFAULT_FORM_THEME.accent}
                      onChange={(e) => onUpdateSettings("theme", { ...DEFAULT_FORM_THEME, ...s.theme, accent: e.target.value })}
                      className="h-8 w-8 rounded border border-border cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={s.theme?.accent || DEFAULT_FORM_THEME.accent}
                      onChange={(e) => onUpdateSettings("theme", { ...DEFAULT_FORM_THEME, ...s.theme, accent: e.target.value })}
                      className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 font-mono"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings("theme", { ...DEFAULT_FORM_THEME })}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset to default theme
              </button>
            </div>
          </Section>

          <Section title="Submission" description="What happens after submission">
            <div className="space-y-2.5 pt-0.5">
              <div>
                <label htmlFor="fs-submit-label" className="block text-xs font-medium text-muted-foreground mb-1">Submit Button Label</label>
                <input id="fs-submit-label" type="text" value={s.submitButtonText || ""} onChange={(e) => onUpdateSettings("submitButtonText", e.target.value)} placeholder="Submit"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
              <SettingRow htmlFor="fs-redirect-toggle" label="Redirect After Submit" description="Send respondents to a custom URL">
                <Toggle id="fs-redirect-toggle" checked={Boolean(s.redirectOnSubmit)} onChange={(v) => onUpdateSettings("redirectOnSubmit", v)} />
              </SettingRow>
              {s.redirectOnSubmit && (
                <div>
                  <label htmlFor="fs-redirect-url" className="block text-xs font-medium text-muted-foreground mb-1">Redirect URL</label>
                  <input id="fs-redirect-url" type="url" value={s.redirectUrl || ""} onChange={(e) => onUpdateSettings("redirectUrl", e.target.value)} placeholder="https://example.com/thank-you"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
              )}
              {!s.redirectOnSubmit && (
                <div>
                  <label htmlFor="fs-success-msg" className="block text-xs font-medium text-muted-foreground mb-1">Success Message</label>
                  <textarea id="fs-success-msg" rows={3} value={s.successMessage || ""} onChange={(e) => onUpdateSettings("successMessage", e.target.value)} placeholder="Thank you for your response."
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" />
                  <p className="text-xs text-muted-foreground mt-0.5">Leave blank for default message</p>
                </div>
              )}
            </div>
          </Section>

          <Section title="Behavior" description="Control form behavior">
            <div className="pt-0.5">
              <SettingRow htmlFor="fs-multiple-submissions" label="Allow Multiple Submissions" description="Let users submit more than once">
                <Toggle id="fs-multiple-submissions" checked={s.allowMultipleSubmissions !== false} onChange={(v) => onUpdateSettings("allowMultipleSubmissions", v)} />
              </SettingRow>
              <SettingRow htmlFor="fs-shuffle" label="Shuffle Fields" description="Randomize field order">
                <Toggle id="fs-shuffle" checked={Boolean(s.shuffleFields)} onChange={(v) => onUpdateSettings("shuffleFields", v)} />
              </SettingRow>
              <SettingRow htmlFor="fs-progress" label="Show Progress Bar" description="Display a progress indicator">
                <Toggle id="fs-progress" checked={Boolean(s.showProgressBar)} onChange={(v) => onUpdateSettings("showProgressBar", v)} />
              </SettingRow>
            </div>
          </Section>

          <Section title="Closing Conditions" description="Stop accepting responses">
            <div className="pt-0.5 space-y-0">
              <SettingRow htmlFor="fs-close-date-toggle" label="Close on Date" description="Automatically close at a specific date">
                <Toggle id="fs-close-date-toggle" checked={Boolean(s.closeFormOnDate)} onChange={(v) => onUpdateSettings("closeFormOnDate", v)} />
              </SettingRow>
              {s.closeFormOnDate && (
                <div className="pb-2 border-b border-border/50">
                  <label htmlFor="fs-close-date" className="block text-xs font-medium text-muted-foreground mb-1">Closing Date & Time</label>
                  <input id="fs-close-date" type="datetime-local" value={s.closeFormDate || ""} onChange={(e) => onUpdateSettings("closeFormDate", e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
              )}
              <SettingRow htmlFor="fs-close-limit-toggle" label="Close on Response Limit" description="Stop after reaching a limit">
                <Toggle id="fs-close-limit-toggle" checked={Boolean(s.closeFormOnLimit)} onChange={(v) => onUpdateSettings("closeFormOnLimit", v)} />
              </SettingRow>
              {s.closeFormOnLimit && (
                <div className="pb-2 border-b border-border/50">
                  <label htmlFor="fs-response-limit" className="block text-xs font-medium text-muted-foreground mb-1">Maximum Responses</label>
                  <input id="fs-response-limit" type="number" min="1" value={s.responseLimit ?? ""} onChange={(e) => { const val = e.target.value === "" ? null : Number(e.target.value); onUpdateSettings("responseLimit", val); }} placeholder="e.g. 100"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
              )}
              {(s.closeFormOnDate || s.closeFormOnLimit) && (
                <div className="pt-1">
                  <label htmlFor="fs-closed-msg" className="block text-xs font-medium text-muted-foreground mb-1">Closed Form Message</label>
                  <textarea id="fs-closed-msg" rows={2} value={s.closedFormMessage || ""} onChange={(e) => onUpdateSettings("closedFormMessage", e.target.value)} placeholder="This form is no longer accepting responses."
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" />
                  <p className="text-xs text-muted-foreground mt-0.5">Shown when the form is closed</p>
                </div>
              )}
            </div>
          </Section>

          <Section title="Email Notifications" description="Confirmation emails to respondents">
            <div className="pt-0.5 space-y-2.5">
              <SettingRow htmlFor="fs-rc-toggle" label="Respondent Confirmation" description="Send a confirmation email">
                <Toggle id="fs-rc-toggle" checked={Boolean(s.respondentConfirmation?.enabled)} onChange={(v) => { const rc = s.respondentConfirmation || {}; onUpdateSettings("respondentConfirmation", { ...rc, enabled: v }); }} />
              </SettingRow>
              {s.respondentConfirmation?.enabled && (
                <>
                  <div>
                    <label htmlFor="fs-rc-email-field" className="block text-xs font-medium text-muted-foreground mb-1">Email Field</label>
                    <Select
                      id="fs-rc-email-field"
                      value={s.respondentConfirmation?.emailFieldId || ""}
                      onChange={(e) => { const rc = s.respondentConfirmation || {}; onUpdateSettings("respondentConfirmation", { ...rc, emailFieldId: e.target.value || null }); }}
                      options={[{ value: "", label: "Select an email field..." }, ...(fields || []).filter((f) => f.type === "email").map((f) => ({ value: f.id, label: f.label || f.id }))]}
                    />
                  </div>
                  <div>
                    <label htmlFor="fs-rc-subject" className="block text-xs font-medium text-muted-foreground mb-1">Subject</label>
                    <input id="fs-rc-subject" type="text" value={s.respondentConfirmation?.subject || ""} onChange={(e) => { const rc = s.respondentConfirmation || {}; onUpdateSettings("respondentConfirmation", { ...rc, subject: e.target.value }); }} placeholder="We received your response"
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label htmlFor="fs-rc-message" className="block text-xs font-medium text-muted-foreground mb-1">Message</label>
                    <textarea id="fs-rc-message" rows={3} value={s.respondentConfirmation?.message || ""} onChange={(e) => { const rc = s.respondentConfirmation || {}; onUpdateSettings("respondentConfirmation", { ...rc, message: e.target.value }); }} placeholder="Thank you for your submission."
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" />
                  </div>
                </>
              )}
            </div>
          </Section>
        </div>

        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">All settings are auto-saved</p>
          <button type="button" onClick={onClose} className="rounded-md bg-primary hover:bg-primary-hover px-4 py-1.5 text-sm font-medium text-white transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}