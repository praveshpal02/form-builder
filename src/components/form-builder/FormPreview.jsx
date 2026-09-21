"use client";

import { useState, useMemo } from "react";
import FormRenderer from "@/components/form-renderer/FormRenderer";

export default function FormPreview({ title, description, fields, settings }) {
  const [resetKey, setResetKey] = useState(0);

  const schema = useMemo(() => ({
    title: title || "Untitled Form",
    description: description || "",
    fields: fields || [],
    settings: settings || {},
  }), [title, description, fields, settings]);

  if ((!fields || fields.length === 0) && (!title || !title.trim())) {
    return (
      <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex justify-center bg-background">
        <div className="w-full max-w-lg flex flex-col items-center justify-center min-h-[500px]">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 px-6 text-center bg-white">
            <p className="text-[13px] text-muted-foreground">No fields to preview. Add some in the Builder tab.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <FormRenderer
        key={resetKey}
        schema={schema}
        formId={null}
        preview={true}
        onPreviewReset={() => setResetKey((k) => k + 1)}
      />
    </div>
  );
}
