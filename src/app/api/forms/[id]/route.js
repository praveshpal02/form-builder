import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/session";
import { validateFormSchema } from "@/lib/form-schema";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";

async function checkOwnership(db, formId, userId) {
  const form = await db.form.findUnique({ where: { id: formId } });
  if (!form) return { form: null, error: "Form not found", status: 404 };
  if (form.userId !== userId) return { form: null, error: "Forbidden", status: 403 };
  return { form, error: null, status: 200 };
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const form = await db.form.findUnique({ where: { id } });

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Form not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      form: { ...form, schema: JSON.parse(form.schema) },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch form" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = getDb();

    const ownership = await checkOwnership(db, id, user.id);
    if (ownership.error) {
      return NextResponse.json(
        { success: false, error: ownership.error },
        { status: ownership.status }
      );
    }

    const existing = ownership.form;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const { title, description, schema, status } = body;

    if (title !== undefined && (!title || !title.trim())) {
      return NextResponse.json(
        { success: false, error: "Title cannot be empty" },
        { status: 400 }
      );
    }

    if (schema) {
      const validation = validateFormSchema(schema);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: "Invalid schema", details: validation.errors },
          { status: 400 }
        );
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (schema !== undefined) updateData.schema = JSON.stringify(schema);
    if (status !== undefined) updateData.status = status;

    // Generate slug on first publish if missing
    if (status === "published" && !existing.slug) {
      const titleForSlug = title !== undefined ? title.trim() : existing.title;
      const baseSlug = generateSlug(titleForSlug);
      const slug = await ensureUniqueSlug(baseSlug, id);
      updateData.slug = slug;
    }

    const form = await db.form.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      form: { ...form, schema: JSON.parse(form.schema) },
    });
  } catch (error) {
    console.error("Update form error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update form" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = getDb();

    const ownership = await checkOwnership(db, id, user.id);
    if (ownership.error) {
      return NextResponse.json(
        { success: false, error: ownership.error },
        { status: ownership.status }
      );
    }

    await db.form.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete form error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete form" },
      { status: 500 }
    );
  }
}