"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  createField,
  createEmptyFormSchema,
  validateFormSchema,
} from "@/lib/form-schema";
import FormCanvas from "./FormCanvas";
import FormPreview from "./FormPreview";
import FieldTypeModal from "./FieldTypeModal";
import FormSettingsModal from "./FormSettingsModal";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";

export default function FormBuilder({
  initialSchema,
  formDetails,
  formId,
  savedSchema,
  formStatus: initialFormStatus = "draft",
  mode = "create",
}) {
  const [formSchema, setFormSchema] = useState(() => {
    const base = initialSchema
      ? { ...initialSchema }
      : { ...createEmptyFormSchema() };

    base.title = formDetails?.name || base.name || "Untitled Form";
    base.description = formDetails?.description || base.description || "";
    base.settings = {
      ...base.settings,
      subject: formDetails?.subject || base.subject || "",
      notificationEmails: formDetails?.notificationEmails
        ? [...formDetails.notificationEmails]
        : base.notificationEmails || [],
    };

    return base;
  });

  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [isFieldPickerOpen, setIsFieldPickerOpen] = useState(false);
  const [fieldInsertIndex, setFieldInsertIndex] = useState(null);
  const [isFormSettingsOpen, setIsFormSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("customize");

  const [saveState, setSaveState] = useState("idle");
  const [saveError, setSaveError] = useState(null);
  const [lastSavedString, setLastSavedString] = useState(
    savedSchema ? JSON.stringify(savedSchema) : null
  );

  const [formStatus, setFormStatus] = useState(initialFormStatus);
  const [publishState, setPublishState] = useState("idle");
  const [publishError, setPublishError] = useState(null);
  const [copied, setCopied] = useState(false);

  const isPublishingRef = useRef(false);
  const toast = useToast();

  const isDirty = useMemo(() => {
    if (!lastSavedString) return true;
    return JSON.stringify(formSchema) !== lastSavedString;
  }, [formSchema, lastSavedString]);

  const validation = useMemo(() => {
    return validateFormSchema(formSchema);
  }, [formSchema]);

  const publicUrl = useMemo(() => {
    if (!formId) return null;
    if (typeof window !== "undefined") {
      return `${window.location.origin}/f/${formId}`;
    }
    return `/f/${formId}`;
  }, [formId]);

  const handleSave = useCallback(async () => {
    if (saveState === "saving") return null;
    if (!validation.valid) return null;
    if (!formId) return null;

    setSaveState("saving");
    setSaveError(null);

    try {
      const body = {
        title: formSchema.title || "Untitled Form",
        description: formSchema.description || "",
        schema: formSchema,
        status: formStatus,
      };

      const res = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save form");
      }

      setLastSavedString(JSON.stringify(formSchema));
      setSaveState("saved");

      setTimeout(() => setSaveState("idle"), 2000);
      return data;
    } catch (err) {
      setSaveState("error");
      setSaveError(err.message);
      toast.error("Failed to save form. Please try again.");
      return null;
    }
  }, [formSchema, saveState, validation.valid, formId, formStatus, toast]);

  const handlePublish = useCallback(async () => {
    if (publishState === "loading") return;
    if (!formId) return;

    setPublishState("loading");
    setPublishError(null);
    isPublishingRef.current = true;

    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formSchema.title || "Untitled Form",
          description: formSchema.description || "",
          schema: formSchema,
          status: "published",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish form");
      }

      setLastSavedString(JSON.stringify(formSchema));
      setFormStatus("published");
      setSaveState("saved");
      toast.success("Form published successfully.");

      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setPublishError(err.message || "Failed to publish form.");
      toast.error("Failed to publish form.");
    } finally {
      setPublishState("idle");
      isPublishingRef.current = false;
    }
  }, [publishState, formSchema, formId, toast]);

  const handleUnpublish = useCallback(async () => {
    if (publishState === "loading") return;
    if (!formId) return;

    setPublishState("loading");
    setPublishError(null);

    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to unpublish form");
      }

      setFormStatus("draft");
      toast.success("Form unpublished.");
    } catch (err) {
      setPublishError(err.message || "Failed to unpublish form.");
      toast.error("Failed to unpublish form.");
    } finally {
      setPublishState("idle");
    }
  }, [publishState, formId, toast]);

  const handleCopyLink = useCallback(async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = publicUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      toast.success("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [publicUrl, toast]);

  const autoSaveTimer = useRef(null);
  useEffect(() => {
    if (isPublishingRef.current) return;
    if (!isDirty || !validation.valid || saveState === "saving") return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (!isPublishingRef.current) {
        handleSave();
      }
    }, 1000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [isDirty, validation.valid, saveState, handleSave]);

  const handleOpenFieldPicker = (index = null) => {
    const targetIdx = index !== null ? index : formSchema.fields.length;
    setFieldInsertIndex(targetIdx);
    setIsFieldPickerOpen(true);
  };

  const handleSelectFieldType = (type) => {
    const newField = createField(type);
    const targetIdx =
      fieldInsertIndex !== null ? fieldInsertIndex : formSchema.fields.length;

    const newFields = [...formSchema.fields];
    newFields.splice(targetIdx, 0, newField);

    setFormSchema((prev) => ({
      ...prev,
      fields: newFields,
    }));

    setSelectedFieldId(newField.id);
  };

  const handleUpdateField = (fieldId, updates) => {
    setFormSchema((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const handleDeleteField = (fieldId) => {
    setFormSchema((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
    toast.info("Field removed.");
  };

  const handleDuplicateField = (fieldId) => {
    const index = formSchema.fields.findIndex((f) => f.id === fieldId);
    if (index === -1) return;

    const original = formSchema.fields[index];
    const duplicated = createField(original.type, {
      ...original,
      id: undefined,
      label: `${original.label || "Field"} (Copy)`,
    });

    const newFields = [...formSchema.fields];
    newFields.splice(index + 1, 0, duplicated);

    setFormSchema((prev) => ({
      ...prev,
      fields: newFields,
    }));
    setSelectedFieldId(duplicated.id);
  };

  const handleMoveField = (fieldId, directionOrTargetIndex) => {
    const index = formSchema.fields.findIndex((f) => f.id === fieldId);
    if (index === -1) return;

    let targetIndex;
    if (typeof directionOrTargetIndex === "number") {
      targetIndex = directionOrTargetIndex;
    } else {
      targetIndex = directionOrTargetIndex === "up" ? index - 1 : index + 1;
    }

    if (targetIndex < 0 || targetIndex > formSchema.fields.length) return;

    const newFields = [...formSchema.fields];
    const [movedItem] = newFields.splice(index, 1);
    newFields.splice(targetIndex, 0, movedItem);

    setFormSchema((prev) => ({
      ...prev,
      fields: newFields,
    }));
  };

  const handleUpdateMeta = (key, value) => {
    const settingsKeys = ["subject", "notificationEmails", "locale"];
    if (settingsKeys.includes(key)) {
      setFormSchema((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          [key]: value,
        },
      }));
    } else {
      setFormSchema((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleUpdateSettings = (key, value) => {
    setFormSchema((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  const isPublished = formStatus === "published";

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-background">
      <header className="sticky top-[3.5rem] z-30 flex items-center justify-between border-b border-border bg-white/90 backdrop-blur-md px-5 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/forms"
            className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="arrowLeft" size="sm" aria-hidden="true" />
            <span className="hidden sm:inline">Forms</span>
          </Link>
          <span className="text-border text-[12px]">/</span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-[13px] text-foreground truncate max-w-[160px] sm:max-w-xs">
              {formSchema.title || "Untitled Form"}
            </span>
            {isPublished ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-bg border border-success-border px-2 py-0.5 text-[10px] font-medium text-success shrink-0">
                <span className="h-1 w-1 rounded-full bg-success" />
                Live
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                Draft
              </span>
            )}
          </div>
        </div>

        <nav className="hidden sm:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2" aria-label="Form editor tabs">
          {[
            { id: "customize", label: "Builder", iconName: "layout" },
            { id: "preview", label: "Preview", iconName: "eye" },
            { id: "publish", label: "Publish", iconName: "send" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon name={tab.iconName} size="sm" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {saveState === "saving" && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Icon name="loader" size="xs" className="animate-spin" aria-hidden="true" />
              <span>Saving</span>
            </div>
          )}
          {saveState === "saved" && (
            <div className="flex items-center gap-1 text-[11px] text-success">
              <Icon name="check" size="xs" strokeWidth={2} aria-hidden="true" />
              <span>Saved</span>
            </div>
          )}

          <nav className="sm:hidden flex items-center gap-0.5" aria-label="Form editor tabs">
            {[
              { id: "customize", label: "Build" },
              { id: "preview", label: "Preview" },
              { id: "publish", label: "Publish" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setIsFormSettingsOpen(true)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Icon name="settings" size="sm" className="text-muted-foreground" aria-hidden="true" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {activeTab === "customize" ? (
        <FormCanvas
          title={formSchema.title}
          description={formSchema.description}
          fields={formSchema.fields}
          settings={formSchema.settings}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
          onUpdateField={handleUpdateField}
          onDeleteField={handleDeleteField}
          onDuplicateField={handleDuplicateField}
          onMoveField={handleMoveField}
          onUpdateMeta={handleUpdateMeta}
          onOpenFieldPicker={handleOpenFieldPicker}
          showSubmitButton={false}
        />
      ) : activeTab === "preview" ? (
        <FormPreview
          title={formSchema.title}
          description={formSchema.description}
          fields={formSchema.fields}
          settings={formSchema.settings}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex justify-center bg-background">
          <div className="w-full max-w-2xl space-y-6 self-start pt-4">
            <div className="rounded-lg border border-border bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[13px] font-semibold text-foreground">
                  Publish Status
                </h2>
                {isPublished ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg border border-success-border px-2.5 py-0.5 text-[11px] font-medium text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    Draft
                  </span>
                )}
              </div>

              {publishError && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
                  {publishError}
                </div>
              )}

              {!isPublished ? (
                <div className="space-y-3">
                  <p className="text-[13px] text-muted-foreground">
                    Publish your form to make it accessible via a public link. Anyone with the link will be able to view and submit the form.
                  </p>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishState === "loading"}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-[13px] font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {publishState === "loading" ? (
                      <>
                        <Icon name="loader" size="sm" className="animate-spin" aria-hidden="true" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Icon name="send" size="sm" strokeWidth={2} aria-hidden="true" />
                        Publish Form
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[13px] text-muted-foreground">
                    {isDirty
                      ? "You have unsaved changes. Publish to make them live."
                      : "Your form is live and accessible to anyone with the link."}
                  </p>

                  {publicUrl && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Public URL
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0 rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground font-mono truncate">
                          {publicUrl}
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className={`inline-flex items-center gap-1 rounded-md border px-3 py-2 text-[12px] font-medium transition-colors shrink-0 ${
                            copied
                              ? "border-success-border bg-success-bg text-success"
                              : "border-border bg-white text-foreground hover:bg-muted"
                          }`}
                        >
{copied ? (
                              <>
                                <Icon name="check" size="xs" strokeWidth={2} aria-hidden="true" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Icon name="copy" size="xs" aria-hidden="true" />
                                Copy
                              </>
                            )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {publicUrl && (
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3.5 py-2 text-[12px] font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Icon name="externalLink" size="xs" aria-hidden="true" />
                        Open Form
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={publishState === "loading"}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {publishState === "loading" ? (
                        <>
                          <Icon name="loader" size="sm" className="animate-spin" aria-hidden="true" />
                          {isDirty ? "Updating..." : "Publishing..."}
                        </>
                      ) : (
                        <>
                          <Icon name="send" size="sm" strokeWidth={2} aria-hidden="true" />
                          {isDirty ? "Update & Publish" : "Publish"}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Unpublish this form? The public link will stop working until you publish it again.")) {
                          handleUnpublish();
                        }
                      }}
                      disabled={publishState === "loading"}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3.5 py-2 text-[12px] font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Icon name="rotateCcw" size="xs" strokeWidth={1.5} aria-hidden="true" />
                      Unpublish
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-white p-5">
              <h3 className="text-[13px] font-semibold text-foreground mb-3">
                How it works
              </h3>
              <ul className="space-y-2 text-[13px] text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                  <span>Publish saves your latest changes and makes the form public in one step.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                  <span>Copy the link and share it with anyone to collect responses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                  <span>Unpublish hides the form from public access. Existing responses are kept.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                  <span>Republishing reuses the same link — no new URL is created.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <FieldTypeModal
        key={isFieldPickerOpen ? "open" : "closed"}
        isOpen={isFieldPickerOpen}
        onClose={() => setIsFieldPickerOpen(false)}
        onSelectType={handleSelectFieldType}
      />

      <FormSettingsModal
        isOpen={isFormSettingsOpen}
        onClose={() => setIsFormSettingsOpen(false)}
        title={formSchema.title}
        description={formSchema.description}
        fields={formSchema.fields}
        settings={formSchema.settings}
        onUpdateMeta={handleUpdateMeta}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
