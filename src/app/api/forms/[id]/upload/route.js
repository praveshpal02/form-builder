import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";

const MAX_UPLOAD_SIZE_MB = 25;

function sanitizeFileExt(name) {
  const parts = name.split(".");
  const ext = parts.length > 1 ? parts.pop().toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return ext ? `.${ext}` : "";
}

function acceptsFile(name, type, accept) {
  if (!accept) return true;
  const ext = sanitizeFileExt(name).replace(".", "");
  const acceptList = accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (acceptList.length === 0) return true;
  return acceptList.some((a) => {
    if (a === "image/*" && type.startsWith("image/")) return true;
    if (a === "video/*" && type.startsWith("video/")) return true;
    if (a === "audio/*" && type.startsWith("audio/")) return true;
    if (a === "*" || a === "*/*") return true;
    if (a.startsWith(".")) return a.replace(".", "") === ext;
    return a === type;
  });
}

function safeFilename(name) {
  return String(name || "file").replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 100) || "file";
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const form = await db.form.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!form || form.status !== "published") {
      return NextResponse.json({ success: false, error: "Form not found" }, { status: 404 });
    }

    const { env } = getCloudflareContext();
    const bucket = env.FORM_UPLOADS;
    if (!bucket) {
      return NextResponse.json({ success: false, error: "File uploads are not configured." }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const maxSizeMB = Number(formData.get("maxSizeMB")) || MAX_UPLOAD_SIZE_MB;
    const accept = String(formData.get("accept") || "");

    if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function" || file.size === 0) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }

    const serverCap = Math.min(maxSizeMB, MAX_UPLOAD_SIZE_MB);
    if (file.size > serverCap * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: `File exceeds the ${serverCap}MB limit.` },
        { status: 413 }
      );
    }

    if (!acceptsFile(file.name, file.type, accept)) {
      return NextResponse.json({ success: false, error: "This file type is not accepted." }, { status: 415 });
    }

    const key = `uploads/${id}/${crypto.randomUUID()}${sanitizeFileExt(file.name)}`;
    await bucket.put(key, file, {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
      customMetadata: { filename: safeFilename(file.name) },
    });

    const filename = key.split("/").pop();
    const url = `/api/forms/${id}/files/${encodeURIComponent(filename)}`;

    return NextResponse.json(
      {
        success: true,
        file: {
          key,
          name: safeFilename(file.name),
          size: file.size,
          type: file.type || "application/octet-stream",
          url,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: "Upload failed." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const key = body && typeof body.key === "string" ? body.key : "";
    if (!key.startsWith(`uploads/${id}/`)) {
      return NextResponse.json({ success: false, error: "Invalid file key." }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const bucket = env.FORM_UPLOADS;
    if (!bucket) {
      return NextResponse.json({ success: false, error: "File uploads are not configured." }, { status: 503 });
    }

    await bucket.delete(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Delete failed." }, { status: 500 });
  }
}