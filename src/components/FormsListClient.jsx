"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useToast } from "@/components/ui/Toast";

export default function FormsListClient({ forms: initialForms }) {
  const [forms, setForms] = useState(initialForms);
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();
  const { copy, isCopied } = useCopyToClipboard();
  const toast = useToast();

  const handleDelete = async (id) => {
    if (deletingId) return;
    if (!window.confirm("Are you sure you want to delete this form? This action cannot be undone.")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
      if (res.ok) {
        setForms((prev) => prev.filter((f) => f.id !== id));
        toast.success("Form deleted successfully.");
      } else {
        toast.error("Failed to delete form.");
      }
    } catch {
      toast.error("Failed to delete form.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = async (id) => {
    const url = `${window.location.origin}/f/${id}`;
    await copy(url, id);
    toast.success("Link copied to clipboard.");
  };

  return (
    <div className="space-y-1">
      {forms.map((form) => (
        <div
          key={form.id}
          className="group flex items-center gap-4 rounded-lg border border-border bg-white px-4 py-3.5 hover:border-border/80 hover:shadow-sm transition-all"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-medium text-foreground truncate">
                {form.title}
              </h3>
              <StatusBadge status={form.status === "published" ? "published" : "draft"} size="sm" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(form.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              {form.updatedAt !== form.createdAt &&
                ` \u00b7 Updated ${new Date(form.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" size="sm" onClick={() => router.push(`/forms/${form.id}/edit`)}>
              <Icon name="edit" size="xs" aria-hidden="true" />
              Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={() => router.push(`/forms/${form.id}/responses`)}>
              <Icon name="messageSquare" size="xs" aria-hidden="true" />
              Responses
            </Button>
            {form.status === "published" && (
              <>
                <a
                  href={`/f/${form.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Icon name="externalLink" size="xs" aria-hidden="true" />
                  Open
                </a>
                <Button
                  variant={isCopied(form.id) ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => handleCopyLink(form.id)}
                  disabled={deletingId === form.id}
                >
                  {isCopied(form.id) ? (
                    <>
                      <Icon name="check" size="xs" className="stroke-2" aria-hidden="true" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Icon name="copy" size="xs" aria-hidden="true" />
                      Copy
                    </>
                  )}
                </Button>
              </>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(form.id)}
              disabled={deletingId === form.id}
            >
              <Icon name="trash" size="xs" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}