"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
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

  const formatDate = (iso) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-2">
      {forms.map((form) => {
        const isPublished = form.status === "published";
        const copied = isCopied(form.id);
        return (
          <div
            key={form.id}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-white px-4 py-3.5 transition-colors md:flex-row md:items-center md:gap-4 md:px-5 hover:border-border-strong"
          >
            <div className="flex items-center gap-3 min-w-0 md:flex-none md:w-[7.5rem]">
              <StatusBadge status={isPublished ? "published" : "draft"} size="sm" className="shrink-0" />
            </div>

            <div className="flex-1 min-w-0">
              <Link href={`/forms/${form.id}/edit`} className="block text-sm font-medium text-foreground hover:text-primary transition-colors leading-snug break-words">
                {form.title}
              </Link>
              <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                Updated {formatDate(form.updatedAt)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 md:shrink-0 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:transition-opacity">
              <Button variant="secondary" size="sm" onClick={() => router.push(`/forms/${form.id}/edit`)}>
                <Icon name="edit" size="xs" aria-hidden="true" />
                Edit
              </Button>
              <Button variant="secondary" size="sm" onClick={() => router.push(`/forms/${form.id}/responses`)}>
                <Icon name="messageSquare" size="xs" aria-hidden="true" />
                Responses
              </Button>
              {isPublished && (
                <>
                  <a
                    href={`/f/${form.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Icon name="externalLink" size="xs" aria-hidden="true" />
                    Open
                  </a>
                  <Button
                    variant={copied ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleCopyLink(form.id)}
                    disabled={deletingId === form.id}
                  >
                    {copied ? (
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
                variant="outlineDestructive"
                size="sm"
                onClick={() => handleDelete(form.id)}
                disabled={deletingId === form.id}
              >
                <Icon name="trash" size="xs" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}