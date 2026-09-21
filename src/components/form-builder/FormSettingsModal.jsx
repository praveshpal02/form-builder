"use client";

import { useEffect } from "react";

function Toggle({ checked, onChange, id }) {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-8 h-[18px] bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[14px] after:w-[14px] after:transition-all peer-checked:bg-foreground border border-border" />
    </label>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="space-y-2.5">
      <div>
        <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
        {description && <p className="text-[12px] text-muted-foreground mt-0">{description}</p>}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children, htmlFor }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <label htmlFor={htmlFor} className="block text-[13px] font-medium text-foreground cursor-pointer">{label}</label>
        {description && <p className="text-[12px] text-muted-foreground mt-0">{description}</p>}
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
            <h2 className="text-[15px] font-semibold text-foreground">Form Settings</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Configure form behavior and notifications</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5 divide-y divide-border">
          <Section title="General" description="Basic form information">
            <div className="space-y-2.5 pt-0.5">
              <div>
                <label htmlFor="fs-title" className="block text-[11px] font-medium text-muted-foreground mb-1">Form Title</label>
                <input id="fs-title" type="text" value={title || ""} onChange={(e) => onUpdateMeta("title", e.target.value)} placeholder="e.g. Customer Survey"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20" />
              </div>
              <div>
                <label htmlFor="fs-desc" className="block text-[11px] font-medium text-muted-foreground mb-1">Description</label>
                <textarea id="fs-desc" rows={3} value={description || ""} onChange={(e) => onUpdateMeta("description", e.target.value)} placeholder="Brief description for respondents..."
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none" />
              </div>
              <div>
                <label htmlFor="fs-locale" className="block text-[11px] font-medium text-muted-foreground mb-1">Language</label>
                <select id="fs-locale" value={s.locale || "en-IN"} onChange={(e) => onUpdateSettings("locale", e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20">
                  <option value="en-IN">English</option>
                  <option value="hi-IN">Hindi</option>
                </select>
                <p className="text-[11px] text-muted-foreground mt-0.5">Language for system-generated text on the public form.</p>
              </div>
            </div>
          </Section>

          <Section title="Submission" description="What happens after submission">
            <div className="space-y-2.5 pt-0.5">
              <div>
                <label htmlFor="fs-submit-label" className="block text-[11px] font-medium text-muted-foreground mb-1">Submit Button Label</label>
                <input id="fs-submit-label" type="text" value={s.submitButtonText || ""} onChange={(e) => onUpdateSettings("submitButtonText", e.target.value)} placeholder="Submit"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20" />
              </div>
              <SettingRow htmlFor="fs-redirect-toggle" label="Redirect After Submit" description="Send respondents to a custom URL">
                <Toggle id="fs-redirect-toggle" checked={Boolean(s.redirectOnSubmit)} onChange={(v) => onUpdateSettings("redirectOnSubmit", v)} />
              </SettingRow>
              {s.redirectOnSubmit && (
                <div>
                  <label htmlFor="fs-redirect-url" className="block text-[11px] font-medium text-muted-foreground mb-1">Redirect URL</label>
                  <input id="fs-redirect-url" type="url" value={s.redirectUrl || ""} onChange={(e) => onUpdateSettings("redirectUrl", e.target.value)} placeholder="https://example.com/thank-you"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20" />
                </div>
              )}
              {!s.redirectOnSubmit && (
                <div>
                  <label htmlFor="fs-success-msg" className="block text-[11px] font-medium text-muted-foreground mb-1">Success Message</label>
                  <textarea id="fs-success-msg" rows={3} value={s.successMessage || ""} onChange={(e) => onUpdateSettings("successMessage", e.target.value)} placeholder="Thank you for your response."
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none" />
                  <p className="text-[11px] text-muted-foreground mt-0.5">Leave blank for default message</p>
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
                  <label htmlFor="fs-close-date" className="block text-[11px] font-medium text-muted-foreground mb-1">Closing Date & Time</label>
                  <input id="fs-close-date" type="datetime-local" value={s.closeFormDate || ""} onChange={(e) => onUpdateSettings("closeFormDate", e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20" />
                </div>
              )}
              <SettingRow htmlFor="fs-close-limit-toggle" label="Close on Response Limit" description="Stop after reaching a limit">
                <Toggle id="fs-close-limit-toggle" checked={Boolean(s.closeFormOnLimit)} onChange={(v) => onUpdateSettings("closeFormOnLimit", v)} />
              </SettingRow>
              {s.closeFormOnLimit && (
                <div className="pb-2 border-b border-border/50">
                  <label htmlFor="fs-response-limit" className="block text-[11px] font-medium text-muted-foreground mb-1">Maximum Responses</label>
                  <input id="fs-response-limit" type="number" min="1" value={s.responseLimit ?? ""} onChange={(e) => { const val = e.target.value === "" ? null : Number(e.target.value); onUpdateSettings("responseLimit", val); }} placeholder="e.g. 100"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20" />
                </div>
              )}
              {(s.closeFormOnDate || s.closeFormOnLimit) && (
                <div className="pt-1">
                  <label htmlFor="fs-closed-msg" className="block text-[11px] font-medium text-muted-foreground mb-1">Closed Form Message</label>
                  <textarea id="fs-closed-msg" rows={2} value={s.closedFormMessage || ""} onChange={(e) => onUpdateSettings("closedFormMessage", e.target.value)} placeholder="This form is no longer accepting responses."
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none" />
                  <p className="text-[11px] text-muted-foreground mt-0.5">Shown when the form is closed</p>
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
                    <label htmlFor="fs-rc-email-field" className="block text-[11px] font-medium text-muted-foreground mb-1">Email Field</label>
                    <select id="fs-rc-email-field" value={s.respondentConfirmation?.emailFieldId || ""} onChange={(e) => { const rc = s.respondentConfirmation || {}; onUpdateSettings("respondentConfirmation", { ...rc, emailFieldId: e.target.value || null }); }}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20">
                      <option value="">Select an email field...</option>
                      {(fields || []).filter((f) => f.type === "email").map((f) => (
                        <option key={f.id} value={f.id}>{f.label || f.id}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fs-rc-subject" className="block text-[11px] font-medium text-muted-foreground mb-1">Subject</label>
                    <input id="fs-rc-subject" type="text" value={s.respondentConfirmation?.subject || ""} onChange={(e) => { const rc = s.respondentConfirmation || {}; onUpdateSettings("respondentConfirmation", { ...rc, subject: e.target.value }); }} placeholder="We received your response"
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20" />
                  </div>
                  <div>
                    <label htmlFor="fs-rc-message" className="block text-[11px] font-medium text-muted-foreground mb-1">Message</label>
                    <textarea id="fs-rc-message" rows={3} value={s.respondentConfirmation?.message || ""} onChange={(e) => { const rc = s.respondentConfirmation || {}; onUpdateSettings("respondentConfirmation", { ...rc, message: e.target.value }); }} placeholder="Thank you for your submission."
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-[13px] text-foreground focus:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none" />
                  </div>
                </>
              )}
            </div>
          </Section>
        </div>

        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
          <p className="text-[11px] text-muted-foreground">All settings are auto-saved</p>
          <button type="button" onClick={onClose} className="rounded-md bg-foreground hover:bg-foreground/90 px-4 py-1.5 text-[12px] font-medium text-white transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
