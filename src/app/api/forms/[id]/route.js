import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateFormSchema } from "@/lib/form-schema";
import { ensureUniqueSlug } from "@/lib/slug";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
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
    const { id } = await params;
    const existing = await db.form.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Form not found" },
        { status: 404 }
      );
    }

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

    const form = await db.form.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      form: { ...form, schema: JSON.parse(form.schema) },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update form" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const existing = await db.form.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Form not found" },
        { status: 404 }
      );
    }

    await db.form.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete form" },
      { status: 500 }
    );
  }
}
