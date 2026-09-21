"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createField,
  createEmptyFormSchema,
  validateFormSchema,
} from "@/lib/form-schema";
import FormCanvas from "./FormCanvas";
import FormPreview from "./FormPreview";
import FieldTypeModal from "./FieldTypeModal";
import FormSettingsModal from "./FormSettingsModal";

export default function FormBuilder({
  initialSchema,
  formDetails,
  formId,
  savedSchema,
  formStatus: initialFormStatus = "draft",
  mode = "create",
}) {
  const router = useRouter();

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
      return null;
    }
  }, [formSchema, saveState, validation.valid, formId, formStatus, router]);

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

      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setPublishError(err.message || "Failed to publish form.");
    } finally {
      setPublishState("idle");
      isPublishingRef.current = false;
    }
  }, [publishState, formSchema, formId, router]);

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
    } catch (err) {
      setPublishError(err.message || "Failed to unpublish form.");
    } finally {
      setPublishState("idle");
    }
  }, [publishState, formId]);

  const handleCopyLink = useCallback(async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = publicUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [publicUrl]);

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

    if (targetIndex < 0 || targetIndex >= formSchema.fields.length) return;

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
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
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
            { id: "customize", label: "Builder", icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" },
            { id: "preview", label: "Preview", icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
            { id: "publish", label: "Publish", icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-foreground/5 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {saveState === "saving" && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Saving</span>
            </div>
          )}
          {saveState === "saved" && (
            <div className="flex items-center gap-1 text-[11px] text-success">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
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
                    ? "bg-foreground/5 text-foreground"
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
            <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
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
          <div className="w-full max-w-lg space-y-6 self-start pt-4">
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
                    className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2 text-[13px] font-medium text-white hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {publishState === "loading" ? (
                      <>
                        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
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
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                              </svg>
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
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Open Form
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={publishState === "loading"}
                      className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-white hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {publishState === "loading" ? (
                        <>
                          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {isDirty ? "Updating..." : "Publishing..."}
                        </>
                      ) : (
                        <>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
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
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
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
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-foreground/30 shrink-0" />
                  <span>Publish saves your latest changes and makes the form public in one step.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-foreground/30 shrink-0" />
                  <span>Copy the link and share it with anyone to collect responses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-foreground/30 shrink-0" />
                  <span>Unpublish hides the form from public access. Existing responses are kept.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-foreground/30 shrink-0" />
                  <span>Republishing reuses the same link — no new URL is created.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <FieldTypeModal
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
