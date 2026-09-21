import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateFormSchema } from "@/lib/form-schema";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";

export async function POST(request) {
  try {
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

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    if (!schema) {
      return NextResponse.json(
        { success: false, error: "Schema is required" },
        { status: 400 }
      );
    }

    const validation = validateFormSchema(schema);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: "Invalid schema", details: validation.errors },
        { status: 400 }
      );
    }

    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug);

    const form = await db.form.create({
      data: {
        title: title.trim(),
        slug,
        description: description || "",
        schema: JSON.stringify(schema),
        status: status || "draft",
      },
    });

    return NextResponse.json(
      { success: true, form: { ...form, schema } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create form" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const forms = await db.form.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, forms });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}
